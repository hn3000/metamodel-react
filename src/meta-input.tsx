
import { 
  IInputProps,
  IInputComponentProps,
  InputComponent,
  IFormContext,
  IWrapperComponentProps
} from './api';
import { MetaContextFollower, MetaContextAware } from './base-components';

import * as React from 'react'; 

export class MetaInput extends MetaContextFollower<IInputProps, any> {

  static contextTypes = MetaContextFollower.contextTypes;

  constructor(props:IInputProps, context:any) {
    super(props, context);
    if (null == this.formContext) console.log("no context found for MetaInput", props);
    this._updatedState(this.formContext, true);

    this.changeHandler = this.changeHandler.bind(this);
    this.nochangeHandler = this.nochangeHandler.bind(this);
  }

  changeHandler(evt:React.FormEvent) {
    let target = evt.target as any;
    let context = this.formContext;
    let fieldName = this.props.field;

    if (target.type === "checkbox") {
      context.updateModel(fieldName, target.checked);
    } else {
      // TOOD: should we check null is okay?
      if (target.value == '') {
        context.updateModel(fieldName, null);
      } else {
        context.updateModel(fieldName, target.value);
      }
    }
  }

  nochangeHandler() {
    // just a dummy to provide to the input
  }

  render() {
    let context = this.formContext;
    var fieldName = this.props.field;
    var fieldType = context.viewmodel.getFieldType(fieldName);

    if (!fieldType) {
      console.log(`field ${fieldName} not found in ${context.metamodel.name}`);
      return null;
    }

    let formid = this.formContext.metamodel.name;

    //let theValue = (undefined !== this.state.fieldValue) ? this.state.fieldValue : '';
    let viewmodel = context.viewmodel;
    let fieldErrors = viewmodel.getFieldMessages(fieldName);
    let modelValue = viewmodel.getFieldValue(fieldName);
    let fieldValue = (null != modelValue) ? modelValue : '';

    let isEditable = context.viewmodel.isFieldEditable(this.props.field);

    let props:IInputComponentProps = { 
      id: formid+'#'+this.props.field,
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

    let flavor = this.props.flavor || this.props.flavour;

    var Wrapper = context.config.wrappers.field;

    if (this.props.hasOwnProperty('wrapper')) {
      Wrapper = this.props.wrapper; 
    }

    var children:any;

    var Input:InputComponent;
    if (0 === React.Children.count(this.props.children)) {
      Input = context.config.findBest(fieldType, fieldName, flavor);
      children = [ <Input key={0} {...props} /> ];
    } else {
      children = React.Children.map(this.props.children, (c) => {
        // avoid providing our props to html elements
        if (typeof((c as any).type) === 'string') return c;
        return React.cloneElement(c as JSX.Element, props);
      });
    }

    if (Wrapper) {
        return <Wrapper {...props}>{children}</Wrapper>;
    } else {
      return <div>{children}</div>
    }

  }

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
  }

  _updatedState (context:IFormContext, initState:boolean) {
      let fieldName = this.props.field;
      let result = {
    	  fieldErrors: context.viewmodel.getFieldMessages(fieldName),
    	  fieldValue: context.viewmodel.getFieldValue(fieldName)
      };

      if (initState) {
        this.state = result;
      } else {
        let state = this.state;
        let newValue = result.fieldValue;
        let oldValue = state.fieldValue;
        let newErrors = result.fieldErrors;
        let oldErrors = state.fieldErrors; 

        if (newValue !== oldValue || newErrors !== oldErrors && (newErrors.length > 0 || oldErrors.length > 0)) {
          this.setState(result);
          //this.forceUpdate();
        }
      }
    }

  private _context:any;
}
