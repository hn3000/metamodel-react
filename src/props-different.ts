
import { JsonPointer } from '@hn3000/json-ref';

export function propsDifferent(a:any, b:any) {
  if (Array.isArray(a)) {
    if (arraysDifferent(a, b)) {
      return true;
    }
  }
  return objectsDifferent(a,b);
}

export function objectsDifferent(a:any, b:any) {
  if (a === b) return false;
  if ((null == a) != (null == b)) return true;

  let keysA = Object.keys(a);
  let keysB = Object.keys(b);

  if (arraysDifferent(keysA, keysB)) return true;

  for (let k of keysA) {
    if (a[k] !== b[k]) {
      let thisA = a[k];
      let thisB = b[k];
      if (k === 'children' && Array.isArray(thisA)) {
        if (arraysDifferentShallow(thisA, thisB)) {
          return true;
        }
      } else if (Array.isArray(thisA)) {
        if (arraysDifferent(thisA, thisB)) {
          return true;
        }
      } else if (null != thisA && typeof thisA === 'object') {
        if (objectsDifferent(thisA, thisB)) {
          return true;
        }
      } else {
        return true;
      }
    }
  }

  return false;
}

export function arraysDifferent<T>(a:T[], b:T[]) {
  if (a === b) return false;
  if ((null == a) != (null == b)) return true;
  if (a.length !== b.length) return true;

  for (var i = 0, n = a.length; i < n; ++i) {
    if (objectsDifferent(a[i], b[i])) {
      return true;
    }
  }
  return false;
}

export function arraysDifferentShallow<T>(a:T[], b:T[]) {
  if (a === b) return false;
  if ((null == a) != (null == b)) return true;
  if (a.length !== b.length) return true;

  for (var i = 0, n = a.length; i < n; ++i) {
    if (a[i] != b[i]) {
      return true;
    }
  }
  return false;
}

export interface IPropsDiff { [k:string]: { a: any, b: any }; }

export function differentProps<T>(a: T, b: T): IPropsDiff {
  let result = {} as IPropsDiff;
  let visited: {[k:string]: boolean; } = {};
  JsonPointer.walkObject(a, (val, ptr) => {
    const k = ptr.asString();
    if (val !== ptr.getValue(b)) {
      result[k] = { a: val, b: ptr.getValue(b) };
      return false;
    }
    visited[k] = true;

    return true;
  });

  JsonPointer.walkObject(a, (val, ptr) => {
    const k = ptr.asString();
    if (visited[k]) {
      return true;
    }
    if (val !== ptr.getValue(b)) {
      result[k] = { a: val, b: ptr.getValue(b) };
      return false;
    }
    visited[k] = true;

    return true;
  });

  return result;
}
