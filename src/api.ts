
import * as React from 'react';
import { Requireable } from 'prop-types';

import {
  Primitive,
  IModelType,
  IModelTypeComposite,
  IModelTypeItem,
  IModelView,
  MessageSeverity,
  IMessageProps,
  IStatusMessage,
  IPropertyStatusMessage,
  IClientProps
} from '@hn3000/metamodel';

export interface IMetaFormBaseProps {
    context?: IFormContext;
}
  
export interface IFormProps {
    context: IFormContext;
    currentPage?: number;
    action?:string;
    method?:string;
}

export interface IPageProps extends IMetaFormBaseProps {
    page: number;
    contents?: React.ComponentClass<any> | string;
}
export interface IInputChangeHandler {
    (formContext: IFormContext, fieldName: string, newValue: any, oldValue: any): void
}
export interface IInputProps extends IMetaFormBaseProps {
    field: string;
    flavour?: string;
    flavor?: string;
    wrapper?:React.ComponentClass<IWrapperComponentProps>;
    onChange?: IInputChangeHandler; 
}

export interface IWrapperComponentProps {
    hasErrors?: boolean;
    errors?: IPropertyStatusMessage[];
    field?:string;
}

export interface IFormWrapperProps extends IWrapperComponentProps {
    id: string;
    action?: string;
    method?: string;
    busy?:boolean;
}

export interface IPageWrapperProps extends IWrapperComponentProps { 
    busy?:boolean;
}

export interface IInputComponentProps extends IWrapperComponentProps {
    id?: string;
    field?: string;
    fieldType?: IModelType<any>;
    editable?:boolean;
    flavour?: string;
    flavor?: string;
    value?: any;
    defaultValue?: any;
    placeholder?:string;
    onChange?: (update: Primitive|React.FormEvent<HTMLElement>) => void;
    context?:IFormContext
}

export interface IInputComponentContext {

}

export interface IFieldWrapperProps extends IInputComponentProps { 

}

export interface IInputComponentState extends IInputProps {
    flavour: string;
}

export type InputComponent = React.ComponentClass<IInputComponentProps>;// | React.StatelessComponent<IInputComponentProps>;

export interface IComponentLookup {
    [key: string]: React.ReactType;
}

export interface IWrappers extends IComponentLookup {
    form:  React.ComponentClass<IFormWrapperProps>;  // </IFormWrapperProps>
    page:  React.ComponentClass<IPageWrapperProps>;  // </IPageWrapperProps>
    field: React.ComponentClass<IFieldWrapperProps>; // </IFieldWrapperProps>
}

export interface IComponentMatchFun {
    (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]): number;
}
export interface IComponentMatcher {
    matchQuality(type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]): number;
    component: InputComponent;
}
export interface IComponentFinder {
    findBest(type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]): InputComponent;
    add(matcher: IComponentMatcher): any;
    remove(matcher: IComponentMatcher): any;
}

export interface IModelUpdater {
    (model:IModelView<any>, ctx:IFormContext):IModelView<any>;
}

export interface IFormEvents {
  onFormInit?: (ctx:IFormContext) => Promise<IModelUpdater>;
  onPageTransition?: (ctx:IFormContext, direction:number) => Promise<IPropertyStatusMessage[]|IModelUpdater>;
  onAfterPageTransition?: (ctx:IFormContext) => void;
  onFailedPageTransition?: (ctx:IFormContext) => void;
  onModelUpdate?: (ctx:IFormContext) => Promise<IModelUpdater>;
}

export interface IFormConfig extends IComponentFinder, IFormEvents {
  wrappers: IWrappers;

  usePageIndex: boolean;
  validateOnUpdate: boolean;           // default false
  validateOnUpdateIfInvalid: boolean;  // default false
  validateDebounceMS: number;          // default 100ms

  busyDelayMS: number;                 // default 100ms

  allowNavigationWithInvalidPages: boolean; // default false
}

export interface IConclusionMessage extends IStatusMessage {

}

export interface IFormContext extends IClientProps {
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

  //updated in place, viewmodel will change, though
  updateModel(field:string, value:any):void;
  updateModelTransactional(updater:IModelUpdater, skipValidation?:boolean):void;

  updatePage(step:number):void;

  setConclusion(conclusion:IConclusionMessage):void;
  getConclusion():IConclusionMessage|null;

  // query context state
  /** Return true while a Promise returned from an event handler is still in flight */
  isBusy():boolean;          

  /** Return true if all data up to the current page is valid */
  isValid():boolean;

  /** Return true if all data on the current page is valid */
  isPageValid():boolean;

  /** Return true unless we're on the page behind the last model page */
  hasNextPage():boolean;

  /** Return true unless we're on the first model page or behind the last model page */
  hasPreviousPage():boolean;

  isFinished():boolean;

  /** 
   * Try to advance to the next page, will validate current data and proceed 
   * if isValid() is true; does nothing if isBusy() returns true 
   */
  pageNext:(event:React.SyntheticEvent<HTMLElement>)=>void;
  /**
   * Try to go back to the previous page, will not run validations;
   * does nothing if we're on the first page already
   */
  pageBack:(event:React.SyntheticEvent<HTMLElement>)=>void;

}
