
import * as React from 'react';
import {
  MetaForm,
  MetaPage,
  MetaInput,
  IFormContext
} from '../src/metamodel-react';

import * as mm from '@hn3000/metamodel';

export interface IFormPage2Props {
  context?: IFormContext;
}


export class ContactFormPage2 extends React.Component<IFormPage2Props, IFormPage2Props> {

  render() {
    return (
        <div>
          <MetaInput field="email" />
          <MetaInput field="email2" />
          <MetaInput field="birth" />
          <MetaInput field="flag1" />
          <MetaInput field="flag2" />
        </div>
    );
  }
}
