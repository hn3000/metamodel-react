/// <reference path="../typings/index.d.ts" />

import * as React from 'react';
import {
  MetaForm,
  MetaPage,
  MetaInput
} from '../src/metamodel-react';

import * as mm from '@hn3000/metamodel';

export interface IFormPage2Props {
  currentPage: number;
  metamodel: mm.IModelTypeComposite<any>;
  next: (event:UIEvent) => void;
  previous: (event:UIEvent) => void;
}


export class ContactFormPage2 extends React.Component<IFormPage2Props, IFormPage2Props> {
  
  render() {
    var model = this.props.metamodel;
    return (
      <MetaPage page={1} currentPage={this.props.currentPage}>
        <MetaInput field="email" metamodel={model} />
        <MetaInput field="blah" metamodel={model} />
        <button onClick={this.props.previous}>previous</button>
      </MetaPage>
    );
  }
}
