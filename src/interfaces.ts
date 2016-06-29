
import * as React from 'react';
import {
  IModelType,
  IModelTypeComposite,
  IModelTypeItem
} from '@hn3000/metamodel';


export interface IFormProps {
    context: IFormContext;
    currentPage?: number;
}
export interface IFormState extends IFormProps {
    currentPage: number;
}

export interface IPageProps {
    context: IFormContext;
    currentPage: number;
    page: number;
}
export interface IPageState extends IPageProps {
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

export type InputComponent = React.ComponentClass<any> | React.StatelessComponent<any>;

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

export interface IFormContext {
  config: IFormConfig;
  metamodel: IModelTypeComposite<any>;
}
