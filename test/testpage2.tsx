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
  context: IFormContext;
}


export class ContactFormPage2 extends React.Component<IFormPage2Props, IFormPage2Props> {
  
  render() {
    var context = this.props.context;
    return (
      <MetaPage page={1} context={context}>
        <MetaInput field="email" context={context} />
        <MetaInput field="email2" context={context} />
        <MetaInput field="birth" context={context} />
        <MetaInput field="flag1" context={context} />
        <MetaInput field="flag2" context={context} />
        <button onClick={context.pageBack}>previous</button>
      </MetaPage>
    );
  }
}
