
export interface IRequestParams {
  [p:string]: string[];
}
var rqpre =  /[?&]([^=&]*)(?:=([^&]*))?/g;
export function parseSearchParams(search:string) {
  var result:any = {};

  if (search && search != '') {
    var match:RegExpExecArray;
    while (match = rqpre.exec(search)) {
      var name = match[1];
      var value = decodeURIComponent(match[2]);
      if (!result[name]) {
        result[name] = [ value ];
      } else {
        var v = result[name];
        v.push(value);
      }
    }
  }
  return result;
}
