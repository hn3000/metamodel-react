/* /// <reference path="../typings/index.d.ts" /> */

import * as React from 'react';

import {
  IModelType,
  IModelTypeComposite,
  IModelTypeItem,
  IModelView,
  ValidationScope,
  ModelView,
  IValidationMessage,
  IClientProps,
  ClientProps
} from '@hn3000/metamodel';

export {
  IModelType,
  IModelTypeComposite,
  IModelTypeItem,
  IModelView,
  ValidationScope,
  ModelView,
  IValidationMessage,
  IClientProps,
  ClientProps
} from '@hn3000/metamodel';

export {
  IFormProps,
  IFormState,
  IPageProps,
  IPageState,
  IInputProps,
  IInputState,
  IWrappers,
  IWrapperComponentProps,
  IInputComponentProps,
  IInputComponentState,
  IComponentMatcher,
  IFormConfig,
  IFormContext,
  InputComponent
} from './api';

import {
  IFormProps,
  IFormState,
  IPageProps,
  IPageState,
  IInputProps,
  IInputState,
  IWrappers,
  IInputComponentProps,
  IInputComponentState,
  IComponentMatcher,
  IFormConfig,
  IFormContext,
  InputComponent
} from './api';

import { propsDifferent } from './props-different';
export { propsDifferent } from './props-different';

import {
  ListenerManager,
  clickHandler
} from './listener-manager';

import {
  JsonPointer
} from '@hn3000/metamodel';

import { MetaFormConfig } from './form-config';
export { MetaFormConfig } from './form-config';

import { MetaFormContext } from './form-context';
export { MetaFormContext } from './form-context';

import { MetaForm } from './meta-form';
export { MetaForm } from './meta-form';

import { MetaPage } from './meta-page';
export { MetaPage } from './meta-page';

import { MetaInput } from './meta-input';
export { MetaInput } from './meta-input';

import { 
  MetaContextAware, 
  MetaContextFollower, 
  MetaContextAwarePure 
} from './base-components';

export { 
  MetaContextAware, 
  MetaContextFollower, 
  MetaContextAwarePure 
} from './base-components';
