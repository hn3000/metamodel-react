
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  MetaForm,
  MetaPage,
  MetaInput,
  IFormContext,
  MetaFormConfig,
  MetaFormContext,
  IValidationMessage
} from '../src/metamodel-react';
import * as mm from '@hn3000/metamodel';

import { ContactFormPage2 } from './testpage2';

var registry = new mm.ModelSchemaParser();

/*
registry.addSchemaObject(
  "TestForm",
  {
    type: "object",
    properties: {
      firstname: { type: "string", maxLength: 20 },
      lastname:  { type: "string", maxLength: 20 },
      username:  { type: "string", maxLength: 20, format: "username" },
      email:     { type: "string", maxLength: 20, format: "email" },
      email2:    { type: "string", maxLength: 20, format: "email" },
      country:   { type: "string", format: "countrycode" },
      birth:     { type: "string", format: "date-time", constraints:[ { kind: "minAge", value: "18years" }] }
    },
    constraints: [
      { kind: "equalFields", fields: [ "email2", "email" ] }
    ],
    pages: [
      { fields: ["firstname", "lastname"] },
      { fields: ["email", "email2", "blah"] }
    ]
  }
);
*/


interface TestFormProps {
  context: MetaFormContext;
}
class TestForm extends React.Component<TestFormProps,any> {
  constructor(props:TestFormProps) {
    super(props);

  }


  render() {
    let context = this.props.context;

    return (
      <MetaForm context={context}>
        <div>
          <MetaPage page={0} context={context}>
            <MetaInput field="firstname" context={context} />
            <MetaInput field="lastname" context={context} flavor="nolabel" />
            <MetaInput field="username" context={context} flavor="nolabel" />
            <MetaInput field="country" context={context} flavor="nolabel" />
            <button onClick={context.pageNext}>next</button>
          </MetaPage>
          <ContactFormPage2
            context={context}
          />
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


function fetchFormData() {
  return Promise.resolve().then(() => {
    let result:any = {};


    result.firstname = choose(Firstnames, 0.2);
    if (result.firstname) {
      result.lastname = choose(Lastnames, 0.0);
    }

    return result;
  });
}

function validateFormData(context:IFormContext) {
  let viewmodel = context.viewmodel;
  let page = viewmodel.getPage(null);  
  let data = viewmodel.getModel();
  var messages: IValidationMessage[] = [];

  if (data.username === 'hn3000') {
    messages = [ {path: 'username', msg:'username is already taken', isError: true } ];
  }

  return Promise.resolve(messages);
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

    let context = new MetaFormContext (config, model, {});

    ReactDom.render(<TestForm context={context} />, formElem);

  }
} 

run();