
import * as React from 'react';

import { IPageProps } from './api';
import { MetaContextFollower } from './base-components';
import { MetaForm } from './meta-form';


export class MetaPage extends MetaContextFollower<IPageProps, any> {

  static contextTypes = MetaForm.childContextTypes;

  constructor(props:IPageProps, context:any) {
    super(props, context);
  }

  render() {
    let context = this.formContext;

    if (this.props.page == context.currentPage) {
      let formContext = this.formContext;
      let Wrapper = this.formContext.config.wrappers.page;
      return <Wrapper busy={formContext.isBusy()}>{this.props.children}</Wrapper>;
    }
    return null;
  }
}

