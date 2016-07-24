import { IModelType, IValidationMessage } from '@hn3000/metamodel';
import { IWrappers, IComponentMatcher, IFormConfig, IFormContext, InputComponent } from './api';
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
    validateDebounceTime: number;
    allowNextWhenInvalid: boolean;
    onFormInit: (form: IFormContext) => Promise<any>;
    onPageTransition: (form: IFormContext, direction: number) => Promise<IValidationMessage[]>;
    private _wrappers;
    private _components;
    static defaultWrappers(): IWrappers;
    static defaultComponents(): {
        matchQuality: (field: IModelType<any>) => number;
        component: typeof fields.MetaFormInputString;
    }[];
}
