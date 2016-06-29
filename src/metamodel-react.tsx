/* /// <reference path="../typings/index.d.ts" /> */

import * as React from 'react';
import {
  IModelType,
  IModelTypeComposite,
  IModelTypeItem
} from '@hn3000/metamodel';

export {
  IFormProps,
  IFormState,
  IPageProps,
  IPageState,
  IInputProps,
  IInputState,
  IWrappers,
  IComponentMatcher,
  IFormConfig,
  IFormContext,
  InputComponent
} from './interfaces';

import {
  IFormProps,
  IFormState,
  IPageProps,
  IPageState,
  IInputProps,
  IInputState,
  IWrappers,
  IComponentMatcher,
  IFormConfig,
  IFormContext,
  InputComponent
} from './interfaces';



import * as fields from './default-field-types';


export class ViewModel {
  constructor(metamodel:IModelTypeComposite<any>) { // </any>
    this._metamodel = metamodel;
  }

  private _metamodel:IModelTypeComposite<any>; // </any> (to make VS code happy)
}


function kindMatcher(kind:string):(field:IModelType<any>)=>number {
  return (field:IModelType<any>) => (field.kind === kind?1:0)
}


export class MetaFormConfig implements IFormConfig {

  setWrappers(wrappers:IWrappers) {
    this._wrappers = wrappers;
  }

  public get wrappers():IWrappers {
    return this._wrappers;
  }

  private _wrappers:IWrappers = {
    form: fields.FormWrapper,
    page: fields.PageWrapper,
    field: fields.FieldWrapper,
  };


  public get matchers(): IComponentMatcher[] {
    return this._matchers;
  }

  findBest(...matchargs: any[]): InputComponent {
    var bestQ = 0;
    var match:React.ReactType = fields.MetaFormUnknownFieldType;

    let matchers = this._matchers;
    for (var i = 0, n = matchers.length; i<n; ++i) {
      let thisQ = matchers[i].matchQuality(...matchargs);
      if (thisQ > bestQ) {
        match = matchers[i].component;
      }
    }

    return match;
  }

  add(cm:IComponentMatcher) {
    if (-1 == this._matchers.indexOf(cm)) {
      this._matchers.push(cm);
    }
  }
  remove(cm:IComponentMatcher) {
    this._matchers = this._matchers.filter((x) => x != cm);
  }

  private _matchers: IComponentMatcher[] = [
    {
      matchQuality: kindMatcher('string'),
      component: fields.MetaFormInputString
    },
    {
      matchQuality: kindMatcher('number'),
      component: fields.MetaFormInputNumber
    }
  ];
}


export class MetaForm extends React.Component<IFormProps, IFormState> {
  //childContextTypes = {
  //  formcontext: React.PropTypes.object
  //}
  //getChildContext() {
  //  return { formcontext: this.props.context };
  //}

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
}

export class MetaPage extends React.Component<IPageProps, IPageState> {
  //contextProps: { formcontext: React.PropTypes.object }

  render() {
    //let context = this.context.formcontext || this.props.context;
    let context = this.props.context;
    if (this.props.page == this.props.currentPage) {
      let Wrapper = this.props.context.config.wrappers.page;
      return <Wrapper>{this.props.children}</Wrapper>;
    }
    return null;
  }
}

export class MetaInput extends React.Component<IInputProps, IInputState> {
  render() {

    var fieldName = this.props.field;
    var fieldType = this.props.context.metamodel.subModel(fieldName);
    var field = fieldType && fieldType.asItemType();

    if (!field) {
      console.log(`field ${fieldName} not found in ${this.props.context.metamodel.name}`);
      return null;
    }

    var Input = this.props.context.config.findBest(field, fieldName); 

    let Wrapper = this.props.context.config.wrappers.field;
    return <Wrapper><Input {...this.props} /></Wrapper>;
  }

  private _context:any;
}
