import { IFormProps, IFormState, IFormContext } from './api';
import { MetaContextFollower } from './base-components';
import * as React from 'react';
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
