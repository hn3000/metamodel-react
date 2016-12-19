
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
  IPropertyStatusMessage
} from '../src/metamodel-react';
import * as mm from '@hn3000/metamodel';

import { ContactFormPage2 } from './testpage2';

var registry = new mm.ModelSchemaParser();

interface TestFormProps {
  context: MetaFormContext;
}
class TestForm extends MetaContextFollower<TestFormProps,any> {
  constructor(props:TestFormProps, context:any) {
    super(props, context);
  }

  _extractState(formContext: IFormContext) {
    var result = {
      currentPage: formContext.currentPage,
      back: formContext.pageBackAllowed(),
      next: formContext.pageNextAllowed()
    };
    return result;
  }

  render() {
    return (
      <MetaForm context={this.props.context}>
        <div className={'page'+this.props.context.currentPage}> 
          <button disabled={!this.props.context.pageBackAllowed()} onClick={this.props.context.pageBack}>back</button>
          <button disabled={!this.props.context.pageNextAllowed()} onClick={this.props.context.pageNext}>next</button>
        </div>
        <div>
          <MetaPage page={0}>
            <MetaInput field="firstname" />
            <MetaInput field="lastname" />
            <MetaInput field="username" />
            <MetaInput field="country" flavor="select"/>
            <MetaInput field="file" />
          </MetaPage>
          <ContactFormPage2 />
        </div>
        <div className={'page'+this.props.context.currentPage+'b:'+this.props.context.pageBackAllowed()+'-n:'+this.props.context.pageNextAllowed()}>
        <button disabled={!this.props.context.pageBackAllowed()} onClick={this.props.context.pageBack}>back</button>
        <button disabled={!this.props.context.pageNextAllowed()} onClick={this.props.context.pageNext}>next</button>
        </div>
      </MetaForm>
    );
  }
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

function validateFormData(context:IFormContext) {
  let viewmodel = context.viewmodel;
  let page = viewmodel.getPage(null);  
  let data = viewmodel.getModel();
  var messages: IPropertyStatusMessage[] = [];

  if (0 === data.username.indexOf('hn30')) {
    messages = [ { property: 'username', msg:'username is already taken', code:'username-taken', severity: MessageSeverity.ERROR } ];

    return delayValue(messages, 500*parseInt(data.username.substr(4)));
  }

  return delayValue(messages, 100);
}

export function run() {
  console.log("fetching test form");
  var promise = registry.addSchemaFromURL("./test/test-form.json");

  promise.then(formWithModel);

  function formWithModel(model:mm.ModelTypeObject<any>) {
    let formElem = document.getElementById('form-content');
    console.log("render test form into ", formElem);
    let config =  new MetaFormConfig();
    config.usePageIndex = true;
    config.validateOnUpdate = true;
    config.onFormInit = fetchFormData;
    config.onPageTransition = validateFormData;
    config.onAfterPageTransition = (ctx) => { console.log('after transition', ctx); }
    config.onFailedPageTransition = (ctx) => { console.log('failed transition', ctx); }
    config.validateDebounceMS = 100;
    config.busyDelayMS = 200;

    let context = new MetaFormContext (config, model, {});

    (window as any).formContext = context;

    ReactDom.render(<TestForm context={context} />, formElem);
  }
} 

run();