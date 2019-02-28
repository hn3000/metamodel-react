
import * as React from 'react';
import {
  IComponentLookup
} from './api-common';
import { IModelType } from '@hn3000/metamodel';

export interface ITableWrapperProps {

}

export interface ITableHeadWrapperProps {

}

export interface ITableRowWrapperProps {

}

export interface ITableCellWrapperProps {

}

export interface ISectionWrapper {

}

export interface IDetailViewWrapperProps {

}

export interface IDetailSectionWrapperProps {

}

export interface IDetailFieldWrapperProps {

}

export type ITableWrapper = React.ComponentType<ITableWrapperProps>;

export type ITableHeadWrapper = React.ComponentType<ITableHeadWrapperProps>;
export type ITableRowWrapper = React.ComponentType<ITableRowWrapperProps>;
export type ITableCellWrapper = React.ComponentType<ITableCellWrapperProps>;

export type IDetailViewWrapper = React.ComponentType<IDetailViewWrapperProps>;
export type IDetailSectionWrapper = React.ComponentType<IDetailSectionWrapperProps>;
export type IDetailFieldWrapper = React.ComponentType<IDetailFieldWrapperProps>;

export interface IFieldDisplayProps {

}

export interface IFieldDisplayMatcher {
  component: React.ComponentType<IFieldDisplayProps>;
}

export interface IFieldPrinterFinder {  
  findBestMatcher(type: IModelType<any>, fieldName:string, flavor:string): IFieldDisplayMatcher;
  findSection(name:string): ISectionWrapper;
}

export interface ITableWrappers extends IComponentLookup {
  table: ITableWrapper;
  tableHead: ITableHeadWrapper;
  tableRow: ITableRowWrapper;
  tableCell: ITableCellWrapper;
}

export interface IDetailViewWrappers extends IComponentLookup {
  detailView: IDetailViewWrapper;
  detailSection: IDetailSectionWrapper;
  detailField: IDetailFieldWrapper;
}
