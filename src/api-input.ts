
import * as React from 'react';

import {
  IModelType,
  IModelTypeComposite,
  IModelView,
  IStatusMessage,
  IPropertyStatusMessage,
  IClientProps,
  IModelViewPage
} from '@hn3000/metamodel';

import {
  IComponentLookup
} from './api-common';

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
    page?: number; // needs either page or alias
    alias?: string;
    contents?: React.ReactType<any>;
}

export interface ISectionProps extends IMetaFormBaseProps {
    sectionAlias?: string;
    section?: IModelViewPage;
    contents?: React.ReactType<ISectionWrapperProps>;
    contentsDefault?: React.ReactType<ISectionWrapperProps>;
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

export interface IFormComponentProps {
    hasErrors?: boolean;
    errors?: IPropertyStatusMessage[];
    messages?: IStatusMessage[];
    context?:IFormContext
}

export interface IWrapperComponentProps extends IFormComponentProps {
    context:IFormContext
}

export interface IFormWrapperProps extends IWrapperComponentProps {
    id: string;
    action?: string;
    method?: string;
    busy?:boolean;
}

export interface IPageWrapperProps extends IWrapperComponentProps {
    busy?:boolean;
    pageAlias: string;
}

export interface ISectionWrapperProps extends IWrapperComponentProps {
    section: IModelViewPage;
    sectionAlias: string;
}

export type ISectionWrapper = React.ComponentType<ISectionWrapperProps>
                            | React.ComponentType<any>;

export interface ILabelRendererProps {
    children?: React.ReactNode;

    field?: string;
    [key: string]: string | any;
}

export type ILabelRenderer = React.ComponentType<ILabelRendererProps>;

export interface IInputComponentProps extends IFormComponentProps {
    id?: string;
    field?: string;
    fieldType?: IModelType<any>;
    editable?:boolean;
    flavour?: string;
    flavor?: string;
    value?: any;
    defaultValue?: any;
    placeholder?:string;
    renderLabel?: ILabelRenderer;
    onChange?: (update: React.FormEvent<HTMLElement>|any) => void;
}

export interface IFieldWrapperProps extends IInputComponentProps {
    field?:string;
}

export interface IInputComponentState extends IInputProps {
    flavour: string;
}

export type IInputComponent = React.ComponentType<IInputComponentProps>;
export type InputComponent = IInputComponent;

export type IInputFormWrapper = React.ComponentType<IFormWrapperProps>;
export type IInputPageWrapper = React.ComponentType<IPageWrapperProps>;
export type IInputFieldWrapper = React.ComponentType<IFieldWrapperProps>;



export interface IWrappers extends IComponentLookup {
    form:  IInputFormWrapper;
    page:  IInputPageWrapper;
    field: IInputFieldWrapper;
    section: ISectionWrapper;
}

export interface ISectionLookup {
    [name: string]: ISectionWrapper;
}

export interface IComponentMatchFun {
    (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]): number;
}
export interface IComponentMatcher<C, W> {
    matchQuality(type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]): number;
    component: C;
    wrapper?: W;
}
export interface IInputComponentMatcher extends IComponentMatcher<IInputComponent, IInputFieldWrapper> {
    condition?: (formContext: IFormContext) => boolean;
}
export interface IComponentFinder {
    findBestMatcher(type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]): IInputComponentMatcher;
    findSection(name:string): ISectionWrapper;
}

export interface IComponentFinderBuilder {
    add(matcher: IInputComponentMatcher): any;
    remove(matcher: IInputComponentMatcher): any;
    addSection(name: string, component: ISectionWrapper): void;
    removeSection(name: string, component: ISectionWrapper): void;
    setSectionDefault(component: ISectionWrapper): void;
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
  currentPageAlias: string;

  /*
   * similar to redux: returns the unsubscribe function
   * listeners always called asynchronously: validation runs before
   * listeners are notified
   */
  subscribe(listener:()=>any):()=>void;

  //updated in place, viewmodel will change, though
  updateModel(values:{ [key: string]: any; }):void;
  updateModel(field:string, value:any):void;
  updateModelTransactional(updater:IModelUpdater, skipValidation?:boolean):Promise<IModelView<any>>;

  updatePage(step:number):void;

  setConclusion(conclusion:IConclusionMessage):void;
  getConclusion():IConclusionMessage|null;

  // query context state
  /** Return true while a Promise returned from an event handler is still in flight */
  isBusy():boolean;

  /** Return true if all data up to and including the current page is valid */
  isValid():boolean;

  /** Return true if all data on the specified (or current) page is valid */
  isPageValid(aliasOrIndex?: string|number):boolean;

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
