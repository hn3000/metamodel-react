/* /// <reference path="../typings/index.d.ts" /> */

import * as React from 'react';
import {
  IModelType,
  IModelTypeComposite,
  IModelTypeItem,
  IModelView,
  ModelView
} from '@hn3000/metamodel';

import { Promise } from 'es6-promise';

export {
  IFormProps,
  IFormState,
  IPageProps,
  IPageState,
  IInputProps,
  IInputState,
  IWrappers,
  IInputComponentProps,
  IInputComponentState,
  IComponentMatcher,
  IFormConfig,
  IFormContext,
  InputComponent,
  IFormValidationResult,
  IFormValidator
} from './interfaces';

import {
  IFormProps,
  IFormState,
  IPageProps,
  IPageState,
  IInputProps,
  IInputState,
  IWrappers,
  IInputComponentProps,
  IInputComponentState,
  IComponentMatcher,
  IFormConfig,
  IFormContext,
  InputComponent,
  IFormValidationResult,
  IFormValidator
} from './interfaces';

import * as fields from './default-field-types';

import {
  ListenerManager,
  clickHandler
} from './listenermanager';

import {
  JsonPointer
} from '@hn3000/metamodel';

export class MetaFormContext implements IFormContext {
  constructor(config: IFormConfig, metamodel:IModelTypeComposite<any>, data:any={}) {
    this._config = config;
    this._metamodel = metamodel;
    this._viewmodel = new ModelView(metamodel, data);
    this._currentPage = 1;


    this.pageBack = clickHandler(this.updatePage, this, -1);
    this.pageNext = clickHandler(this.updatePage, this, +1);


    this._listeners = new ListenerManager<()=>void>();
    this._validators = new ListenerManager<IFormValidator>();
    this._pageValidators = new ListenerManager<IFormValidator>();
  }

  pageNext:(event:UIEvent)=>void;
  pageBack:(event:UIEvent)=>void;

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
    return this._currentPage;
  }

  /* 
   * similar to redux: returns the unsubscribe function
   * listeners always called asynchronously: validation runs before
   * listeners are notfied
   */
  subscribe(listener:()=>any):()=>void {
    return this._listeners.subscribe(listener);
  }

  addValidator(validator:IFormValidator) {
    return this._validators.subscribe(validator);
  }
  addPageValidator(validator:IFormValidator) {
    return this._validators.subscribe(validator);
  }

  updateModel(field:string, value:any) {
    this._viewmodel = this._viewmodel.withChangedField(field, value);
    this._runValidation().then(() => this._listeners.forEach((x) => x()));
  }

  updatePage(step:number) {
    if (step > 0) {

    }
    this._currentPage += step;
    this._listeners.forEach((x) => x());
  }

  _runValidation():Promise<IFormValidationResult> {
    return Promise.resolve(null);
  }

  private _listeners:ListenerManager<()=>void>;
  private _validators:ListenerManager<IFormValidator>;
  private _pageValidators:ListenerManager<IFormValidator>;
  private _config:IFormConfig;
  private _metamodel: IModelTypeComposite<any>;
  private _viewmodel: IModelView<any>;

  private _currentPage:number;
}

function objMatcher(template:any):(field:IModelType<any>)=>number {
  var keys = Object.keys(template);
  var n = keys.length;

  return ((field:IModelType<any>) => {
    var result = 0;
    var fieldObj = field as any;
    for (var i = 0; i < n; i++) {
      let k = keys[i];
      if (fieldObj[k] == template[k]) {
        ++result;
      }
    }
    return result;
  });
}

function kindMatcher(kind:string):(field:IModelType<any>)=>number {
  return (field:IModelType<any>) => (field.kind === kind?1:0)
}

export class MetaFormConfig implements IFormConfig {

  constructor(wrappers?:IWrappers, components?:IComponentMatcher[]) {
    this._wrappers = wrappers || MetaFormConfig.defaultWrappers();
    this._components = components || MetaFormConfig.defaultComponents();
  }

  setWrappers(wrappers:IWrappers) {
    this._wrappers = wrappers;
  }

  public get wrappers():IWrappers {
    return this._wrappers;
  }

  public get matchers(): IComponentMatcher[] {
    return this._components;
  }

