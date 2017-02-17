/// <reference types="es6-promise" />
import { IModelType, IPropertyStatusMessage } from '@hn3000/metamodel';
import { IWrappers, IComponentMatcher, IFormConfig, IFormContext, InputComponent, IModelUpdater } from './api';
import * as fields from './default-field-types';
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
        matchQuality: (type: IModelType<any>, fieldName: string, flavor: string, ...matchargs: any[]) => number;
        component: typeof fields.MetaFormInputString;
    } | {
        matchQuality: (type: IModelType<any>, fieldName: string, flavor: string, ...matchargs: any[]) => number;
        component: typeof fields.MetaFormInputNumberSliderCombo;
    } | {
        matchQuality: (type: IModelType<any>, fieldName: string, flavor: string, ...matchargs: any[]) => number;
        component: typeof fields.MetaFormInputFile;
    })[];
}
