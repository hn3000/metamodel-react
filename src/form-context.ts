
import {
  IClientProps,
  ClientProps,
  IModelTypeComposite,
  IModelView,
  ModelView,
  MessageSeverity
} from '@hn3000/metamodel';

import {
  IConclusionMessage,
  IFormContext,
  IFormConfig,
  IModelUpdater
} from './api';

import {
  ListenerManager,
  clickHandler
} from './listener-manager';

import { parseSearchParams } from './search-params';
import {
  arraysDifferent
  //,differentProps
}   from './props-different'

import * as React from 'react';

var requestParams = parseSearchParams(location && location.search);

var overrideFocus = requestParams.overrideFocus!=null ? requestParams.overrideFocus[0] : null;
var overridePage = requestParams.overridePage!=null ? +(requestParams.overridePage[0]) : null;

const PAGE_INIT = -1;

export class MetaFormContext extends ClientProps implements IFormContext, IClientProps {
  constructor(config: IFormConfig, metamodel:IModelTypeComposite<any>, data:any={}) {
    super();
    this._config = config;

    this._metamodel = metamodel;

    let page = null != overridePage ? overridePage-(config.usePageIndex?0:1) : PAGE_INIT;
    this._viewmodel = new ModelView(metamodel, data, page);

    if (null != overrideFocus) {
      this._viewmodel = this._viewmodel.withFocusedPage(overrideFocus);
    }

    this.pageBack = clickHandler(this.updatePage, this, -1);
    this.pageNext = clickHandler(this.updatePage, this, +1);

    this._listeners = new ListenerManager<()=>void>();
    this._promises = [];

    if (null != this._config.onFormInit) {
      var update = Promise.resolve(this)
          .then((ctx)=> this._config.onFormInit(ctx));

      update.then((x) => {
        var model = this._viewmodel;
        if (typeof x === 'function') {
          let clientUpdate = x as IModelUpdater;
          model = clientUpdate(model, this);
        } else if (null != x) {
          model = model.withAddedData(x);
        }
        if (null == overridePage && model.currentPageIndex == PAGE_INIT) {
          model = model.changePage(1);
        }
        this._updateViewModel(model);
      });
      this._promiseInFlight(update);
    } else {
      this._updateViewModel(this._viewmodel.changePage(1));
    }
  }

  pageNext:(event:React.SyntheticEvent<HTMLElement>)=>void;
  pageBack:(event:React.SyntheticEvent<HTMLElement>)=>void;

  hasNextPage():boolean {
    let vm = this._viewmodel;
    return vm.currentPageIndex < vm.getPages().length;
  }

  hasPreviousPage():boolean {
    let vm = this._viewmodel;
    return vm.currentPageIndex > 0 && !this.isFinished();
  }

  isFinished():boolean {
    return null != this._conclusion || !this.hasNextPage();
  }

  isValid() {
    return this._viewmodel.arePagesUpToCurrentValid() && this._viewmodel.isPageValid();
  }

  isPageValid(aliasOrIndex?: string|number) {
    let adjustedIndex = aliasOrIndex;
    if (!this._config.usePageIndex) {
      let parsedIndex = Number.parseInt(''+aliasOrIndex);
      if (parsedIndex == aliasOrIndex) {
        adjustedIndex = parsedIndex - 1;
      }
    }
    return this._viewmodel.isPageValid(adjustedIndex);
  }

  get config(): IFormConfig {
    return this._config;
  }
  get metamodel(): IModelTypeComposite<any> /*</any>*/ {
    return this._metamodel;
  }
  get viewmodel(): IModelView<any> /*</any>*/ {
    return this._viewmodel;
  }
  get currentPage(): number {
    if (!this._config.usePageIndex) {
      return this._viewmodel.currentPageNo;
    }
    return this._viewmodel.currentPageIndex;
  }

  get currentPageAlias(): string {
    return this._viewmodel.currentPageAlias;
  }

  getConclusion() {
    return this._conclusion;
  }

