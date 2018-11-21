import * as React from 'react';
import { IClientProps, IModelTypeComposite, IModelView, IModelViewField, IModelType } from '@hn3000/metamodel';

export interface IComponentLookup {
    [key: string]: React.ReactType;
}

export interface IDataSource<T> {
    getModelType(): IModelType<T>;
    getFieldValue(keyPath: string | string[]): any;
    getFieldType(keyPath: string | string[]): IModelType<any>;
    /*
    getField(keyPath: string | string[]): IModelViewField;
    getFields(fields?: string[]): IModelViewField[];
    */
}

export interface XX extends IDataSource<any>, IModelView<any> {

}

export interface IMetaModelContext extends IClientProps {
    metamodel: IModelTypeComposite<any>;
    viewmodel: IDataSource<any>;
    currentPage: number;
    currentPageAlias: string;

    /*
     * similar to redux: returns the unsubscribe function
     * listeners always called asynchronously: validation runs before
     * listeners are notfied
     */
    subscribe(listener:()=>any):()=>void;

    // query context state
    /** Return true while a Promise returned from an event handler is still in flight */
    isBusy():boolean;

  }
