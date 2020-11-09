
import * as React from 'react';

function EmptyRenderer(): JSX.Element {
  return null;
}

function BareRenderer(props: {children: React.ReactChildren}): JSX.Element {
  return <>{props.children}</>;
}

export var renderUtilities = {
  EMPTY: EmptyRenderer,
  BARE: BareRenderer
};
