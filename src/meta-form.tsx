
import {
  IFormProps, 
  IFormState,
  IFormContext
} from './api';

import { 
  MetaContextAware, 
  MetaContextFollower, 
  MetaContextAwarePure 
} from './base-components';

import * as React from 'react';

export class MetaForm extends MetaContextFollower<IFormProps, IFormState> {
	static childContextTypes = MetaContextAware.contextTypes; 
	
  getChildContext() {
	  return {
      formContext: this.props.context
    };
	}

  constructor(props:IFormProps, context:any) {
    super(props, context);
    //if (null == props.context ) console.log("no context found in context for MetaForm", props);
    this.state = {
      viewmodel: this.formContext.viewmodel,
      currentPage: this.formContext.currentPage
    };
  }


  render() {
    let Wrapper = this.formContext.config.wrappers.form;

    /*
    let adjustedChildren = React.Children.map(this.props.children,
      (c) => React.cloneElement(c, {context: this.props.context}));
    */
    return (<Wrapper>
      <form id={this.formContext.metamodel.name} >
        {this.props.children}
      </form>
      </Wrapper>);
  }

  _updateState(context:IFormContext) {
    this.setState({
      viewmodel: context.viewmodel,
      currentPage: context.currentPage
    })
  }
}

