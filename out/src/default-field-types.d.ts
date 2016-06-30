import * as React from 'react';
import { IInputComponentProps, IInputComponentState } from './interfaces';
export declare class FieldWrapper extends React.Component<void, void> {
    render(): JSX.Element;
}
export declare class PageWrapper extends React.Component<void, void> {
    render(): JSX.Element;
}
export declare class FormWrapper extends React.Component<void, void> {
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
export declare class MetaFormInputEnum extends React.Component<IInputComponentProps, IInputComponentState> {
    render(): JSX.Element;
}
export declare class MetaFormUnknownFieldType extends React.Component<IInputComponentProps, IInputComponentState> {
    render(): JSX.Element;
}
