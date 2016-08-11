
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
import { arraysDifferent }   from './props-different'

var requestParams = parseSearchParams(location.search);

var overridePage = requestParams.page!=null ? +(requestParams.page) : null;

const PAGE_INIT = -1;

export class MetaFormContext extends ClientProps implements IFormContext, IClientProps {
  constructor(config: IFormConfig, metamodel:IModelTypeComposite<any>, data:any={}) {
    super();
    this._config = config;
    if (null != overridePage) {
      config.allowNextWhenInvalid = true;
    }
    this._metamodel = metamodel;

    let page = null != overridePage ? overridePage-(config.usePageIndex?0:1) : PAGE_INIT;
    this._viewmodel = new ModelView(metamodel, data, page);

    this.pageBack = clickHandler(this.updatePage, this, -1);
    this.pageNext = clickHandler(this.updatePage, this, +1);

    this._listeners = new ListenerManager<()=>void>();
    this._promises = [];

    if (null != this._config.onFormInit) {
      var update = this._config.onFormInit(this);
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
    }
  }

  pageNext:(event:UIEvent)=>void;
  pageBack:(event:UIEvent)=>void;

  pageNextAllowed():boolean {
    if (this.isBusy()) {
      return false;
    }

    let vm = this._viewmodel;
    let hasNext = vm.currentPageIndex < vm.getPages().length;

    let config = this._config;

    let validating = (
      config.validateOnUpdateIfInvalid 
      || config.validateOnUpdateIfInvalid) && !config.allowNextWhenInvalid;
 

    return hasNext && (!validating || vm.isPageValid(null)); 
  }
  pageBackAllowed():boolean {
    if (this.isBusy()) {
      return false;
    }

    let vm = this._viewmodel;
    return vm.currentPageIndex > 0;
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

  getConclusion() {
    return this._conclusion;
  }

  setConclusion(conclusion:IConclusionMessage) {
    if (null != this._conclusion && this._conclusion !== conclusion) {
      throw new Error(`form already has a conclusion: ${this._conclusion} ${conclusion}`);
    }
    this._conclusion = conclusion; 
    this._updateViewModel(this._viewmodel.gotoPage(this._viewmodel.getPages().length));
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
  updateModelTransactional(updater:IModelUpdater, skipValidation?:boolean) {
    let newModel = updater(this._viewmodel, this);
    let config = this._config;
    let nextUpdate:Promise<IModelUpdater> = Promise.resolve((x:IModelView<any>) => x);
    if (config.onModelUpdate) {
      this._viewmodel = newModel;
      nextUpdate = config.onModelUpdate(this);
    }
    nextUpdate.then(
      (updater) => {
        let updatedModel = updater(newModel, this);
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
            clearTimeout(this._debounceValidationTimeout);
          }
          this._debounceValidationTimeout = setTimeout(validator, config.validateDebounceMS);
        }
      }
    );
    this._promiseInFlight(nextUpdate);

  }
  private _debounceValidationTimeout: number;

  _updateViewModel(viewmodel:IModelView<any>) {
    this._viewmodel = viewmodel;
    this._notifyAll();
  }

  _notifyAll() {
    this._listeners.all.forEach((x) => x());
  }

  updatePage(step:number) {
    let model = this._viewmodel;

    let nextModel:Promise<IModelView<any>>;
    
    if (step < 0) {
      nextModel = Promise.resolve(model);
    } else if (model.currentPageNo == model.getPages().length) {
      nextModel = model.validateFull();
    } else {
      nextModel = model.validatePage();
    }
    
    let promise = nextModel
      .then((validatedModel) => {
        var override = false;
        if (this._config.allowNextWhenInvalid) {
          if (!arraysDifferent(model.getPageMessages(), validatedModel.getPageMessages())) {
            override = true;
          }
        }
        if (step < 0 || validatedModel.isPageValid(null) || override) {
          
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
            if (step < 0 || serverValidatedModel.isPageValid(null)) {
              var nextPageModel = serverValidatedModel.changePage(step);
              return nextPageModel;
            } else {
              console.log("failed page transition", this);
              if (this._config.onFailedPageTransition) {
                this._config.onFailedPageTransition(this);
              }
            }
            return serverValidatedModel;
          });
        }
        return validatedModel;
      })
      .then((x) => this._updateViewModel(x))
      .then(() => {
          if (this._config.onAfterPageTransition) {
            this._config.onAfterPageTransition(this);
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
      promise.then(remove,remove);
      if (this._promises.length == 1) {
        let delay = this._config.busyDelayMS;
        this._promisesBusyTime = Date.now() + delay;
        this._promisesTimeout = setTimeout(this._notifyAll.bind(this), delay);
      }
    }
  }

  private _promiseResolved(promise: Promise<any>) {
    let index = this._promises.indexOf(promise);
    if (-1 != index) {
      this._promises.splice(index,1);
      if (this._promises.length === 0) {
        this._notifyAll(); // should have notified, anyway?
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
}

