import { IModelType, IPropertyStatusMessage } from '@hn3000/metamodel';
import { IWrappers, IComponentMatcher, IFormConfig, IFormContext, InputComponent, IModelUpdater } from './api';
import * as fields from './default-field-types';
export declare type matchQFun = (type: IModelType<any>, fieldName: string, flavor: string, ...matchargs: any[]) => number;
export declare class MatchQ {
    static likeObject(template: any): matchQFun;
    static kind(kind: string): matchQFun;
    static flavor(flavor: string): matchQFun;
    static element(matcher: matchQFun): matchQFun;
    static and(...matcher: matchQFun[]): matchQFun;
    static or(...matcher: matchQFun[]): matchQFun;
    static possibleValueCountRange(from: number, to?: number): (field: IModelType<any>) => 0 | 1;
}
export declare class MetaFormConfig implements IFormConfig {
    constructor(wrappers?: IWrappers, components?: IComponentMatcher[]);
    setWrappers(wrappers: IWrappers): void;
    readonly wrappers: IWrappers;
    readonly matchers: IComponentMatcher[];
    findBest(type: IModelType<any>, fieldName: string, flavor: string, ...matchargs: any[]): InputComponent;
    add(cm: IComponentMatcher): void;
    remove(cm: IComponentMatcher): void;
    usePageIndex: boolean;
    validateOnUpdate: boolean;
    validateOnUpdateIfInvalid: boolean;
    validateDebounceMS: number;
    busyDelayMS: number;
    allowNavigationWithInvalidPages: boolean;
    onFormInit: (form: IFormContext) => Promise<IModelUpdater>;
    onPageTransition: (form: IFormContext, direction: number) => Promise<IPropertyStatusMessage[] | IModelUpdater>;
    onAfterPageTransition: (form: IFormContext) => void;
    onFailedPageTransition: (ctx: IFormContext) => void;
    onModelUpdate: (ctx: IFormContext) => Promise<IModelUpdater>;
    private _wrappers;
    private _components;
    static defaultWrappers(): IWrappers;
    static defaultComponents(): ({
        matchQuality: matchQFun;
        component: typeof fields.MetaFormInputString;
    } | {
        matchQuality: matchQFun;
        component: typeof fields.MetaFormInputNumberSliderCombo;
    } | {
        matchQuality: matchQFun;
        component: typeof fields.MetaFormInputFile;
    })[];
}
