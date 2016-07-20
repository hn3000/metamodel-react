
import { 
  IClientProps,
  ClientProps,
  IModelTypeComposite,
  IModelView,
  ModelView
 } from '@hn3000/metamodel';

import {
  IFormContext,
  IFormConfig
} from './api';

import {
  ListenerManager,
  clickHandler
} from './listener-manager';

export class MetaFormContext extends ClientProps implements IFormContext, IClientProps {
  constructor(config: IFormConfig, metamodel:IModelTypeComposite<any>, data:any={}) {
    super();
    this._config = config;
    this._metamodel = metamodel;
    this._viewmodel = new ModelView(metamodel, data, -1);

    this.pageBack = clickHandler(this.updatePage, this, -1);
    this.pageNext = clickHandler(this.updatePage, this, +1);

    this._listeners = new ListenerManager<()=>void>();

    if (null != this._config.onFormInit) {
      var update = this._config.onFormInit(this);
      update.then((x) => {
        var model = this._viewmodel;
        if (typeof x === 'function') {
          let clientUpdate = x as ((model:IModelView<any>) => IModelView<any>);
          model = clientUpdate(model);
        } else if (null != x) {
          model = model.withAddedData(x);
        }
        model = model.changePage(1);
        this._updateViewModel(model);
      });
    }
  }

  pageNext:(event:UIEvent)=>void;
  pageBack:(event:UIEvent)=>void;

  pageNextAllowed():boolean {
    let vm = this._viewmodel;
    let hasNext = vm.currentPageIndex < vm.getPages().length;

    let config = this._config;

    let validating = config.validateOnUpdateIfInvalid || config.validateOnUpdateIfInvalid; 

    return hasNext && (vm.isPageValid(null) || !validating); 
  }
  pageBackAllowed():boolean {
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
  updateModelTransactional(updater:(model:IModelView<any>) => IModelView<any>) {
    let newModel = updater(this._viewmodel);
    this._updateViewModel(newModel);

    let config = this._config;
    if (config.validateOnUpdate || (config.validateOnUpdateIfInvalid && !newModel.isVisitedValid())) {
      let validator = () => {
        let validated = this._viewmodel.validateDefault();
        validated.then((x) => this._updateViewModel(x));      
        this._debounceValidationTimeout = null;
      };
      if (this._debounceValidationTimeout) {
        clearTimeout(this._debounceValidationTimeout);
      }
      this._debounceValidationTimeout = setTimeout(validator, config.validateDebounceTime);
    }
  }
  private _debounceValidationTimeout: number;

  _updateViewModel(viewmodel:IModelView<any>) {
    this._viewmodel = viewmodel;
    this._notifyAll();
  }

  _notifyAll() {
    this._listeners.forEach((x) => x());
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
    
    nextModel
      .then((validatedModel) => {
        if (step < 0 || validatedModel.isPageValid(null)) {
          
          var promise:Promise<IModelView<any>>;

          if (this._config.onPageTransition) {

            // replace model without notification 
            // so onPageTransition starts with this one
            this._viewmodel = validatedModel; 

            let moreValidation = this._config.onPageTransition(this, step);
            promise = moreValidation.then((messages) => {
              var result = validatedModel
              if (messages && messages.length) {
                result = validatedModel.withValidationMessages(messages);
              }
              return result;
            }, () => {
              return validatedModel.withValidationMessages([
                { path:"", msg:"internal error (page transition handler)", code:'transition-error', isError: true }
              ])
            });
          } else {
            promise = Promise.resolve(validatedModel);
          }

          return promise.then((serverValidatedModel) => {
            if (step < 0 || serverValidatedModel.isPageValid(null)) {
              return serverValidatedModel.changePage(step);
            }
            return serverValidatedModel;
          });
        }
        return validatedModel;
      })
      .then((x) => this._updateViewModel(x));

  }

  private _listeners:ListenerManager<()=>void>;
  private _config:IFormConfig;
  private _metamodel: IModelTypeComposite<any>;   //</any>
  private _viewmodel: IModelView<any>;            //</any>
}

