
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  MetaForm,
  MetaPage,
  MetaInput,
  MetaFormRegistry,
  ModelTypeObject
} from '../src/metamodel-react';

var registry = new MetaFormRegistry();

/*
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
      blah:      { type: "number" },
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
registry.parseSchemaObject('./contact-form.json', "ContactForm");

var model = registry.type("ContactForm") as ModelTypeObject<any>;


class ContactFormApp extends React.Component<any,any> {

  render() {
    return (
      <MetaForm metamodel={model}>
        <div>
          <MetaPage>
            <Label>Full name</Label>
            <MetaInput field="firstname"  flavour="nolabel" />
            <MetaInput field="lastname"  flavour="nolabel" />
            <MetaFormNavigation>
              <button onClick={this.next}>next</button>
            </MetaFormNavigation>
          </MetaPage>
          <MetaPage>
            <MetaInput field="email" />
            <MetaInput field="blah" />
            <MetaFormNavigation>
              <button onClick={this.previous}>previous</button>
            </MetaFormNavigation>
          </MetaPage>
        </div>
      </MetaForm>
    );
  }
}

ReactDom.render(
  <ContactFormApp />, 
  document.getElementById('form-content')
);
