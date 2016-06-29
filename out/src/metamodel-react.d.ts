/// <reference path="../../typings/index.d.ts" />
import * as React from 'react';
import { IModelTypeComposite } from '@hn3000/metamodel';
export { IFormProps, IFormState, IPageProps, IPageState, IInputProps, IInputState, IWrappers, IComponentMatcher, IFormConfig, IFormContext, InputComponent } from './interfaces';
import { IFormProps, IFormState, IPageProps, IPageState, IInputProps, IInputState, IWrappers, IComponentMatcher, IFormConfig, InputComponent } from './interfaces';
export declare class ViewModel {
    constructor(metamodel: IModelTypeComposite<any>);
    private _metamodel;
}
export declare class MetaFormConfig implements IFormConfig {
    setWrappers(wrappers: IWrappers): void;
    readonly wrappers: IWrappers;
    private _wrappers;
    readonly matchers: IComponentMatcher[];
    findBest(...matchargs: any[]): InputComponent;
    add(cm: IComponentMatcher): void;
    remove(cm: IComponentMatcher): void;
    private _matchers;
}
export declare class MetaForm extends React.Component<IFormProps, IFormState> {
    render(): JSX.Element;
}
export declare class MetaPage extends React.Component<IPageProps, IPageState> {
    render(): JSX.Element;
}
export declare class MetaInput extends React.Component<IInputProps, IInputState> {
    render(): JSX.Element;
    private _context;
}
