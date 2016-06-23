
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  MetaForm,
  MetaPage,
  MetaInput
} from '../src/metamodel-react';
import * as mm from '@hn3000/metamodel';

import { ContactFormPage2 } from './testpage2';

var registry = new mm.ModelSchemaParser();

registry.addSchemaObject(
  "ContactForm",
  {
    type: "object",
    properties: {
      firstname: { type: "string", maxLength: 20 },
      lastname:  { type: "string", maxLength: 20 },
      username:  { type: "string", maxLength: 20, format: "username" },
      email:     { type: "string", maxLength: 20, format: "email" },
      email2:    { type: "string", maxLength: 20, format: "email" },
      country:   { type: "string", format: "countrycode" },
      age: { type: "date", constraints:[ { kind: "minAge", value: "18years" }] }
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

var model = registry.type("ContactForm") as mm.ModelTypeObject<any>; 

//model = model.withConstraints([new ConstraintFieldsEqual("email", "email2")]);

interface TestFormProps {
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
    return (
      <MetaForm metamodel={model}>
        <div>
          <MetaPage page={0} currentPage={this.state.currentPage}>
            <MetaInput field="firstname" metamodel={model} />
            <MetaInput field="lastname" metamodel={model} />
            <button onClick={this.next}>next</button>
          </MetaPage>
          <ContactFormPage2
            currentPage={this.state.currentPage}
            metamodel={model}
            next={this.next}
            previous={this.previous}
          />
        </div>
      </MetaForm>
    );
  }
}

ReactDom.render(<TestApp currentPage={0}/>, document.getElementById('form-content'));
