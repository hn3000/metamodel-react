
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  MetaForm,
  MetaPage,
  MetaInput,
  IFormContext,
  MetaFormConfig,
  MetaFormContext,
  MessageSeverity,
  MetaContextFollower,
  IPropertyStatusMessage,
  MatchQ,
  MetaSection,
  IInputComponentProps
} from '../src/metamodel-react';

import * as mm from '@hn3000/metamodel';
import { MetaFormInputEnumSelect } from '../src/default-field-types';

var registry = new mm.ModelSchemaParser();

interface TestFormProps {
  context: MetaFormContext;
}

export function pageBackAllowed(formContext: IFormContext) {
  return formContext.hasPreviousPage() && !formContext.isBusy() && !formContext.isFinished();
}
export function pageNextAllowed(formContext: IFormContext) {
  return formContext.hasNextPage() && !formContext.isBusy() && formContext.isValid();
}

class TestForm extends MetaContextFollower<TestFormProps,any> {
  constructor(props:TestFormProps, context:any) {
    super(props, context);
    this.state = {};
  }

  _extractState(formContext: IFormContext) {
    const { 
      currentUnskippedPageNo, 
      totalUnskippedPageCount 
    } = formContext.viewmodel;
    
    const result = {
      currentPage: formContext.currentPage,
      currentUnskippedPageNo,
      totalUnskippedPageCount,
      back: pageBackAllowed(formContext),
      next: pageNextAllowed(formContext)
    };
    return result;
  }

  render() {
    let { context } = this.props;
    let vm = context.viewmodel;
    let pages = context.viewmodel.getPages();
    return (
      <MetaForm context={this.props.context}>
        <div className={'mmr-page page'+this.props.context.currentPage}> 
          <button disabled={!this.state.back} onClick={this.props.context.pageBack}>back</button>
          <button disabled={!this.state.next} onClick={this.props.context.pageNext}>next</button>
        </div>
        <div>
          { pages.map(p => <FormPage key={p.alias} alias={p.alias} page={p} />)}
          <FormPage alias="conclusion" />
        </div>
        <div className={'mmr-page page'+this.props.context.currentPage+'b:'+!this.state.back+'-n:'+!this.state.back}>
        <button disabled={!this.state.back} onClick={this.props.context.pageBack}>back</button>
        <button disabled={!this.state.next} onClick={this.props.context.pageNext}>next</button>
        </div>
        <div className="mmr-page">{`Current page is ${context.currentPageAlias}, #${vm.currentUnskippedPageNo} / ${vm.totalUnskippedPageCount} (${vm.currentPageNo} / ${vm.totalPageCount})`}</div>
        { vm.getFocusedPage() != null && (<div>{`Focused page: ${vm.getFocusedPageNo()} / ${vm.getFocusedPage().alias}`}</div>)}
      </MetaForm>
    );
  }
}

function FormPage(props: { alias: string; page?: mm.IModelViewPage }) {
  let { alias, page } = props;
  //console.log(`FormPage(${alias})`);
  switch (alias) {
    case 'conclusion':
      return (
        <MetaPage alias={alias}>
          <h2>Done, Thanks!</h2>
        </MetaPage>
      );
    default:

      const hasSections = page.pages && page.pages.length > 0;
      return (
        <MetaPage alias={alias} />
      );
  }
  return null;
}

let Firstnames = [
  "Eberhard",
  "Thomas",
  "Philipp J.",
  "Donald",
  "Frederick",
  "James",
  "Earl",
  "Ann",
  "Fiona",
  "Joanna"
];

let Lastnames = [
  "Nielsen",
  "Johann",
  "Fry",
  "Duck",
  "O'Donald",
  "O'Doud",
  "Jones",
  "Douglass",
  "Myers",
  "Smith"
];

function maybe(threshold: number=0.5) {
  return Math.random()<threshold;
}

function choose(values:string[], pEmpty:number) {
  var empty = maybe(pEmpty);
  if (!empty) {
    var index = Math.floor(Math.random()*values.length);
    return values[index];
  }
  return null;
}

function delayValue<T>(t:T, d:number):Promise<T> {

  let callback = (resolve:(v:T)=>void, reject:(e:any)=>void) => {
    let finish = () => { resolve(t); };
    setTimeout(finish, d);
  };

  return new Promise<T>(callback);
} 

function fetchFormData() {
  return Promise.resolve().then(() => {
    let result:any = {};


    result.firstname = choose(Firstnames, 0.2);
    if (result.firstname) {
      result.lastname = choose(Lastnames, 0.0);
    }

    return delayValue(result, 2000);
  });
}

/**
 * Perform some fake "validation" to show how a server-side validation
 * could be hooked into the form. This function can be fully async, simulated
 * with the `delayValue` function here (see above).
 * @param context 
 * @param direction of transition, use to skip validation on back
 */
async function pageTransitionHandler(context:IFormContext, direction: number) {
  if (direction < 0) {
    return []; // no validation messages: no validation on stepping backwards
  }

  let viewmodel = context.viewmodel;
  let data = viewmodel.getModel();
  var messages: IPropertyStatusMessage[] = [];

  if (null != data.username) {
    if (0 === data.username.indexOf('hn30')) {
      messages = [ { property: 'username', msg:'username is already taken', code:'username-taken', severity: MessageSeverity.ERROR } ];
    }
    if (0 === data.username.indexOf('hn30') || 0 === data.username.indexOf('slow')) {
      return delayValue(messages, 500*parseInt(data.username.substr(4)));
    }
  }
  const delayMS = 100*(10*Math.random());
  console.debug(`delaying messages for ${delayMS}`);
  return delayValue(messages, delayMS);
}

export function run() {
  console.log("fetching test form");
  var promise = registry.addSchemaFromURL("./test/test-form.json");

  let pfwm = promise.then(formWithModel);
  pfwm.then(null, (err) => console.log('error in formWithModel:', err));

  function formWithModel(model:mm.ModelTypeObject<any>) {
    let formElem = document.getElementById('form-content');
    console.log("render test form into ", formElem);
    let config =  new MetaFormConfig();
    config.usePageIndex = true;
    config.validateOnUpdate = true;
    config.onFormInit = fetchFormData;
    config.onPageTransition = pageTransitionHandler;
    config.onAfterPageTransition = (ctx) => { console.log('after transition', ctx); }
    config.onFailedPageTransition = (ctx) => { console.log('failed transition', ctx); }
    config.validateDebounceMS = 100;
    config.busyDelayMS = 200;

    if (true) {
      config.add({
        matchQuality: MatchQ.fieldName('gender'),
        component: MetaFormInputEnumSelect
      });
    }
    

    let context = new MetaFormContext (config, model, {});

    (window as any).formContext = context;

    ReactDom.render(<TestForm context={context} />, formElem);
  }
}

run();
