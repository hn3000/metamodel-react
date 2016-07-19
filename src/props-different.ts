

export function propsDifferent(a:any, b:any) {
  return objectsDifferent(a,b);
}

function objectsDifferent(a:any, b:any) {
  if (a === b) return false;
  if ((null == a) != (null == b)) return true;

  let keysA = Object.keys(a);
  let keysB = Object.keys(b);

  if (arraysDifferent(keysA, keysB)) return true;

  for (let k of keysA) {
    if (a[k] != b[k]) {
      if (Array.isArray(a[k])) {
        if (arraysDifferent(a[k], b[k])) {
          return true;
        }
      /*} else if (typeof a[k] === 'object') {
        if (objectsDifferent(a[k], b[k])) {
          return true;
        }*/
      } else {
        return true;
      }
    }
  }

  return false;
}

function arraysDifferent(a:any[], b:any[]) {
  if (a === b) return false;
  if ((null == a) != (null == b)) return true;
  if (a.length !== b.length) return true;

  for (var i = 0, n = a.length; i < n; ++i) {
    if (a[i] != b[i]) return true; 
  }
  return false;
}

