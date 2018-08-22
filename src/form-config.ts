

import {
  IModelType,
  ModelTypeArray,
  IPropertyStatusMessage
} from  '@hn3000/metamodel';

import {
  IWrappers,
  IComponentMatcher,
  IFormConfig,
  IFormContext,
  InputComponent,
  IModelUpdater
} from './api';

import * as fields from './default-field-types';

import * as React from 'react';

export type matchQFun = (type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]) => number;

export class MatchQ {
  /** Matches by similarity to the given object literal, all props must match. */
  static likeObject(template:any): matchQFun { //</any>
    var keys = Object.keys(template);
    var n = keys.length;

    return ((field:IModelType<any> /*</any>*/) => {
      var result = 0;
      var fieldObj = field as any;
      let schema = fieldObj && fieldObj.propGet && fieldObj.propGet('schema');
      for (var i = 0; i < n; i++) {
        let k = keys[i];
        let t = template[k];
        if (t == fieldObj[k] || t == schema[k]) {
          ++result;
        } else {
          return 0;
        }
      }
      return result;
    });
  }
  /** Matches by IModelType.kind. */
  static kind(kind:string):matchQFun {
    return (field:IModelType<any>) => (field.kind === kind?1:0)
  }
  /** Matches by flavor. Flavor can be given as a prop on the MetaInput or in the schema (where brit. spelling flavour is also accepted). */
  static flavor(flavor:string):matchQFun {
    let flv = flavor;
    return (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]) => {
      if (
        (flavor === flv)
        || ((x) => x && (x.flavor === flv) || (x.flavour === flv))(type.propGet('schema'))
      ) {
        return 1;
      }
      return 0;
    };
  }
  /** Matches by format, shorthand for .likeObject({fornat:'<format>'}) */
  static format(format:string):matchQFun {
    return (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]) => {
      if (
        ((x) => x && (x.format === format))(type.propGet('schema'))
      ) {
        return 1;
      }
      return 0;
    };
  }  
  /** Matches an array type that has elements matching the given matcher. */
  static element(matcher: matchQFun):matchQFun {
    return (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]) => {
      let af = type as ModelTypeArray<any>;
      if (af.itemType && af.itemType()) {
        return matcher(af.itemType(), fieldName, flavor, ...matchArgs);
      }
      return 0;
    };
  }
  /** 
   * Matches if the number of possible values for the element is between from (inclusive)
   * and to (exclusive). Only matches for types that actually have an enumerated list
   * of possible values, so will not match unconstrained numbers or strings. If no upper
   * limit (`to`) is given or it is spcecified as 0, only the minimum is checked.
   */
  static possibleValueCountRange(from:number, to?:number) {
    return (field:IModelType<any>) => {
      let possibleValues = field.asItemType() && field.asItemType().possibleValues();
      let pvc = possibleValues ? possibleValues.length : 0;
      if ((pvc >= from) && (!to || pvc < to)) {
        return 1;
      }
      return 0;
    }
  }
  /** 
   * Matches if all given matchers match by adding the returned quality values. 
   * Quality is zero if any of the matchers returns zero, the sum of all quality
   * values if none of the matchers returned zero.
   */
  static and(...matcher:matchQFun[]):matchQFun {
    return (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]) =>
      matcher.reduce((q, m) => {
        let qq = m(type, fieldName, flavor, ...matchArgs);
        return qq && q + qq;
      }, 0);
  }
  /** 
   * Matches if any of the given matchers match by adding the returned quality values. 
   * Quality is the sum of all quality values and can only be zero if all of the matchers
   * returned zero.
   */
  static or(...matcher:matchQFun[]):matchQFun {
    return (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]) =>
      matcher.reduce((q, m) => {
        let qq = m(type, fieldName, flavor, ...matchArgs);
        return q + ((null != qq) ? qq : 0);
      }, 0);
  }
}

export class MetaFormConfig implements IFormConfig {

