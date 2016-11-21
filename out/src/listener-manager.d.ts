import * as React from 'react';
export declare class ListenerManager<T> {
    constructor();
    subscribe(listener: T): () => void;
    readonly all: T[];
    _ensureWritable(): void;
    private _current;
    private _next;
}
export declare function clickHandler(fun: (...args: any[]) => void, ...args: any[]): (event: React.SyntheticEvent) => void;
