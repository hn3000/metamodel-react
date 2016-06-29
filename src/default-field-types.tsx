
import * as React from 'react';
import {
  IModelType,
  IModelTypeComposite
} from '@hn3000/metamodel';

import {
  IInputProps,
  IInputState
} from './interfaces';

export class FieldWrapper extends React.Component<void,void> {
  render() {
    return <div>{this.props.children}</div>;
  }
}
export class PageWrapper extends React.Component<void,void> {
  render() {
    return <div>{this.props.children}</div>;
  }
}
export class FormWrapper extends React.Component<void,void> {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export class MetaFormInputString extends React.Component<IInputProps, IInputState> {
  render() {
    return <input type="text"  placeholder={this.props.field}></input>;
  }
}

export class MetaFormInputNumber extends React.Component<IInputProps, IInputState> {
  render() {
    return <input type="text"  placeholder={this.props.field}></input>;
  }
}

export class MetaFormInputBool extends React.Component<IInputProps, IInputState> {
  render() {
    return <input type="checkbox"></input>;
  }
}

export class MetaFormUnknownFieldType extends React.Component<IInputProps, IInputState> {
  render() {
    return <input type="text" placeholder={this.props.field+": unknown kind"}></input>;
  }
}
