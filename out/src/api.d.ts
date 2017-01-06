/// <reference types="react" />
/// <reference types="es6-promise" />
import * as React from 'react';
import { Primitive, IModelType, IModelTypeComposite, IModelView, IStatusMessage, IPropertyStatusMessage, IClientProps } from '@hn3000/metamodel';
export interface IFormProps {
    context: IFormContext;
    currentPage?: number;
    action?: string;
    method?: string;
}
export interface IPageProps {
    page: number;
    contents?: React.ComponentClass<any> | string;
}
export interface IInputChangeHandler {
    (formContext: IFormContext, fieldName: string, newValue: any, oldValue: any): void;
}
export interface IInputProps {
    field: string;
    flavour?: string;
    flavor?: string;
    wrapper?: React.ComponentClass<IWrapperComponentProps>;
    onChange?: IInputChangeHandler;
}
export interface IWrapperComponentProps {
    hasErrors?: boolean;
    errors?: IPropertyStatusMessage[];
    field?: string;
}
export interface IFormWrapperProps extends IWrapperComponentProps {
    id: string;
    action?: string;
    method?: string;
    busy?: boolean;
}
export interface IPageWrapperProps extends IWrapperComponentProps {
    busy?: boolean;
}
export interface IInputComponentProps extends IWrapperComponentProps {
    id?: string;
    field?: string;
    fieldType?: IModelType<any>;
    editable?: boolean;
    flavour?: string;
    flavor?: string;
    value?: any;
    defaultValue?: any;
    placeholder?: string;
    onChange?: (update: Primitive | React.FormEvent<HTMLElement>) => void;
    context?: IFormContext;
}
export interface IInputComponentContext {
}
export interface IFieldWrapperProps extends IInputComponentProps {
}
export interface IInputComponentState extends IInputProps {
    flavour: string;
}
export declare type InputComponent = React.ComponentClass<IInputComponentProps>;
export interface IComponentLookup {
    [key: string]: React.ReactType;
}
export interface IWrappers extends IComponentLookup {
    form: React.ComponentClass<IFormWrapperProps>;
    page: React.ComponentClass<IPageWrapperProps>;
    field: React.ComponentClass<IFieldWrapperProps>;
}
export interface IComponentMatchFun {
    (type: IModelType<any>, fieldName: string, flavor: string, ...matchArgs: any[]): number;
}
export interface IComponentMatcher {
    matchQuality(type: IModelType<any>, fieldName: string, flavor: string, ...matchargs: any[]): number;
    component: InputComponent;
}
export interface IComponentFinder {
    findBest(type: IModelType<any>, fieldName: string, flavor: string, ...matchargs: any[]): InputComponent;
    add(matcher: IComponentMatcher): any;
    remove(matcher: IComponentMatcher): any;
}
export interface IModelUpdater {
    (model: IModelView<any>, ctx: IFormContext): IModelView<any>;
}
export interface IFormEvents {
    onFormInit?: (ctx: IFormContext) => Promise<IModelUpdater>;
    onPageTransition?: (ctx: IFormContext, direction: number) => Promise<IPropertyStatusMessage[] | IModelUpdater>;
    onAfterPageTransition?: (ctx: IFormContext) => void;
    onFailedPageTransition?: (ctx: IFormContext) => void;
    onModelUpdate?: (ctx: IFormContext) => Promise<IModelUpdater>;
}
export interface IFormConfig extends IComponentFinder, IFormEvents {
    wrappers: IWrappers;
    usePageIndex: boolean;
    validateOnUpdate: boolean;
    validateOnUpdateIfInvalid: boolean;
    validateDebounceMS: number;
    allowNextWhenInvalid: boolean;
    allowSubmitWhenInvalid: boolean;
    busyDelayMS: number;
}
export interface IConclusionMessage extends IStatusMessage {
}
export interface IFormContext extends IClientProps {
    config: IFormConfig;
    metamodel: IModelTypeComposite<any>;
    viewmodel: IModelView<any>;
    currentPage: number;
    subscribe(listener: () => any): () => void;
    updateModel(field: string, value: any): void;
    updateModelTransactional(updater: IModelUpdater, skipValidation?: boolean): void;
    updatePage(step: number): void;
    setConclusion(conclusion: IConclusionMessage): void;
    getConclusion(): IConclusionMessage | null;
    pageNext: (event: React.SyntheticEvent<HTMLElement>) => void;
    pageBack: (event: React.SyntheticEvent<HTMLElement>) => void;
    pageNextAllowed(): boolean;
    pageBackAllowed(): boolean;
    isBusy(): boolean;
}
