function getParams(val) {
  const result = {};

  if (val) {
    const arr = val.split(/\s*;\s*/);
    const keyReg = /^[^: \t\r\n\v\f]+/;
    const valReg = /:\s*(.+)$/;
    const numReg = /^[0-9]+$/;
    const boolReg = /^true$|^false$/;

    for (let i = 0; i < arr.length; i++) {
      const _key = arr[i].match(keyReg);
      const _val = arr[i].match(valReg);
      if (_key && _key.length && _val && _val.length) {
        if (_val[1].match(boolReg)) {
          result[_key[0]] = _val[1] === 'true';
        } else if (_val[1].match(numReg)) {
          result[_key[0]] = parseFloat(_val[1]);
        } else {
          result[_key[0]] = _val[1];
        }
      }
    }
  }

  return result;
}
export default getParams;
