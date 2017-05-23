/// <reference types="react" />
import { IFormProps, IFormContext } from './api';
import { MetaContextFollower } from './base-components';
import { Requireable } from 'prop-types';
export declare class MetaForm extends MetaContextFollower<IFormProps, any> {
    static childContextTypes: {
        isRequired: () => boolean;
        formContext: Requireable<any>;
    };
    getChildContext(): {
        formContext: IFormContext;
    };
    constructor(props: IFormProps, context: any);
    render(): JSX.Element;
    _extractState(context: IFormContext): any;
}
