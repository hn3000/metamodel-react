
import * as React from 'react';
import {
  IModelType,
  IModelTypeComposite
} from '@hn3000/metamodel';

import {
  IInputComponentProps,
  IInputComponentState,
  IWrapperComponentProps
} from './interfaces';

export class FieldWrapper extends React.Component<IWrapperComponentProps,void> {
  render() {
    var props:any = {};
    if (this.props.hasErrors) {
      props['className'] = 'has-error'; 
    }
    return <div {...props}>{this.props.children}</div>;
  }
}
export class PageWrapper extends React.Component<IWrapperComponentProps,void> {
  render() {
    return <div>{this.props.children}</div>;
  }
}
export class FormWrapper extends React.Component<IWrapperComponentProps,void> {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export class MetaFormInputString extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let props = this.props;
    return <input type="text" placeholder={props.field} onChange={props.onChange} defaultValue={props.defaultValue}></input>;
  }
}

export class MetaFormInputNumber extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let props = this.props;
    return <input type="text" placeholder={this.props.field} onChange={props.onChange} defaultValue={props.defaultValue}></input>;
  }
}

export class MetaFormInputBool extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let props = this.props;
    return <input type="checkbox" onChange={props.onChange} value={props.value}></input>;
  }
}

export class MetaFormInputEnum extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let props = this.props;
    let fieldType = props.fieldType;
    
    let itemType = fieldType.asItemType();
    var values = [ "a", "b" ];
    if (null != itemType) {
      //let possibleValuesConstraints = itemType.
    }

    return (<select onChange={props.onChange} value={props.value}>
      {values.map((x:string)=> (<option value={x}>x</option>))}
    </select>);
  }
}

export class MetaFormUnknownFieldType extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    return <input type="text" placeholder={this.props.field+": unknown kind"}></input>;
  }
}
