
import * as React from 'react';

import {
  IModelType,
  IModelTypeComposite,
  ModelTypeArray,
  ModelTypeConstraintMore,
  ModelTypeConstraintLess,
  ModelTypeConstraintMultipleOf
} from '@hn3000/metamodel';

import {
  IInputComponentProps,
  IInputComponentState,
  IFormWrapperProps,
  IPageWrapperProps,
  IFieldWrapperProps
} from './api';

import {
  MetaContextAwarePure
} from './base-components'

import { propsDifferent } from './props-different';

export class FieldWrapper extends React.Component<IFieldWrapperProps,any> {
  render() {
    var props:any = {};
    var errors:JSX.Element[] = [];
    if (this.props.hasErrors) {
      props['className'] = 'has-error';
    }
    return <div {...props}>
      {this.props.children}
      { this.props.hasErrors && <div>
        <div className="errors">There were errors:</div>
        {this.props.errors.map((e) => <div key={e.code} className="errors">{e.msg}</div>)}
        </div>
      }
    </div>;
  }
}
export class PageWrapper extends React.Component<IPageWrapperProps,any> {
  render() {
    return <div>{this.props.children}</div>;
  }
}
export class FormWrapper extends React.Component<IFormWrapperProps,any> {
  render() {
    let wrapperProps:any = {};
    if (this.props.busy) {
      wrapperProps.className = 'form-busy';
    }
    return <form method="POST" action="#" {...wrapperProps}>{this.props.children}</form>;
  }
}

export class MetaFormInputString extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let { field, onChange, value, placeholder } = this.props;
    return <input type="text" placeholder={placeholder || field} onChange={onChange} value={value}></input>;
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
    let vm = props.context.viewmodel;

    let values:any[] = vm.getPossibleFieldValues(props.field);
    if (null == values) {
      values = [];
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
    let vm = props.context.viewmodel;

    let values:any[] = vm.getPossibleFieldValues(props.field);
    if (null == values) {
      values = [];
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

    let checkBoxes = values.map((x:string)=> (
      <label>
        <input type="checkbox" onChange={props.onChange} value={x} checked={x === props.value} />{x}
      </label>
    ));

    return <div>{checkBoxes}</div>;
  }
}

export class MetaFormInputEnumCheckboxArray extends React.Component<IInputComponentProps, IInputComponentState> {

  constructor(props: IInputComponentProps, context: any) {
    super(props, context);
    this.updateValue = this.updateValue.bind(this);
  }

  updateValue(ev: React.FormEvent<HTMLInputElement>) {
    let target = ev.target as HTMLInputElement;
    let value = (this.props.value as string[]) || [];
    if (target.checked) {
      if (-1 === value.indexOf(target.value)) {
        value = value.concat([ target.value ]);
      }
    } else {
      value = value.filter(x => x != target.value);
    }
    this.props.onChange(value);
  }

  render() {
    const props = this.props;
    const fieldType = props.fieldType as ModelTypeArray<any>;

    const itemType = fieldType.itemType().asItemType();
    let values:any[] = [  ];
    if (null != itemType) {
      values = itemType.possibleValues();
    }

    let checkBoxes = values.map((x:string)=> (
      <label key={x}>
        <input type="checkbox" onChange={this.updateValue} value={x} checked={-1 !== props.value.indexOf(x)} />{x}
      </label>
    ));

    return <div>{checkBoxes}</div>;
  }
}

export interface IInputNumberSliderProps extends IInputComponentProps {
  min?: number;
  max?: number;
  step?: number;
}

export interface IInputNumberSliderState {
  min: number;
  max: number;
  step: number;
}

export class MetaFormInputNumberSliderCombo extends React.Component<IInputNumberSliderProps, IInputNumberSliderState> {

  constructor(props: IInputNumberSliderProps, context: any) {
    super(props, context);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.deriveState = this.deriveState.bind(this);

    this.state = this.deriveState(null, props);
  }

