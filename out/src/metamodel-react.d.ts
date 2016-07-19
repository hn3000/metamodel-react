import * as React from 'react';
import { IModelType, IModelTypeComposite, IModelView, IValidationMessage, IClientProps, ClientProps } from '@hn3000/metamodel';
export { IModelType, IModelTypeComposite, IModelTypeItem, IModelView, ValidationScope, ModelView, IValidationMessage, IClientProps, ClientProps } from '@hn3000/metamodel';
export { IFormProps, IFormState, IPageProps, IPageState, IInputProps, IInputState, IWrappers, IWrapperComponentProps, IInputComponentProps, IInputComponentState, IComponentMatcher, IFormConfig, IFormContext, InputComponent } from './interfaces';
import { IFormProps, IFormState, IPageProps, IPageState, IInputProps, IInputState, IWrappers, IComponentMatcher, IFormConfig, IFormContext, InputComponent } from './interfaces';
import * as fields from './default-field-types';
export { propsDifferent } from './props-different';
export declare class MetaFormContext extends ClientProps implements IFormContext, IClientProps {
    constructor(config: IFormConfig, metamodel: IModelTypeComposite<any>, data?: any);
    pageNext: (event: UIEvent) => void;
    pageBack: (event: UIEvent) => void;
    pageNextAllowed(): boolean;
    pageBackAllowed(): boolean;
    readonly config: IFormConfig;
    readonly metamodel: IModelTypeComposite<any>;
    readonly viewmodel: IModelView<any>;
    readonly currentPage: number;
    subscribe(listener: () => any): () => void;
    updateModel(field: string, value: any): void;
    updateModelTransactional(updater: (model: IModelView<any>) => IModelView<any>): void;
    private _debounceValidationTimeout;
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
    validateOnUpdateIfInvalid: boolean;
    validateDebounceTime: number;
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
export interface IMetaFormBaseProps {
    context?: IFormContext;
}
export interface IMetaFormBaseState {
    currentPage?: number;
}
export declare var MetaForm_ContextTypes: {
    formContext: React.Requireable<any>;
};
export declare abstract class MetaContextAware<P extends IMetaFormBaseProps, S extends IMetaFormBaseState> extends React.Component<P, S> {
    static contextTypes: {
        formContext: React.Requireable<any>;
    };
    constructor(props: P, context?: MetaFormContext);
    readonly formContext: IFormContext;
}
export declare class MetaContextAwarePure<P, S> extends MetaContextAware<P, S> {
    shouldComponentUpdate(nextProps: P, nextState: S, nextContext: any): boolean;
}
export declare abstract class MetaContextFollower<P extends IMetaFormBaseProps, S extends IMetaFormBaseState> extends MetaContextAware<P, S> {
    static contextTypes: {
        formContext: React.Requireable<any>;
    };
    constructor(props: P, context?: MetaFormContext);
    protected _updatedState(context?: IFormContext, initState?: boolean): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private _unsubscribe;
}
export declare class MetaForm extends MetaContextFollower<IFormProps, IFormState> {
    static childContextTypes: {
        formContext: React.Requireable<any>;
    };
    getChildContext(): {
        formContext: IFormContext;
    };
    constructor(props: IFormProps, context: any);
    render(): JSX.Element;
    _updateState(context: IFormContext): void;
}
export declare class MetaPage extends MetaContextAware<IPageProps, IPageState> {
    static contextTypes: {
        formContext: React.Requireable<any>;
    };
    constructor(props: IPageProps, context: any);
    render(): JSX.Element;
    _updatedState(context: IFormContext, initState: boolean): {
        currentPage: number;
    };
}
export declare class MetaInput extends MetaContextFollower<IInputProps, IInputState> {
    constructor(props: IInputProps, context: any);
    changeHandler(evt: React.FormEvent): void;
    render(): JSX.Element;
    shouldComponentUpdate(nextProps: IInputProps, nextState: IInputState, nextCtx: any): boolean;
    _updatedState(context: IFormContext, initState: boolean): void;
    private _context;
}
