
import * as React from 'react';

import { IPageProps } from './api';
import { MetaContextFollower } from './base-components';
import { MetaForm } from './meta-form';

import { propsDifferent } from './props-different';

export class MetaPage extends MetaContextFollower<IPageProps, any> {

  static contextTypes = MetaForm.childContextTypes;

  constructor(props:IPageProps, context:any) {
    super(props, context);
  }

  private _skipped = 0;

  shouldComponentUpdate(nextProps: IPageProps, nextState: any, nextContext: any): boolean {
    let formContext = this.formContext;
    let nextFormContext = nextContext.formContext;
    let result =  (
        this.props.page === formContext.currentPage 
        || nextProps.page === nextFormContext.currentPage
      ) && (
        true // super.shouldComponentUpdate(nextProps, nextState, nextContext)
      );
    if (result) {
      this._skipped = 0;
    } else {
      ++this._skipped;
    }

    console.log(`page scu: ${nextProps.page} ${result} (skipped ${this._skipped})`);
    return result;
  }

  render() {
    let context = this.formContext;

    if (this.props.page == context.currentPage) {
      let Wrapper = context.config.wrappers.page;
      console.log(`rendering page ${this.props.page}`);
      if (null == this.props.contents) {
        return <Wrapper busy={context.isBusy()}>{this.props.children}</Wrapper>;
      } else {
        if (0 != React.Children.count(this.props.children)) {
          console.log(`warning: MetaPage ignores children if contents (${this.props.contents}) is specified`);
        }
        let Contents = this.props.contents;
        return <Wrapper busy={context.isBusy()}><Contents /></Wrapper>;
      }
    }
    console.log(`not rendering page ${this.props.page}, we're on ${context.currentPage}`);
    return null;
  }
}

