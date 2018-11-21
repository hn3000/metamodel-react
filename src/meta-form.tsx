
import {
  IFormProps,
  IFormContext
} from './api-input';

import {
  MetaContextAware,
  MetaContextFollower
} from './base-components';

import * as React from 'react';
import { MessageSeverity, IPropertyStatusMessage } from '@hn3000/metamodel';

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
      console.log("no context found in props for MetaForm", props);
    } else {
      this.initialContext(this.props.context);
    }
  }


  render() {
    const formContext = this.formContext;
    const Wrapper = formContext.config.wrappers.form;

    /*
    let adjustedChildren = React.Children.map(this.props.children,
      (c) => React.cloneElement(c, {context: this.props.context}));
    */

    const metamodel = formContext.metamodel;
    const schema = metamodel.propGet('schema');
    const modelId = (schema && schema.modelId) || metamodel.name;

    const hasErrors = !formContext.isValid();
    const messages = formContext.viewmodel.getStatusMessages();
    const errors = messages.filter(x => x.severity == MessageSeverity.ERROR && 'property' in x) as IPropertyStatusMessage[];

    const wrapperProps = {
      id: modelId,
      busy: formContext.isBusy(),
      context: formContext,
      hasErrors,
      messages,
      errors
    };

    //console.log('meta-form render', wrapperProps);

    return (<Wrapper {...wrapperProps}>
        {this.props.children}
      </Wrapper>);
  }

  _extractState(context:IFormContext) {
    const result = {
      busy: context.isBusy(),
      page: context.currentPage,
      pageMessages: context.viewmodel.getPageMessages(),
      statusMessages: context.viewmodel.getStatusMessages(),
      conclusio: context.getConclusion()
    } as any;
    //console.log("meta-form extractState", result);
    return result;
  }
}

