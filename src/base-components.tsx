
import * as React from 'react';

import { IFormContext } from './api';
import { MetaFormContext } from './form-context';
import { propsDifferent } from './props-different';

export interface IMetaFormBaseProps {
  context?: IFormContext;
}
export interface IMetaFormBaseState {
  currentPage?:number;
}

export var MetaForm_ContextTypes = {
  formContext: React.PropTypes.shape({
    config: React.PropTypes.object,
    metamodel: React.PropTypes.object,
    viewmodel: React.PropTypes.object,
    currentPage: React.PropTypes.number,
    i18nData: React.PropTypes.object
  })
};

export abstract class MetaContextAware<
      P extends IMetaFormBaseProps, 
      S
    > 
    extends React.Component<P, S> 
{

  static contextTypes = MetaForm_ContextTypes;

  constructor(props:P, context?:MetaFormContext) {
    super(props, context);
    if (null == this.formContext || null == this.formContext.metamodel) {
      let name = (this.constructor as any).name || '';
      console.log(`missing context info in MetaContextAware ${name}`, props, context);
    }
  }

  get formContext():IFormContext {
    return this.props.context || (this.context as any).formContext;
  } 
}

export class MetaContextAwarePure<P,S> extends MetaContextAware<P,S> {
  shouldComponentUpdate(nextProps: P, nextState: S, nextContext: any): boolean {
    return propsDifferent(this.props, nextProps);
  }

}

export abstract class MetaContextFollower<
      P extends IMetaFormBaseProps, 
      S
    > 
    extends MetaContextAware<P, S> 
{

  static contextTypes = MetaForm_ContextTypes;

  constructor(props:P, context?:MetaFormContext) {
    super(props, context);
    this._unsubscribe = null;
  }

  protected _updatedState(context?:IFormContext, initState?:boolean) {
    let newState:S = { 
      currentPage: context.currentPage 
    } as any;
    if (initState) {
      this.state = newState;
    } else {
      this.setState(newState);
    }
  }

  componentDidMount() {
    this._unsubscribe && this._unsubscribe();
    this._unsubscribe = this.formContext.subscribe(() => {
      if (!this._unsubscribe) return;
      this._updatedState(this.formContext);
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
    this._unsubscribe = null;
  }

  private _unsubscribe:()=>void;

}