  deriveState(oldState: IInputNumberSliderState, props:IInputNumberSliderProps) {
    let itemType = props.fieldType.asItemType();
    let minC = itemType.lowerBound() as ModelTypeConstraintMore;
    let maxC = itemType.upperBound() as ModelTypeConstraintLess;
    let multC = itemType.findConstraints(c => c.id.indexOf('multipleOf') === 0);

    let min = minC && minC.value;
    let max = maxC && maxC.value;

    let step = props.step || (multC.length && (multC[0] as ModelTypeConstraintMultipleOf).modulus);

    if (null != props.min && (null == min || min > props.min)) {
      min = props.min;
    }
    if (null != props.max && (null == max || max < props.max)) {
      max = props.max;
    }

    if (null != step) {
      if (null != min) {
        min = Math.round(Math.ceil(min/step) * step);
      }
      if (null != max) {
        max = Math.round(Math.floor(max/step) * step);
      }
    }

    return { min, max, step };
  }

  componentWillReceiveProps(props: IInputNumberSliderProps) {
    if (propsDifferent(props, this.props)) {
      this.setState(this.deriveState);
    }
  }

  handleMouseMove(ev: React.MouseEvent<HTMLInputElement>) {
    if (ev.buttons !== 0) {
      this.handleChange(ev);
    }
  }

  handleChange(ev: React.FormEvent<HTMLInputElement>) {
    let { min, max, step } = this.state;
    let value: string|number = Number(ev.currentTarget.value);

    if (isNaN(value)) {
      value = ev.currentTarget.value;
    } else if (null != step) {
      value = Math.round(Math.round(value/step) * step);
      if (null != min && value < min) {
        value = Math.round(Math.ceil(min/step) * step);
      } else if (null != max && value > max) {
        value = Math.round(Math.floor(max/step) * step);
      }
    }

    this.props.onChange(value);
  }


  render() {
    let onChange = this.handleChange;
    let { value } = this.props;
    let { min, max, step } = this.state;

    return <div>
      <input min={min} max={max} step={step}
             type="range"
             value={value}
             onChange={onChange}
             onMouseUp={onChange}
             onMouseMoveCapture={this.handleMouseMove} />
      <input min={min} max={max} step={step}
             type="number"
             value={value}
             onChange={onChange} />
    </div>;
  }
}

export interface IFileInputState {
  dataurl:string;
  error?:string;
}

export class MetaFormInputFile extends React.Component<IInputComponentProps, IFileInputState> {
  constructor(props:IInputComponentProps, reactContext:any) {
    super(props, reactContext);

    this.state = { dataurl: null };
    this.handleFile = this.handleFile.bind(this);
    this.handleContents = this.handleContents.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleContents(evt:ProgressEvent) {
    //console.log('loaded: ', evt.target);
    this.setState({ dataurl: ''+(evt.target as FileReader).result });
  }
  handleError(reader: FileReader, evt:ProgressEvent) {
    console.log('error: ', evt);
    this.setState({ error: ''+reader.error, dataurl: null });
  }

  handleFile(evt:React.FormEvent<HTMLElement>) {
    let files = (evt.target as HTMLInputElement).files;
    if (files && files.length) {
      let first = files[0];
      let reader = new FileReader();
      reader.onloadend = this.handleContents;
      reader.onerror = this.handleError.bind(this, reader);
      reader.readAsDataURL(first);
      this.props.context.updateModel(this.props.field, {
        file: first,
        name: first.name
      });
    }
  }

  render() {
    let props = this.props;
    let state = this.state;
    return <div>
      <input type="file" onChange={this.handleFile} defaultValue={this.props.defaultValue.file}></input>
      { state.dataurl && <img src={state.dataurl} height="50" /> }
      { state.error && <span className="error">{state.dataurl}</span> }
    </div>;
  }
}



export class MetaFormUnknownFieldType extends React.Component<IInputComponentProps, IInputComponentState> {
  render() {
    let { field, fieldType } = this.props;
    return <input type="text" placeholder={`${field}: unknown kind "${fieldType.kind}"`}></input>;
  }
}
