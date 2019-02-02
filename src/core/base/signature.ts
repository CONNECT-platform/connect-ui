export interface Signature {
  inputs?: string[];
  outputs?: string[];
  signals?: string[];
}

function _extend(inplace: boolean, original: Signature, ...extensions: Signature[]): Signature {
  let extended: Signature;
  if (inplace) extended = original;
  else extended = {
    inputs: original.inputs,
    outputs: original.outputs,
    signals: original.signals,
  }

  for (let extension of extensions) {
    extended.inputs = (extended.inputs || []).concat(extension.inputs || []);
    extended.outputs = (extended.outputs || []).concat(extension.outputs || []);
    extended.signals = (extended.signals || []).concat(extension.signals || []);
  }

  return extended;
}

export function extend(original: Signature, ...extensions: Signature[]): Signature {
  return _extend(true, original, ...extensions);
}

export function extension(original: Signature, ...extensions: Signature[]): Signature {
  return _extend(false, original, ...extensions);
}
