
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Requireable } from 'prop-types';
export { Requireable } from 'prop-types';

import { IFormContext, IMetaFormBaseProps } from './api';
import { MetaFormContext } from './form-context';
import { propsDifferent } from './props-different';

export interface IMetaFormBaseState {
  currentPage?:number;
}

export var MetaForm_ContextTypes = {
  isRequired: function():Error { return null; },
  formContext: PropTypes.shape({
    config: PropTypes.object,
    metamodel: PropTypes.object,
    viewmodel: PropTypes.object,
    currentPage: PropTypes.number,
    i18nData: PropTypes.object
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

  /*
  shouldComponentUpdate(nextProps: P, nextState: S, nextContext: any): boolean {
    return (
      propsDifferent(this.props, nextProps)
      || propsDifferent(this.state, nextState)
      || propsDifferent(this.context, nextContext)
    );
  }
  */
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

  protected initialContext(context:IFormContext) {
    this._updatedContext(context, true);
  }

  protected _extractState(context:IFormContext): S {
    var newState:S = {
      currentPage: context.currentPage,
      viewmodel: context.viewmodel
    } as any;
    return newState;
  }

  private _updatedContext(context:IFormContext, initState?:boolean) {
    let newState:S = this._extractState(context);
    if (initState) {
      this.state = newState;
    } else {
      if (propsDifferent(this.state, newState)) {
//console.debug(`new state: ${newState} replaces ${this.state}`);
        this.setState(newState);
      }
    }
  }

  componentDidMount() {
    this._unsubscribe && this._unsubscribe();
    this._unsubscribe = this.formContext.subscribe(() => {
      if (!this._unsubscribe) return;
      this._updatedContext(this.formContext);
      //this.forceUpdate();
    });
  }

  componentWillUnmount() {
    const unsub = this._unsubscribe;
    if (null != unsub) {
      this._unsubscribe = null;
      unsub();
    }
  }

  private _unsubscribe:()=>void;

}

