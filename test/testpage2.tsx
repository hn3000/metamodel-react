/// <reference path="../typings/index.d.ts" />

import * as React from 'react';
import {
  MetaForm,
  MetaPage,
  MetaInput,
  IFormContext
} from '../src/metamodel-react';

import * as mm from '@hn3000/metamodel';

export interface IFormPage2Props {
  currentPage: number;
  context: IFormContext;
  next: (event:UIEvent) => void;
  previous: (event:UIEvent) => void;
}


export class ContactFormPage2 extends React.Component<IFormPage2Props, IFormPage2Props> {
  
  render() {
    var context = this.props.context;
    return (
      <MetaPage page={1} currentPage={this.props.currentPage} context={context}>
        <MetaInput field="email" context={context} />
        <MetaInput field="email2" context={context} />
        <MetaInput field="birth" context={context} />
        <button onClick={this.props.previous}>previous</button>
      </MetaPage>
    );
  }
}
