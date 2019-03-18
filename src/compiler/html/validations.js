//
// TODO: write tests for this.
//

const tag = (tag) => /^[@A-Za-z]+[\w\-\:\.]*$/.test(tag);
const id = (id) => /^\$[A-Za-z]+[\w_]*$/.test(id);
const attribute = tag;

tag.__name = 'tag';
id.__name = 'id';
attribute.__name = 'attribute';

function validate(val, func) {
  if (!func(val))
    throw new Error(`VALIDATION ERROR:: ${val} is not a valid ${func.__name || 'token.'}`);
}

validate.tag = tag;
validate.id = id;
validate.attribute = attribute;

module.exports = validate;
module.exports.tag = tag;
module.exports.id = id;
module.exports.attribute = attribute;