  setConclusion(conclusion:IConclusionMessage) {
    /*if (null != this._conclusion && this._conclusion !== conclusion) {
      throw new Error(`form already has a conclusion: ${this._conclusion} ${conclusion}`);
    }*/
    this._conclusion = conclusion;

    // ensure page reflects that the form is concluded
    let endPage = this._viewmodel.getPages().length;
    if (this._viewmodel.currentPageIndex != endPage) {
      Promise.resolve().then(() => {
        if (this._viewmodel.currentPageIndex != endPage) {
          this._updateViewModel(this._viewmodel.gotoPage(endPage));
        }
      }).then(null, (xx: any) => (console.log('unhandled exception', xx), null));
    }
  }

  /*
   * similar to redux: returns the unsubscribe function
   * listeners always called asynchronously: validation runs before
   * listeners are notfied
   */
  subscribe(listener:()=>any):()=>void {
    return this._listeners.subscribe(listener);
  }

  updateModel(field:string, value:any) {
    this.updateModelTransactional(model => model.withChangedField(field,value));
  }
  updateModelTransactional(updater:IModelUpdater, skipValidation?:boolean):Promise<IModelView<any>> {
    if (this.isBusy()) {
      //let error = new Error('causality violation: updateModelTransactional not allowed while already busy');
      //console.warn('updateModelTransactional called while busy, deferring action');
      return Promise.all(this._promises).then(() => {
        //console.log('updateModelTransactional - next attempt, busy: ', this.isBusy());
        return this.updateModelTransactional(updater, skipValidation);
      });
    }

    let newModel = updater(this._viewmodel, this);
    let config = this._config;
    //this._viewmodel = newModel;
    this._updateViewModel(newModel);

    let nextUpdate  = Promise.resolve((x:IModelView<any>, c: IFormContext) => x);
    if (config.onModelUpdate) {
      nextUpdate = nextUpdate.then(() => config.onModelUpdate(this));
    }
    const result = nextUpdate.then(
      (updater2) => {
        let updatedModel = updater2(newModel, this);
        this._updateViewModel(updatedModel);
        var needsValidation = config.validateOnUpdate;
        if (!needsValidation && config.validateOnUpdateIfInvalid) {
          needsValidation = !newModel.isValid();
        }
        if (!skipValidation && needsValidation) {
          let validator = () => {
            let validated = this._viewmodel.validateDefault();
            validated.then((x) => this._updateViewModel(x));
            this._debounceValidationTimeout = null;
          };
          if (this._debounceValidationTimeout) {
            window.clearTimeout(this._debounceValidationTimeout);
          }
          this._debounceValidationTimeout = window.setTimeout(validator, config.validateDebounceMS);

          return updatedModel;
        }
      }
    );
    this._promiseInFlight(nextUpdate);

    return result;
  }
  private _debounceValidationTimeout: number;

  _updateViewModel(viewmodel:IModelView<any>) {
    if (this._viewmodel.currentPageIndex > viewmodel.currentPageIndex) {
      try {
        throw new Error('stacktrace for debugging');
      } catch (xx) {
        console.debug(xx);
      }
    }
    this._viewmodel = viewmodel;
    this._maybeNotifyAll();
  }

  _maybeNotifyAll() {
    const lnfy = this._lastNotified;
    if (
      !lnfy
      || (lnfy.busy !== (this._promises && 0 !== this._promises.length))
      || (lnfy.viewmodel != this._viewmodel)
      || (lnfy.conclusion != this._conclusion)
    ) {
      this._lastNotified = {
        viewmodel: this._viewmodel,
        conclusion: this._conclusion,
        busy: this._promises && 0 !== this._promises.length
      };
      this._notifyAll();
    } else {
      if (console.debug) {
        try {
          throw new Error();
        } catch (xx) {
          console.debug('skipped notifyAll', this._lastNotified, this._viewmodel, this._conclusion, xx)
        }
      }
    }
  }
  _notifyAll() {
      //console.log('notify all', this._viewmodel.currentPageIndex);
    this._listeners.all.forEach((x) => {
      x();
    });
    //console.log('/notify all');
  }

