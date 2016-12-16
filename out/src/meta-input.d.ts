/// <reference types="react" />
import { IInputProps, IFormContext } from './api';
import { MetaContextFollower } from './base-components';
import * as React from 'react';
export declare class MetaInput extends MetaContextFollower<IInputProps, any> {
    static contextTypes: {
        formContext: React.Requireable<any>;
    };
    constructor(props: IInputProps, context: any);
    changeHandler(evt: React.FormEvent<HTMLElement>): void;
    nochangeHandler(): void;
    render(): JSX.Element;
    _extractState(context: IFormContext): any;
    private _context;
}
