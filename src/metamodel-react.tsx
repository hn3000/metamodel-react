/* /// <reference path="../typings/index.d.ts" /> */

export {
  IModelType,
  IModelTypeComposite,
  IModelTypeItem,
  IModelView,
  ValidationScope,
  ModelView,
  MessageSeverity,
  IStatusMessage,
  IPropertyStatusMessage,
  IClientProps,
  ClientProps
} from '@hn3000/metamodel';

export {
  IFormProps,
  IPageProps,
  ISectionProps,
  IInputProps,
  IMetaFormBaseProps,
  IWrappers,
  IFormWrapperProps,
  IPageWrapperProps,
  ISectionWrapperProps,
  IFieldWrapperProps,
  IWrapperComponentProps,
  IInputComponentProps,
  IInputComponentState,
  IComponentMatcher,
  IFormConfig,
  IFormContext,
  InputComponent,
  IModelUpdater,
  IConclusionMessage
} from './api-input';

export * from './api-display';

export { propsDifferent } from './props-different';
export { parseSearchParams } from './search-params';

export { MetaFormConfig, MatchQ, matchQFun } from './form-config';
export { MetaFormContext } from './form-context';

export { MetaForm } from './meta-form';
export { MetaPage } from './meta-page';
export { MetaSection } from './meta-section';
export { MetaInput } from './meta-input';

export {
  MetaContextAware,
  MetaContextFollower,
  MetaContextAwarePure
} from './base-components';

export {
  chainUpdaters
} from './chain-updaters';
