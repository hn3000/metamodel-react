

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
  IModelUpdater,
  ISectionProps,
  ISectionWrapperProps,
  ISectionLookup,
  ISectionWrapper
} from './api';

import * as fields from './default-field-types';

import * as React from 'react';

export type matchQFun = (type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]) => number;

export class MatchQ {
  /** 
   * Matches by fieldName, match quality is 100 times that of other criteria by default.
   * The quality argument can be used to change the strenght of the match. 
   */
  static fieldName(name:string, quality: number = 100):matchQFun {
    return (type:IModelType<any>, fieldName: string) => (fieldName === name ? quality:0)
  }
  /** 
   * Matches by similarity to the given object literal, all props must match. 
   * Every matching item (i.e. key in the template) counts as 1 by default, the
   * quality argument changes the quality per match. 
   */
  static likeObject(template:any, quality: number = 1): matchQFun { //</any>
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
          result += quality;
        } else {
          return 0;
        }
      }
      return result;
    });
  }
  /** 
   * Matches by IModelType.kind, the match counts as 1 point by default. 
   * The quality argument can be used to change the strenght of the match. 
   */
  static kind(kind:string, quality: number = 1):matchQFun {
    return (field:IModelType<any>) => (field.kind === kind? quality : 0)
  }
  /** 
   * Matches by flavor. Flavor can be given as a prop on the MetaInput or in the schema 
   * (where brit. spelling flavour is also accepted).
   * By default, a match is worth one point, the quality argument can be used to
   * change the value of a match. 
   */
  static flavor(flavor:string, quality: number = 1):matchQFun {
    let flv = flavor;
    return (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]) => {
      if (
        (flavor === flv)
        || ((x) => x && ((x.flavor === flv) || (x.flavour === flv)))(type.propGet('schema'))
      ) {
        return quality;
      }
      return 0;
    };
  }
  /** 
   * Matches by format, shorthand for .likeObject({fornat:'<format>'}).
   * By default, flavor matches are worth one point; the quality argument
   * can be used to change this. 
   */
  static format(format:string, quality: number = 1):matchQFun {
    return (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]) => {
      if (
        ((x) => x && (x.format === format))(type.propGet('schema'))
      ) {
        return quality;
      }
      return 0;
    };
  }  
  /** 
   * Matches an array type that has elements matching the given matcher.
   * By default, a match is worth 2 times that of the base matcher (to
   * reflect the fact it's an array), the quality argument can be used to 
   * change the factor.
   */
  static element(matcher: matchQFun, quality: number = 2):matchQFun {
    return (type: IModelType<any>, fieldName:string, flavor:string, ...matchArgs: any[]) => {
      let af = type as ModelTypeArray<any>;
      if (af.itemType && af.itemType()) {
        return matcher(af.itemType(), fieldName, flavor, ...matchArgs) * quality;
      }
      return 0;
    };
  }
  /** 
   * Matches if the number of possible values for the element is between from (inclusive)
   * and to (exclusive). Only matches for types that actually have an enumerated list
   * of possible values, so will not match unconstrained numbers or strings. If no upper
   * limit (`to`) is given or it is spcecified as 0, only the minimum is checked.
   * 
   * By default, a match is worth one point, the quality argument can be used to
   * change the value of a match. 
   */
  static possibleValueCountRange(from:number, to?:number, quality: number = 1) {
    return (field:IModelType<any>) => {
      let possibleValues = field.asItemType() && field.asItemType().possibleValues();
      let pvc = possibleValues ? possibleValues.length : 0;
      if ((pvc >= from) && (!to || pvc < to)) {
        return quality;
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
  /**
   * Multiply quality of a matcher by a factor. Can be used to manipulate priority of matchers 
   * in case the default qualities don't work well.
   * 
   * @param matcher the base matcher
   * @param factor that a match is multiplied by
   */
  static prioritize(factor: number, matcher: matchQFun):matchQFun {
    return (type: IModelType<any>, fieldName: string, flavor: string, ...matchArgs: any[]) => {
      return matcher(type, fieldName, flavor, ...matchArgs) * factor;
    }
  }
}

export class MetaFormConfig implements IFormConfig {

  constructor(wrappers?:IWrappers, components?:IComponentMatcher[], sections?: ISectionLookup) {
    this._wrappers = wrappers || MetaFormConfig.defaultWrappers();
    this._components = components || MetaFormConfig.defaultComponents();
    this._sections = sections || {};
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

  private _deprecatedFindBestUsed = false;
  findBest(type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]): InputComponent {
    let matcher = this._findBestMatcher(type, fieldName, flavor, matchargs);
    if (matcher && matcher.condition) {
      console.warn("ignoring condition on matcher", matcher)
    }
    return matcher && matcher.component;
  }

  findBestMatcher(type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]): IComponentMatcher {
    return this._findBestMatcher(type, fieldName, flavor, matchargs);
  }

  _findBestMatcher(type: IModelType<any>, fieldName:string, flavor:string, ...matchargs: any[]): IComponentMatcher {
    var bestQ = 0;
    var match:IComponentMatcher = null;

    let matchers = this._components;
    for (var i = 0, n = matchers.length; i<n; ++i) {
      let thisQ = matchers[i].matchQuality(type, fieldName, flavor, ...matchargs);
      if (thisQ > bestQ) {
        match = matchers[i];
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

  addSection(name: string, component: ISectionWrapper): void {
    this._sections[name] = component;
  }
  removeSection(name: string): void {
    delete this._sections[name];
  }
  setSectionDefault(component: ISectionWrapper): void {
    this._sectionDefault = null;
  }
  findSection(name:string): ISectionWrapper {
    let result = this._sections[name];
    if (null == result) {
      result = this._sectionDefault;
    }
    return result;
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

  private _sections: {
    [name: string]: ISectionWrapper
  };
  private _sectionDefault: ISectionWrapper;
  private _components: IComponentMatcher[];

  public static defaultWrappers():IWrappers {
    return {
      form: fields.FormWrapperDefault,
      page: fields.PageWrapperDefault,
      field: fields.FieldWrapperDefault,
      section: fields.SectionWrapperDefault
    }
  }

  public static defaultComponents() {
    return [
      {
        matchQuality: MatchQ.kind('string'),
        component: fields.MetaFormInputString
      },
      {
        matchQuality: MatchQ.likeObject({
          kind: 'string',
          format: 'date'
        }),
        component: fields.MetaFormInputDate
      },
      {
        matchQuality: MatchQ.likeObject({
          kind: 'string',
          format: 'month'
        }),
        component: fields.MetaFormInputDateMonth
      },
      {
        matchQuality: MatchQ.likeObject({
          kind: 'string',
          format: 'datetime'
        }),
        component: fields.MetaFormInputDateTime
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
        component: fields.MetaFormInputBoolRadio
      },
      {
        matchQuality: MatchQ.likeObject({kind:'boolean', required: true}),
        component: fields.MetaFormInputBoolRadio
      },
      {
        matchQuality: MatchQ.likeObject({kind:'boolean', required: false}),
        component: fields.MetaFormInputBoolCheckbox
      },
      {
        matchQuality: MatchQ.and(
          MatchQ.likeObject({kind:'boolean', required: true}),
          MatchQ.possibleValueCountRange(1,2)
        ),
        component: fields.MetaFormInputBoolCheckbox
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
