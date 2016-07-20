
import * as React from 'react';

import {
  IModelType,
  IModelTypeComposite
} from '@hn3000/metamodel';

import {
  IInputComponentProps,
  IInputComponentState,
  IWrapperComponentProps 
} from './api';

import {
  MetaContextAwarePure
} from './base-components'

export class FieldWrapper extends React.Component<IWrapperComponentProps,void> {
  render() {
    var props:any = {};
    var errors:JSX.Element[] = [];
    if (this.props.hasErrors) {
      props['className'] = 'has-error'; 
    }
    return <div {...props}>
      {this.props.children}
      <div className="errors">There were errors:</div>
      {this.props.errors.map((e) => <div key={e} className="errors">{e.msg}</div>)}
    </div>;
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
    return <input type="text" placeholder={props.field} onChange={props.onChange} value={props.value}></input>;
  }
}

export class MetaFormInputNumber extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let props = this.props;
    return <input type="text" placeholder={this.props.field} onChange={props.onChange} value={props.value}></input>;
  }
}

export class MetaFormInputBool extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let props = this.props;
    return <input type="checkbox" onChange={props.onChange} checked={props.value}></input>;
  }
}

export class MetaFormInputEnumSelect extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let props = this.props;
    let fieldType = props.fieldType;
    
    let itemType = fieldType.asItemType();
    var values:any[] = [  ];
    if (null != itemType) {
      values = itemType.possibleValues();
    }
    let hasValue = null != props.value;
    return (<select onChange={props.onChange} value={props.value}>
      <option key={null} value={null} disabled={hasValue} hidden={hasValue}>choose one</option>
      {values.map((x:string)=> (<option key={x} value={x}>{x}</option>))}
    </select>);
  }
}

export class MetaFormInputEnumRadios extends React.Component<IInputComponentProps, IInputComponentState> {
  constructor(props:IInputComponentProps, context:any) {
    super(props, context);
    this._group = (Math.random()*Number.MAX_VALUE).toString(36);
  }
  render() {
    let props = this.props;
    let fieldType = props.fieldType;
    
    let itemType = fieldType.asItemType();
    var values:any[] = [  ];
    if (null != itemType) {
      values = itemType.possibleValues();
    }
    let group = this._group;
    let radios = values.map((x:string)=> (
      <label key={x+'_'+group}>
        <input type="radio" name={group} onChange={props.onChange} value={x} checked={x === props.value} />{x}
      </label>
    ));

    return <div>{radios}</div>;
  }

  private _group:string;
}

export class MetaFormInputEnumCheckbox extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let props = this.props;
    let fieldType = props.fieldType;
    
    let itemType = fieldType.asItemType();
    var values:any[] = [  ];
    if (null != itemType) {
      values = itemType.possibleValues();
    }

    let radios = values.map((x:string)=> (
      <label>
        <input type="checkbox" onChange={props.onChange} value={x} checked={x === props.value} />{x}
      </label>
    ));

    return <div>{radios}</div>;
  }
}

export class MetaFormUnknownFieldType extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    return <input type="text" placeholder={this.props.field+": unknown kind"}></input>;
  }
}
