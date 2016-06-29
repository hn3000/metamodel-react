import * as React from 'react';
import { IInputProps, IInputState } from './interfaces';
export declare class FieldWrapper extends React.Component<void, void> {
    render(): JSX.Element;
}
export declare class PageWrapper extends React.Component<void, void> {
    render(): JSX.Element;
}
export declare class FormWrapper extends React.Component<void, void> {
    render(): JSX.Element;
}
export declare class MetaFormInputString extends React.Component<IInputProps, IInputState> {
    render(): JSX.Element;
}
export declare class MetaFormInputNumber extends React.Component<IInputProps, IInputState> {
    render(): JSX.Element;
}
export declare class MetaFormInputBool extends React.Component<IInputProps, IInputState> {
    render(): JSX.Element;
}
export declare class MetaFormUnknownFieldType extends React.Component<IInputProps, IInputState> {
    render(): JSX.Element;
}
