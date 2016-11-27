/// <reference types="react" />
import * as React from 'react';
import { IFormContext } from './api';
import { MetaFormContext } from './form-context';
export interface IMetaFormBaseProps {
    context?: IFormContext;
}
export interface IMetaFormBaseState {
    currentPage?: number;
}
export declare var MetaForm_ContextTypes: {
    formContext: React.Requireable<any>;
};
export declare abstract class MetaContextAware<P extends IMetaFormBaseProps, S> extends React.Component<P, S> {
    static contextTypes: {
        formContext: React.Requireable<any>;
    };
    constructor(props: P, context?: MetaFormContext);
    readonly formContext: IFormContext;
}
export declare class MetaContextAwarePure<P, S> extends MetaContextAware<P, S> {
    shouldComponentUpdate(nextProps: P, nextState: S, nextContext: any): boolean;
}
export declare abstract class MetaContextFollower<P extends IMetaFormBaseProps, S> extends MetaContextAware<P, S> {
    static contextTypes: {
        formContext: React.Requireable<any>;
    };
    constructor(props: P, context?: MetaFormContext);
    protected _updatedState(context?: IFormContext, initState?: boolean): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private _unsubscribe;
}
