

import {
  IModelType,
  IValidationMessage
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
import { Promise } from 'es6-promise';

type matchQFun = (field:IModelType<any>)=>number;

function objMatcher(template:any):matchQFun { //</any>
  var keys = Object.keys(template);
  var n = keys.length;

  return ((field:IModelType<any> /*</any>*/) => { 
    var result = 0;
    var fieldObj = field as any;
    for (var i = 0; i < n; i++) {
      let k = keys[i];
      if (fieldObj[k] == template[k]) {
        ++result;
      }
    }
    return result;
  });
}

function kindMatcher(kind:string):matchQFun {
  return (field:IModelType<any>) => (field.kind === kind?1:0)
}

function andMatcher(...matcher:matchQFun[]):matchQFun {
  return (field:IModelType<any>) => matcher.reduce((q, m) => {
    let qq = m(field);
    return qq && q + qq;
  }, 0);
}

function hasPVC(from:number, to?:number) {
  return (field:IModelType<any>) => {
    let pv = field.asItemType() && field.asItemType().possibleValues();
    let pvc = pv ? pv.length : 0;
    if ((pvc >= from) && (!to || pvc < to)) {
      return 1;
    }
    return 0;
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
  public validateDebounceTime: number = 1000; //in ms
  public allowNextWhenInvalid: boolean = false;

  public onFormInit:(form:IFormContext)=>Promise<IModelUpdater> = null; // </any>
  public onPageTransition:(form:IFormContext, direction:number)=>Promise<IValidationMessage[]> = null; // </IValidationMessage>
  public onAfterPageTransition:(form:IFormContext)=>void = null;
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
        matchQuality: kindMatcher('string'),
        component: fields.MetaFormInputString
      },
      {
        matchQuality: kindMatcher('number'),
        component: fields.MetaFormInputNumber
      },
      {
        matchQuality: kindMatcher('bool'),
        component: fields.MetaFormInputBool
      },
      {
        matchQuality: objMatcher({kind:'bool'}),
        component: fields.MetaFormInputBool
      },
      {
        matchQuality: andMatcher(kindMatcher('string'), hasPVC(10)),
        component: fields.MetaFormInputEnumSelect
      },
      {
        matchQuality: andMatcher(kindMatcher('string'), hasPVC(2,10)),
        component: fields.MetaFormInputEnumRadios
      },
      {
        matchQuality: andMatcher(kindMatcher('string'), hasPVC(1,2)),
        component: fields.MetaFormInputEnumCheckbox
      }
    ];
  }

}
