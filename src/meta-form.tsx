
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
import { Requireable } from 'prop-types';

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
    } else {
      this.initialContext(this.props.context);
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

  _extractState(context:IFormContext) {
    return {
      busy: context.isBusy(),
      page: context.currentPage,
      pageMessages: context.viewmodel.getStatusMessages(),
      statusMessages: context.viewmodel.getStatusMessages(),
      conclusio: context.getConclusion()
    } as any;
  }
}

