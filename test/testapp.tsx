
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  MetaForm,
  MetaPage,
  MetaInput,
  IFormContext,
  MetaFormConfig
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

var promise = registry.addSchemaFromURL("./test/test-form.json");

promise.then(formWithModel);

function formWithModel(model:mm.ModelTypeObject<any>) {

  ReactDom.render(<TestApp currentPage={0} model={model}/>, document.getElementById('form-content'));

}


interface TestFormProps {
  model:mm.ModelTypeObject<any>; //</any>
  currentPage?: number;
}
interface TestFormState {
  currentPage: number;
}

function mutator<S,V>(name:string) {
  return (s:S, v:V) => {
    var keys = Object.keys(s);
    var result:any = {};
    for (var k of keys) {
      result[k] = (k == name) ? v : (s as any)[k];
    }
    return result;
  }
}

class TestApp extends React.Component<TestFormProps,TestFormState> {
  constructor(props:TestFormProps) {
    super(props);

    this.state = {
      currentPage: 1
    };

    this._changePage = mutator("currentPage");

    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }

  _changePage(s:TestFormState,v:number):TestFormState { return null; }

  next(event:UIEvent) {
    this.setState(this._changePage(this.state, this.state.currentPage+1));
    event.preventDefault();
  }
  previous(event:UIEvent) {
    this.setState(this._changePage(this.state, this.state.currentPage-1));
    event.preventDefault();
  }
  render() {
    let context = {
      metamodel: this.props.model,
      config: new MetaFormConfig()
    };

    return (
      <MetaForm context={context}>
        <div>
          <MetaPage page={0} currentPage={this.state.currentPage} context={context}>
            <MetaInput field="firstname" context={context} />
            <MetaInput field="lastname" context={context} flavor="nolabel" />
            <button onClick={this.next}>next</button>
          </MetaPage>
          <ContactFormPage2
            currentPage={this.state.currentPage}
            context={context}
            next={this.next}
            previous={this.previous}
          />
        </div>
      </MetaForm>
    );
  }
}
