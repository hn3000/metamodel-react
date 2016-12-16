/// <reference types="react" />
import { IFormProps, IFormContext } from './api';
import { MetaContextFollower } from './base-components';
import * as React from 'react';
export declare class MetaForm extends MetaContextFollower<IFormProps, any> {
    static childContextTypes: {
        formContext: React.Requireable<any>;
    };
    getChildContext(): {
        formContext: IFormContext;
    };
    constructor(props: IFormProps, context: any);
    render(): JSX.Element;
    _extractState(context: IFormContext): any;
}