  constructor(wrappers?:IWrappers, components?:IComponentMatcher[]) {
    this._wrappers = wrappers || MetaFormConfig.defaultWrappers();
    this._components = components || MetaFormConfig.defaultComponents();
  }

  setWrappers(wrappers:IWrappers) {
    this._wrappers = wrappers;
  }

  public get wrappers():IWrappers {
    return this._wrappers;
  }

  public get matchers(): IComponentMatcher[] {
    return this._components;
  }

  findBest(type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]): InputComponent {
    var bestQ = 0;
    var match:InputComponent = fields.MetaFormUnknownFieldType;

    let matchers = this._components;
    for (var i = 0, n = matchers.length; i<n; ++i) {
      let thisQ = matchers[i].matchQuality(type, fieldName, flavor, ...matchargs);
      if (thisQ > bestQ) {
        match = matchers[i].component;
        bestQ = thisQ;
      }
    }

    return match;
  }

  add(cm:IComponentMatcher) {
    if (-1 == this._components.indexOf(cm)) {
      this._components.push(cm);
    }
  }
  remove(cm:IComponentMatcher) {
    this._components = this._components.filter((x) => x != cm);
  }

  public usePageIndex = false;
  public validateOnUpdate: boolean = false;
  public validateOnUpdateIfInvalid: boolean = false;
  public validateDebounceMS: number = 1000; //in ms

  public busyDelayMS:number = 200;

  public allowNavigationWithInvalidPages: boolean = false;

  public onFormInit:(form:IFormContext)=>Promise<IModelUpdater> = null; // </any>
  public onPageTransition:(form:IFormContext, direction:number)=>Promise<IPropertyStatusMessage[]|IModelUpdater> = null; // </IValidationMessage>
  public onAfterPageTransition:(form:IFormContext)=>void = null;
  public onFailedPageTransition: (ctx:IFormContext) => void = null;
  public onModelUpdate: (ctx:IFormContext) => Promise<IModelUpdater> = null;

  private _wrappers:IWrappers;
  private _components: IComponentMatcher[];

  public static defaultWrappers():IWrappers {
    return {
      form: fields.FormWrapper,
      page: fields.PageWrapper,
      field: fields.FieldWrapper,
    }
  }

  public static defaultComponents() {
    return [
      {
        matchQuality: MatchQ.kind('string'),
        component: fields.MetaFormInputString
      },
      {
        matchQuality: MatchQ.kind('number'),
        component: fields.MetaFormInputNumber
      },
      {
        matchQuality: MatchQ.and(MatchQ.kind('number'), MatchQ.flavor('slider')),
        component: fields.MetaFormInputNumberSliderCombo
      },
      {
        matchQuality: MatchQ.kind('bool'),
        component: fields.MetaFormInputBool
      },
      {
        matchQuality: MatchQ.likeObject({type:'bool'}),
        component: fields.MetaFormInputBool
      },
      {
        matchQuality: MatchQ.likeObject({type:'object', format: 'file'}),
        component: fields.MetaFormInputFile
      },
      {
        matchQuality: MatchQ.and(MatchQ.kind('string'), MatchQ.possibleValueCountRange(10, undefined)),
        component: fields.MetaFormInputEnumSelect
      },
      {
        matchQuality: MatchQ.and(MatchQ.kind('string'), MatchQ.or(MatchQ.possibleValueCountRange(2,10), MatchQ.flavor('radios'))),
        component: fields.MetaFormInputEnumRadios
      },
      {
        matchQuality: MatchQ.and(MatchQ.kind('string'), MatchQ.possibleValueCountRange(1,2)),
        component: fields.MetaFormInputEnumCheckbox
      },
      {
        matchQuality: MatchQ.and(MatchQ.kind('array'), MatchQ.element(MatchQ.kind('string'))),
        component: fields.MetaFormInputEnumCheckboxArray
      }
    ];
  }

}