  findBest(...matchargs: any[]): InputComponent {
    var bestQ = 0;
    var match:React.ReactType = fields.MetaFormUnknownFieldType;

    let matchers = this._components;
    for (var i = 0, n = matchers.length; i<n; ++i) {
      let thisQ = matchers[i].matchQuality(...matchargs);
      if (thisQ > bestQ) {
        match = matchers[i].component;
      }
    }

    return match;
  }

  add(cm:IComponentMatcher) {
    if (-1 == this._components.indexOf(cm)) {
      this._components.push(cm);
    }
  }
  remove(cm:IComponentMatcher) {
    this._components = this._components.filter((x) => x != cm);
  }

  private _wrappers:IWrappers;
  private _components: IComponentMatcher[];

  public static defaultWrappers():IWrappers {
    return {
      form: fields.FormWrapper,
      page: fields.PageWrapper,
      field: fields.FieldWrapper,
    }
  }

  public static defaultComponents() {
    return [
      {
        matchQuality: kindMatcher('string'),
        component: fields.MetaFormInputString
      },
      {
        matchQuality: kindMatcher('number'),
        component: fields.MetaFormInputNumber
      },
      {
        matchQuality: kindMatcher('bool'),
        component: fields.MetaFormInputBool
      },
      {
        matchQuality: objMatcher({kind:'bool'}),
        component: fields.MetaFormInputBool
      }
    ];
  }

}


export class MetaForm extends React.Component<IFormProps, IFormState> {
  //childContextTypes = {
  //  formcontext: React.PropTypes.object
  //}
  //getChildContext() {
  //  return { formcontext: this.props.context };
  //}

  constructor(props:IFormProps, context:any) {
    super(props, context);
    this.state = {
      viewmodel: this.props.context.viewmodel,
      currentPage: this.props.context.currentPage
    };
    this._unsubscribe = null;
  }


  render() {
    let Wrapper = this.props.context.config.wrappers.form;

    /*
    let adjustedChildren = React.Children.map(this.props.children,
      (c) => React.cloneElement(c, {context: this.props.context}));
    */
    return (<Wrapper>
      <form id={this.props.context.metamodel.name} >
        {this.props.children}
      </form>
      </Wrapper>);
  }

  componentDidMount() {
    this._unsubscribe && this._unsubscribe();
    this._unsubscribe = this.props.context.subscribe(() => {
      this.setState({
        viewmodel: this.props.context.viewmodel,
        currentPage: this.props.context.currentPage
      });
    });
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
    this._unsubscribe = null;
  }

  private _unsubscribe:()=>void;
}

export class MetaPage extends React.Component<IPageProps, IPageState> {

  constructor(props:IPageProps, context:any) {
    super(props, context);

    this.state = {
        currentPage: this.props.context.currentPage
    };
  }
  render() {
    //let context = this.context.formcontext || this.props.context;
    let context = this.props.context;
    if (this.props.page == context.currentPage) {
      let Wrapper = this.props.context.config.wrappers.page;
      return <Wrapper>{this.props.children}</Wrapper>;
    }
    return null;
  }

  componentDidMount() {
    this._unsubscribe && this._unsubscribe();
    this._unsubscribe = this.props.context.subscribe(() => {
      this.setState({
        currentPage: this.props.context.currentPage
      });
    });
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
    this._unsubscribe = null;
  }

  private _unsubscribe:()=>void;
}

function changeHandler(model:IFormContext, fieldName:string) {
  return (event:React.FormEvent) => {
    let target = event.target as any;
    model.updateModel(fieldName, target.value);
  }
}

export class MetaInput extends React.Component<IInputProps, IInputState> {
  render() {

    var context = this.props.context;
    var fieldName = this.props.field;
    var fieldType = context.metamodel.subModel(fieldName);
    var field = fieldType && fieldType.asItemType();

    if (!field) {
      console.log(`field ${fieldName} not found in ${context.metamodel.name}`);
      return null;
    }

    let props:IInputComponentProps = { 
      field: this.props.field,
      fieldType: fieldType,
      value: context.viewmodel.getFieldValue(fieldName),
      onChange: changeHandler(context, fieldName)
    };

    var Input = context.config.findBest(field, fieldName); 
    let Wrapper = context.config.wrappers.field;

    return <Wrapper><Input {...props} /></Wrapper>;
  }

  private _context:any;
}
