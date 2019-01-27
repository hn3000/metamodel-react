
import * as React from 'react';

function emptyRenderer(): null {
  return null;
}

function bareRenderer(props: {children: React.ReactChildren}): React.ReactElement<any> {
  return <>{props.children}</>;
}

export var renderUtilities = {
  EMPTY: emptyRenderer,
  BARE: bareRenderer
};
