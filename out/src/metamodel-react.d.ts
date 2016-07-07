import * as React from 'react';
import { IModelType, IModelTypeComposite, IModelView, IValidationMessage } from '@hn3000/metamodel';
export { IModelType, IModelTypeComposite, IModelTypeItem, IModelView, ModelView, IValidationMessage } from '@hn3000/metamodel';
export { IFormProps, IFormState, IPageProps, IPageState, IInputProps, IInputState, IWrappers, IWrapperComponentProps, IInputComponentProps, IInputComponentState, IComponentMatcher, IFormConfig, IFormContext, InputComponent } from './interfaces';
import { IFormProps, IFormState, IPageProps, IPageState, IInputProps, IInputState, IWrappers, IComponentMatcher, IFormConfig, IFormContext, InputComponent } from './interfaces';
import * as fields from './default-field-types';
export declare class MetaFormContext implements IFormContext {
    constructor(config: IFormConfig, metamodel: IModelTypeComposite<any>, data?: any);
    pageNext: (event: UIEvent) => void;
    pageBack: (event: UIEvent) => void;
    readonly config: IFormConfig;
    readonly metamodel: IModelTypeComposite<any>;
    readonly viewmodel: IModelView<any>;
    readonly currentPage: number;
    subscribe(listener: () => any): () => void;
    updateModel(field: string, value: any): void;
    _updateViewModel(viewmodel: IModelView<any>): void;
    _notifyAll(): void;
    updatePage(step: number): void;
    private _listeners;
    private _config;
    private _metamodel;
    private _viewmodel;
}
export declare class MetaFormConfig implements IFormConfig {
    constructor(wrappers?: IWrappers, components?: IComponentMatcher[]);
    setWrappers(wrappers: IWrappers): void;
    readonly wrappers: IWrappers;
    readonly matchers: IComponentMatcher[];
    findBest(type: IModelType<any>, fieldName: string, flavor: string, ...matchargs: any[]): InputComponent;
    add(cm: IComponentMatcher): void;
    remove(cm: IComponentMatcher): void;
    usePageIndex: boolean;
    validateOnUpdate: boolean;
    onFormInit: (form: IFormContext) => Promise<any>;
    onPageTransition: (form: IFormContext, direction: number) => Promise<IValidationMessage[]>;
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
    constructor(props: IInputProps, context: any);
    render(): JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    _updatedState(): IInputState;
    private _unsubscribe;
    private _context;
}