  updatePage(step:number) {
    let originalModel = this._viewmodel;

    let nextModel:Promise<IModelView<any>>;

    if (step < 0) {
      nextModel = Promise.resolve(originalModel);
    } else if (originalModel.currentPageNo == originalModel.getPages().length) {
      nextModel = originalModel.validateFull();
    } else {
      nextModel = originalModel.validatePage();
    }

    let promise = nextModel
      .then((validatedModel) => {
        let isSubmit = originalModel.currentPageNo == originalModel.getPages().length;

        let override = this._config.allowNavigationWithInvalidPages;

        if (step < 0 || override || validatedModel.isPageValid(null)) {

          var promise:Promise<IModelView<any>>;

          if (this._config.onPageTransition) {

            // replace model without notification
            // so onPageTransition handler starts with this one
            this._viewmodel = validatedModel;

            let moreValidation = this._config.onPageTransition(this, step);
            if (null == moreValidation) {
              moreValidation = Promise.resolve([]);
            }
            promise = moreValidation.then((update) => {
              // clear out status messages first
              var result = this._viewmodel.withStatusMessages([]);
              if (Array.isArray(update)) {
                result = result.withValidationMessages(update);
              } else if (typeof update === 'function') {
                result = update(result, this);
              }
              return result;
            }, () => {
              return validatedModel.withValidationMessages([
                { property:"", msg:"internal error (page transition handler)", code:'transition-error', severity: MessageSeverity.ERROR }
              ])
            });
          } else {
            promise = Promise.resolve(validatedModel);
          }

          return promise.then((serverValidatedModel) => {
            if (step < 0 || (
              serverValidatedModel.isPageValid(null)
              && 0 == serverValidatedModel.getStatusMessages().length
            )) {
              var nextPageModel = serverValidatedModel.changePage(step);
              return nextPageModel;
            }
            if (serverValidatedModel.currentPageIndex == originalModel.currentPageIndex) {
              console.log("failed page transition", this);
            }
            return serverValidatedModel;
          });
        }
        return validatedModel;
      })
      .then((x) => this._updateViewModel(x))
      .then(() => {
        let currentIndex = this._viewmodel.currentPageIndex;
        if (originalModel.currentPageIndex == currentIndex) {
          if (this._config.onFailedPageTransition) {
            this._config.onFailedPageTransition(this);
          }
        } else {
          if (this._config.onAfterPageTransition) {
            this._config.onAfterPageTransition(this);
          }
        }
      });

    this._promiseInFlight(promise);
  }

  public isBusy() {
    return this._promises.length > 0 && Date.now() > this._promisesBusyTime;
  }

  private _promiseInFlight(promise: Promise<any>) {
    let index = this._promises.indexOf(promise);
    if (-1 == index) {
      this._promises.push(promise);
      let remove = (x:any) => (this._promiseResolved(promise),x);
      let removeX = (x:any) => (console.log('promise unhandled exception', x), remove(x));
      promise.then(remove,removeX);
      if (this._promises.length == 1) {
        let delay = this._config.busyDelayMS;
        this._promisesBusyTime = Date.now() + delay;
        this._promisesTimeout = window.setTimeout(() => {
          this._promisesTimeout = null;
          this._maybeNotifyAll();
        }, delay);
      }
    }
  }

  private _promiseResolved(promise: Promise<any>) {
    let index = this._promises.indexOf(promise);
    if (-1 != index) {
      this._promises.splice(index,1);
      if (this._promises.length === 0) {
        if (this._promisesTimeout) {
          window.clearTimeout(this._promisesTimeout);
          this._promisesTimeout = null;
        }
        this._maybeNotifyAll();
      }
    }
  }

  private _listeners:ListenerManager<()=>void>;
  private _config:IFormConfig;
  private _metamodel: IModelTypeComposite<any>;   //</any>
  private _viewmodel: IModelView<any>;            //</any>

  private _promises: Promise<any>[]; // </any>
  private _promisesBusyTime:number;
  private _promisesTimeout:number;

  private _conclusion:IConclusionMessage;

  private _lastNotified: {
    conclusion: IConclusionMessage;
    viewmodel: IModelView<any>;
    busy: boolean;
  };
}

