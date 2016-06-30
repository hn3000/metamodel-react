
import * as React from 'react';
import {
  IModelType,
  IModelTypeComposite,
  IModelTypeItem,
  IModelView,
  IModelParseMessage
} from '@hn3000/metamodel';


export interface IFormProps {
    context: IFormContext;
    currentPage?: number;
}
export interface IFormState {
    viewmodel:IModelView<any>;
    currentPage: number;
}

export interface IPageProps {
    context: IFormContext;
    page: number;
}
export interface IPageState {
    currentPage: number;
}
export interface IInputProps {
    context?: IFormContext;
    field: string;
    flavour?: string;
    flavor?: string;
}
export interface IInputState extends IInputProps {
    flavour: string;
}

export interface IInputComponentProps {
    context?: IFormContext;
    field: string;
    fieldType: IModelType<any>;
    flavour?: string;
    flavor?: string;

    value?:any;
    onChange?:(newValue:any)=>void;
}

export interface IInputComponentState extends IInputProps {
    flavour: string;
}


export type InputComponent = React.ComponentClass<IInputComponentProps> | React.StatelessComponent<IInputComponentProps>;

export interface IComponentLookup {
    [key: string]: React.ReactType;
}
export interface IWrappers extends IComponentLookup {
    form: React.ComponentClass<any>;  // </any>
    page: React.ComponentClass<any>;  // </any>
    field: React.ComponentClass<any>; // </any>
}
export interface IComponentMatchFun {
    (...matchArgs: any[]): number;
}
export interface IComponentMatcher {
    matchQuality(...matchargs: any[]): number;
    component: InputComponent;
}
export interface IComponentFinder {
    findBest(...matchargs: any[]): InputComponent;
    add(matcher: IComponentMatcher): any;
    remove(matcher: IComponentMatcher): any;
}

export interface IFormConfig extends IComponentFinder {
  wrappers: IWrappers;
}

export interface IFormValidationMessage extends IModelParseMessage {
    // nothing added for now
}

export interface IFormValidationResult {
    valid: boolean;
    messages: IFormValidationMessage[];
}

export interface IFormValidator {
    (oldModel:any, newModel:any):Promise<IFormValidationResult>;
}

export interface IFormContext {
  config: IFormConfig;
  metamodel: IModelTypeComposite<any>;
  viewmodel: IModelView<any>;
  currentPage: number;

  /* 
   * similar to redux: returns the unsubscribe function
   * listeners always called asynchronously: validation runs before
   * listeners are notfied
   */
  subscribe(listener:()=>any):()=>void;

  addValidator(validator:IFormValidator):()=>void;
  addPageValidator(validator:IFormValidator):()=>void;

  updateModel(field:string, value:any):void;

  updatePage(step:number):void;
  
  pageNext:(event:UIEvent)=>void;
  pageBack:(event:UIEvent)=>void;
}
