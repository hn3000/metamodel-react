
/*
import {
  Primitive
} from '@hn3000/metamodel';
*/

import {
  IInputProps,
  IInputComponentProps,
  InputComponent,
  IFormContext,
//  IWrapperComponentProps
} from './api-input';
import { MetaContextFollower } from './base-components';

import * as React from 'react';

export class MetaInput extends MetaContextFollower<IInputProps, any> {

  static contextTypes = MetaContextFollower.contextTypes;

  constructor(props:IInputProps, context:any) {
    super(props, context);
    if (null == this.formContext) console.log("no context found for MetaInput", props);
    this.initialContext(this.formContext);

    this.changeHandler = this.changeHandler.bind(this);
    this.nochangeHandler = this.nochangeHandler.bind(this);
  }

  changeHandler(update: React.FormEvent<HTMLElement>|any) {
    const updateIsEvent = (
      (update instanceof Event)
      || (null != update && update.nativeEvent instanceof Event)
    );
    const updateIsValue = !updateIsEvent;

    let newValue: any;

    if  (updateIsValue) {
      newValue = update;
    } else if (update.hasOwnProperty('target')) {
      let evt = update as React.FormEvent<HTMLElement>;
      let target = evt.target as HTMLInputElement;
      if (target.type === "checkbox") {
        newValue = target.checked;
      } else {
        newValue = target.value;
      }
    }

    if (newValue === '') {
      newValue = null;
    }

    let context = this.formContext;
    let fieldName = this.props.field;

    let oldValue = null;

    if (null != this.props.onChange) {
      oldValue = context.viewmodel.getFieldValue(fieldName);
    }

    context.updateModel(fieldName, newValue);

    if (null != this.props.onChange) {
      let newValue = context.viewmodel.getFieldValue(fieldName);
      if (newValue !== oldValue) {
        this.props.onChange(context, fieldName, newValue, oldValue);
      }
    }
  }

  nochangeHandler() {
    // just a dummy to provide to the input
  }

  render() {
    const context = this.formContext;
    const fieldName = this.props.field;
    const fieldContainerType = context.viewmodel.getFieldContainerType(fieldName);
    const fieldType = context.viewmodel.getFieldType(fieldName);
    if (!fieldType) {
      console.log(`field ${fieldName} not found in ${context.metamodel.name}`);
      return null;
    }

    const hasChildren = 0 < React.Children.count(this.props.children);
    let flavor = this.props.flavor || this.props.flavour || fieldType.propGet('flavour');

    let Input:InputComponent = null;
    let Wrapper = context.config.wrappers.field;

    if (!hasChildren) {
      let matcher = context.config.findBestMatcher(fieldType, fieldName, flavor, fieldContainerType);
      if (null != matcher && matcher.condition) {
        if (!matcher.condition(context)) {
          matcher = null;
        }
      }
      if (null == matcher || null == matcher.component) {
        // no children, no renderer: omit completely
        return null;
      }
      Input = matcher.component;
      if (null != matcher.wrapper) {
        Wrapper = matcher.wrapper;
      }
    }

    if (this.props.hasOwnProperty('wrapper')) {
      Wrapper = this.props.wrapper;
    }

    let formid = this.formContext.metamodel.name;

    //let theValue = (undefined !== this.state.fieldValue) ? this.state.fieldValue : '';
    let viewmodel = context.viewmodel;
    let fieldErrors = viewmodel.getFieldMessages(fieldName);
    let modelValue = viewmodel.getFieldValue(fieldName);

    let fieldValue = modelValue;

    if (null == fieldValue) {
      switch (fieldType.kind) {
        case 'array':
        case 'object':
          fieldValue = fieldType.create();
          break;
        default:
          fieldValue = "";
          break;
      }
    }

    let isEditable = context.viewmodel.isFieldEditable(this.props.field);

    let props:IInputComponentProps = {
      id: formid+'#'+this.props.field,
      flavor, flavour: flavor,
      field: this.props.field,
      fieldType: fieldType,
      editable: isEditable,
      hasErrors: (0 < this.state.fieldErrors.length),
      errors: fieldErrors,
      value: fieldValue,
      defaultValue: fieldValue,
      onChange: isEditable ? this.changeHandler : this.nochangeHandler,
      context: this.formContext
    };

    let children:any;
    if (!hasChildren && null != Input) {
      children = [ <Input key={0} {...props} /> ];
    } else {
      children = React.Children.map(this.props.children, (c) => {
        // avoid providing our props to html elements or NPEs
        if (null == c || typeof((c as any).type) === 'string') {
          return c;
        }
        return React.cloneElement(c as JSX.Element, props);
      });
    }

    if (Wrapper) {
        return <Wrapper {...props}>{children}</Wrapper>;
    } else {
      return <div>{children}</div>
    }

  }

  /*
  shouldComponentUpdate(nextProps: IInputProps, nextState: any, nextCtx: any) {
    let nextContext = nextCtx.formContext as IFormContext;
    let thisContext = this.formContext;

    let field = this.props.field;
    let state = this.state;
    let newValue = nextContext.viewmodel.getFieldValue(field);
    let oldValue = state.fieldValue;
    let newErrors = nextContext.viewmodel.getFieldMessages(field);
    let oldErrors = state.fieldErrors;

    return newValue != oldValue || newErrors != oldErrors && newErrors.length > 0 && oldErrors.length > 0;
  }*/

  _extractState(context:IFormContext) {
    let fieldName = this.props.field;
    let result = {
      fieldErrors: context.viewmodel.getFieldMessages(fieldName),
      fieldValue: context.viewmodel.getFieldValue(fieldName)
    } as any;
    return result;
  }

  private _context:any;
}
