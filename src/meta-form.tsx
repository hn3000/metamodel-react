
import {
  IFormProps, 
  IFormContext
} from './api';

import { 
  MetaContextAware, 
  MetaContextFollower, 
  MetaContextAwarePure 
} from './base-components';

import * as React from 'react';

export class MetaForm extends MetaContextFollower<IFormProps, any> {
	static childContextTypes = MetaContextAware.contextTypes; 
	
  getChildContext() {
	  return {
      formContext: this.props.context
    };
	}

  constructor(props:IFormProps, context:any) {
    super(props, context);
    if (null == props.context) {
      console.log("no context found in context for MetaForm", props);
    }
  }


  render() {
    let formContext = this.formContext;
    let Wrapper = formContext.config.wrappers.form;

    /*
    let adjustedChildren = React.Children.map(this.props.children,
      (c) => React.cloneElement(c, {context: this.props.context}));
    */

    let metamodel = formContext.metamodel;
    let modelId = metamodel.propGet('schema').modelId || metamodel.name;

    return (<Wrapper id={modelId} busy={formContext.isBusy()}>
        {this.props.children}
      </Wrapper>);
  }

  _updateState(context:IFormContext) {
    this.setState({
      viewmodel: context.viewmodel,
      currentPage: context.currentPage
    })
  }
}

