export declare class ListenerManager<T> {
    constructor();
    subscribe(listener: T): () => void;
    currentList(): T[];
    forEach(fun: (x: T) => void): void;
    map<X>(fun: (x: T) => X): X[];
    _ensureWritable(): void;
    private _current;
    private _next;
}
export declare function clickHandler(fun: (...args: any[]) => void, ...args: any[]): (event: UIEvent) => void;
