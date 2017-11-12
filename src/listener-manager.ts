
import * as React from 'react';

export class ListenerManager<T> {
  constructor() {
    this._next = [];
    this._current = this._next;
  }

  subscribe(listener:T):()=>void {
    this._ensureWritable();
    this._next.push(listener);

    var subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      let pos = this._next.indexOf(listener);
      if (-1 != pos) {
        this._ensureWritable();
        this._next.splice(pos, 1);
      }
    };
  }

  get all():T[] {
    this._current = this._next;
    return this._current;
  }

  _ensureWritable() {
    if (this._current === this._next) {
      this._next = this._current.slice();
    }
  }
  private _current:T[];
  private _next:T[];
}


export function clickHandler(fun:(...args:any[])=>void, ...args:any[]):(event:React.SyntheticEvent<HTMLElement>)=>void {
    return (event:React.SyntheticEvent<HTMLElement>) => {
        event.preventDefault();
        fun.apply(args[0], args.slice(1));
    }
}

