import * as React from 'react';
import { IModelType, IModelTypeComposite, IModelView } from '@hn3000/metamodel';
export { IFormProps, IFormState, IPageProps, IPageState, IInputProps, IInputState, IWrappers, IInputComponentProps, IInputComponentState, IComponentMatcher, IFormConfig, IFormContext, InputComponent, IFormValidationResult, IFormValidator } from './interfaces';
import { IFormProps, IFormState, IPageProps, IPageState, IInputProps, IInputState, IWrappers, IComponentMatcher, IFormConfig, IFormContext, InputComponent, IFormValidationResult, IFormValidator } from './interfaces';
import * as fields from './default-field-types';
export declare class MetaFormContext implements IFormContext {
    constructor(config: IFormConfig, metamodel: IModelTypeComposite<any>, data?: any);
    pageNext: (event: UIEvent) => void;
    pageBack: (event: UIEvent) => void;
    config: IFormConfig;
    metamodel: IModelTypeComposite<any>;
    viewmodel: IModelView<any>;
    currentPage: number;
    subscribe(listener: () => any): () => void;
    addValidator(validator: IFormValidator): () => void;
    addPageValidator(validator: IFormValidator): () => void;
    updateModel(field: string, value: any): void;
    updatePage(step: number): void;
    _runValidation(): Promise<IFormValidationResult>;
    private _listeners;
    private _validators;
    private _pageValidators;
    private _config;
    private _metamodel;
    private _viewmodel;
    private _currentPage;
}
export declare class MetaFormConfig implements IFormConfig {
    constructor(wrappers?: IWrappers, components?: IComponentMatcher[]);
    setWrappers(wrappers: IWrappers): void;
    wrappers: IWrappers;
    matchers: IComponentMatcher[];
    findBest(...matchargs: any[]): InputComponent;
    add(cm: IComponentMatcher): void;
    remove(cm: IComponentMatcher): void;
    private _wrappers;
    private _components;
    static defaultWrappers(): IWrappers;
    static defaultComponents(): {
        matchQuality: (field: IModelType<any>) => number;
        component: typeof fields.MetaFormInputString;
    }[];
}
export declare class MetaForm extends React.Component<IFormProps, IFormState> {
    constructor(props: IFormProps, context: any);
    render(): JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private _unsubscribe;
}
export declare class MetaPage extends React.Component<IPageProps, IPageState> {
    constructor(props: IPageProps, context: any);
    render(): JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private _unsubscribe;
}
export declare class MetaInput extends React.Component<IInputProps, IInputState> {
    render(): JSX.Element;
    private _context;
}
