/// <reference types="react" />
import { Requireable } from 'prop-types';
import { IPageProps, IFormContext } from './api';
import { MetaContextFollower } from './base-components';
export declare class MetaPage extends MetaContextFollower<IPageProps, any> {
    static contextTypes: {
        isRequired: () => boolean;
        formContext: Requireable<any>;
    };
    constructor(props: IPageProps, context: any);
    private _skipped;
    shouldComponentUpdate(nextProps: IPageProps, nextState: any, nextContext: any): boolean;
    protected _extractState(context: IFormContext): any;
    render(): JSX.Element;
}
