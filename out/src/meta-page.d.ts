import * as React from 'react';
import { IPageProps } from './api';
import { MetaContextFollower } from './base-components';
export declare class MetaPage extends MetaContextFollower<IPageProps, any> {
    static contextTypes: {
        formContext: React.Requireable<any>;
    };
    constructor(props: IPageProps, context: any);
    render(): JSX.Element;
}
