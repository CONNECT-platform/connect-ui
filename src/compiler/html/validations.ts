//
// TODO: write tests for this.
//

export const tag = (tag: string): boolean => /^[@A-Za-z]+[\w\-\:\.]*$/.test(tag);
export const id = (id: string): boolean => /^\$[A-Za-z]+[\w_]*$/.test(id);
export const attribute = tag;

tag.__name = 'tag';
id.__name = 'id';
attribute.__name = 'attribute';

export default function validate(val: string, func: (val: string) => boolean) {
  if (!func(val))
    throw new Error(`VALIDATION ERROR:: ${val} is not a valid ${(func as any).__name || 'token.'}`);
}

validate.tag = tag;
validate.id = id;
validate.attribute = attribute;
