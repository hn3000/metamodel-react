
import * as React from 'react';
import { Requireable } from 'prop-types';

import { ISectionProps } from './api';
import { MetaContextAware } from './base-components';
import { MetaForm } from './meta-form';

import { IPropertyStatusMessage, MessageSeverity, IModelViewPage, IStatusMessage } from '@hn3000/metamodel';

export class MetaSection extends MetaContextAware<ISectionProps, any> {

  static contextTypes = MetaForm.childContextTypes;

  constructor(props:ISectionProps, context:any) {
    super(props, context);
  }

  private _skipped = 0;

  render() {
    let context = this.formContext;

    let { section, sectionAlias, contents, contentsDefault, wrapper: Wrapper } = this.props;

    let config = context.config;
    
    if (null == sectionAlias) {
      if (null != section) {
        sectionAlias = section.alias;
      } else {
        console.warn('MetaSection needs either sectionName or section');
      }
    } else if (null == section) {
      section = context.viewmodel.getPage(sectionAlias);
    } else {
      if (sectionAlias !== section.alias) {
        console.warn(`MetaSection got both section and sectionAlias but they don't match: ${section.alias} != ${sectionAlias}`);
      }
    }

    if (null == contents) {
      contents = config.findSection(sectionAlias);
      if (null == contents) {
        contents = contentsDefault;
      }
    } 

    if (null == Wrapper) {
      Wrapper = config.findSectionWrapper(sectionAlias);
    }

    //console.log(`rendering page ${this.props.page}`);
    let messages = context.viewmodel.getStatusMessages();
    let modelPage = context.viewmodel.getPage(sectionAlias);
    if (null != modelPage) {
        messages = messages.filter(isSectionMessageFilter(modelPage));
        if (null != modelPage.skipPredicate && modelPage.skipPredicate(context.viewmodel.getModel())) {
          return null;
        }
    }
    let errors = messages.filter(x => x.severity == MessageSeverity.ERROR && 'property' in x) as IPropertyStatusMessage[];
    let hasErrors = errors.length > 0;

    const metamodel = context.metamodel;
    const schema = metamodel.propGet('schema');
    const modelId = (schema && schema.modelId) || metamodel.name;

  let wrapperProps = {
      id: modelId,
      section,
      sectionAlias,
      busy: context.isBusy(),
      context,
      hasErrors,
      messages,
      errors
    }

    if (null == contents) {
      return <Wrapper {...wrapperProps}>{this.props.children}</Wrapper>;
    } else {
      if (0 != React.Children.count(this.props.children)) {
          console.log(`warning: MetaSection ignores children if contents (${contents}) are found (either contents, contentsDefault or a section in MetaFormConfig)`);
      }
      let Contents = contents;
      return <Wrapper {...wrapperProps}><Contents {...wrapperProps}/></Wrapper>;
    }
  }
}

function isSectionMessageFilter(page: IModelViewPage) {
    if (page != null && page.fields && page.fields.length) {
        const fields = page.fields;
        return (x: IStatusMessage) => {
            if ('property' in x) {
                let prop = (x as IPropertyStatusMessage).property;
                return -1 != fields.indexOf(prop);
            }
            return false;
        } 
    }
    return () => false;
}
