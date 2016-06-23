/// <reference path="../typings/index.d.ts" />

import * as React from 'react';
import {
  IModelType,
  IModelTypeComposite
} from '@hn3000/metamodel';

export class ViewModel {
  constructor(metamodel:IModelTypeComposite<any>) {
    this._metamodel = metamodel;
  }

  private _metamodel:IModelTypeComposite<any>;
}

export interface IFormContext {
  getWidget(field:IModelType<any>, fieldName?:string): any;
}

export interface IFormProps {
  metamodel: IModelTypeComposite<any>;
  currentPage?:number;
}

export interface IFormState extends IFormProps {
  currentPage: number;
}

export class MetaForm extends React.Component<IFormProps, IFormState> {
  render() {
    return <form id={this.props.metamodel.name} >{this.props.children}</form>;
  }
}

export interface IPageProps {
  currentPage:number;
  page: number;
}

export interface IPageState extends IPageProps {
}

export class MetaPage extends React.Component<IPageProps, IPageState> {
  render() {
    if (this.props.page == this.props.currentPage) {
      return <div class="metamodel-react--page">{this.props.children}</div>;
    }
    return null;
  }
}

export interface IInputProps {
  metamodel: IModelTypeComposite<any>;
  field: string;
  flavour?: string;
  flavor?: string;
}

export interface IInputState extends IInputProps {
  flavour: string;
}

export class MetaInput extends React.Component<IInputProps, IInputState> {
  getFormContext():IFormContext {
    // ...
    return null;
  }
  render() {

    var fieldName = this.props.field;
    var field = this.props.metamodel.subModel(fieldName).asItemType();
    var typeSelector = field.kind;

    switch (field.kind) {
      case 'string':
        return <input type="text"  placeholder={fieldName}></input>;
      case 'number':
        return <input type="number" placeholder="<a number>"></input>;
      case 'bool':
        // ... 
        return React.createElement(this.getFormContext().getWidget(field, fieldName));
      default:
        return <span>missing input kind {field.kind}</span>;
    }
  }
}