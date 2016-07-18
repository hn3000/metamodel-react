import * as React from 'react';
import { IModelType, IModelTypeComposite, IModelView, IValidationMessage, IClientProps } from '@hn3000/metamodel';
export interface IFormProps {
    context: IFormContext;
    currentPage?: number;
}
export interface IFormState {
    viewmodel: IModelView<any>;
    currentPage: number;
}
export interface IPageProps {
    context?: IFormContext;
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
    wrapper?: React.ComponentClass<IWrapperComponentProps>;
}
export interface IInputState {
    fieldValue: any;
    fieldErrors: IValidationMessage[];
}
export interface IWrapperComponentProps {
    hasErrors?: boolean;
    errors?: IValidationMessage[];
    field?: string;
}
export interface IInputComponentProps extends IWrapperComponentProps {
    id?: string;
    context?: IFormContext;
    field?: string;
    fieldType?: IModelType<any>;
    editable?: boolean;
    flavour?: string;
    flavor?: string;
    value?: any;
    defaultValue?: any;
    placeholder?: string;
    onChange?: (newValue: any) => void;
}
export interface IInputComponentState extends IInputProps {
    flavour: string;
}
export declare type InputComponent = React.ComponentClass<IInputComponentProps>;
export interface IComponentLookup {
    [key: string]: React.ReactType;
}
export interface IWrappers extends IComponentLookup {
    form: React.ComponentClass<IWrapperComponentProps>;
    page: React.ComponentClass<IWrapperComponentProps>;
    field: React.ComponentClass<IWrapperComponentProps>;
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
export interface IFormEvents {
    onFormInit?: (ctx: IFormContext) => Promise<any | ((model: IModelView<any>) => IModelView<any>)>;
    onPageTransition?: (ctx: IFormContext, direction: number) => Promise<IValidationMessage[]>;
}
export interface IFormConfig extends IComponentFinder, IFormEvents {
    wrappers: IWrappers;
    usePageIndex: boolean;
    validateOnUpdate: boolean;
}
export interface IFormContext extends IClientProps {
    config: IFormConfig;
    metamodel: IModelTypeComposite<any>;
    viewmodel: IModelView<any>;
    currentPage: number;
    subscribe(listener: () => any): () => void;
    updateModel(field: string, value: any): void;
    updateModelTransactional(updater: (model: IModelView<any>) => IModelView<any>): void;
    updatePage(step: number): void;
    pageNext: (event: UIEvent) => void;
    pageBack: (event: UIEvent) => void;
    pageNextAllowed(): boolean;
    pageBackAllowed(): boolean;
}
