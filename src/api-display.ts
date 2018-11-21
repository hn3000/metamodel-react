
import * as React from 'react';
import {
  IComponentLookup
} from './api-common';

export interface ITableHeadWrapperProps {

}

export interface ITableRowWrapperProps {

}

export interface ITableCellWrapperProps {

}

export interface IDetailViewWrapperProps {

}

export interface IDetailSectionWrapperProps {

}

export interface IDetailFieldWrapperProps {

}

export type ITableHeadWrapper = React.ComponentType<ITableHeadWrapperProps>;
export type ITableRowWrapper = React.ComponentType<ITableRowWrapperProps>;
export type ITableCellWrapper = React.ComponentType<ITableCellWrapperProps>;

export type IDetailViewWrapper = React.ComponentType<IDetailViewWrapperProps>;
export type IDetailSectionWrapper = React.ComponentType<IDetailSectionWrapperProps>;
export type IDetailFieldWrapper = React.ComponentType<IDetailFieldWrapperProps>;

export interface IDisplayWrappers extends IComponentLookup {
  tableHead: ITableHeadWrapper;
  tableRow: ITableRowWrapper;
  tableCell: ITableCellWrapper;

  detailView: IDetailViewWrapper;
  detailSection: IDetailSectionWrapper;
  detailField: IDetailFieldWrapper;
}
