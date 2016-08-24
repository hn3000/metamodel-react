import * as React from 'react';
import { IInputComponentProps, IInputComponentState, IFormWrapperProps, IPageWrapperProps, IFieldWrapperProps } from './api';
export declare class FieldWrapper extends React.Component<IFieldWrapperProps, void> {
    render(): JSX.Element;
}
export declare class PageWrapper extends React.Component<IPageWrapperProps, void> {
    render(): JSX.Element;
}
export declare class FormWrapper extends React.Component<IFormWrapperProps, void> {
    render(): JSX.Element;
}
export declare class MetaFormInputString extends React.Component<IInputComponentProps, IInputComponentState> {
    render(): JSX.Element;
}
export declare class MetaFormInputNumber extends React.Component<IInputComponentProps, IInputComponentState> {
    render(): JSX.Element;
}
export declare class MetaFormInputBool extends React.Component<IInputComponentProps, IInputComponentState> {
    render(): JSX.Element;
}
export declare class MetaFormInputEnumSelect extends React.Component<IInputComponentProps, IInputComponentState> {
    render(): JSX.Element;
}
export declare class MetaFormInputEnumRadios extends React.Component<IInputComponentProps, IInputComponentState> {
    constructor(props: IInputComponentProps, context: any);
    render(): JSX.Element;
    private _group;
}
export declare class MetaFormInputEnumCheckbox extends React.Component<IInputComponentProps, IInputComponentState> {
    render(): JSX.Element;
}
export interface IFileInputState {
    dataurl: string;
    error?: string;
}
export declare class MetaFormInputFile extends React.Component<IInputComponentProps, IFileInputState> {
    constructor(props: IInputComponentProps, reactContext: any);
    handleContents(evt: ProgressEvent): void;
    handleError(evt: ErrorEvent): void;
    handleFile(evt: UIEvent): void;
    render(): JSX.Element;
}
export declare class MetaFormUnknownFieldType extends React.Component<IInputComponentProps, IInputComponentState> {
    render(): JSX.Element;
}
