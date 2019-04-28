const parser = require('htmlparser2');

const { Namer } = require('../../util/namer');
const { Stack } = require('../../util/stack');
const validate = require('./validations');


module.exports = function(raw) {
  let _code = '(function(){';
  let _stack = new Stack();
  let _tag_stack = new Stack();

  let _namer = new Namer();

  let _Parser = new parser.Parser({
    onopentag: (name, attributes) => {
      validate(name, validate.tag);
      _tag_stack.push(name);

      let _vname = undefined;

      let _host = 'this.root';
      if (!_stack.empty) _host = _stack.peek;

      let _command = `this.renderer.render('${name}')`;

      Object.entries(attributes).forEach(([attr, val]) => {
        if (attr.startsWith('$')) {
          validate(attr, validate.id);
          _vname = 'this.$.' + attr.slice(1);
        }
        else {
          validate(attr, validate.attribute);
          _command += `.attr('${attr}', '${
            val.replace(/'/g, "\\'").replace(/[\n\r]/g, `' + '\\n' + '`)
          }')`;
        }
      });

      if (!_vname) {
        _vname = _namer.next;
        _command = `var ${_vname}=`+_command;
      }
      else _command = `${_vname}=`+_command;

      _stack.push(_vname);

      _command += `.on(${_host});`;
      _code += _command;
    },

    ontext: (content) => {
      content = content.trim();
      if (content.length > 0) {
        let _host = 'this.root';
        if (!_stack.empty) _host = _stack.peek;

        _code += `this.renderer.render('').text('${
          content.replace(/'/g, "\\'").replace(/[\n\r]/g, `' + '\\n' + '`)
        }').on(${_host});`;
      }
    },

    onclosetag: (name) => {
      let _expected = _tag_stack.pop();
      if (_expected !== name)
        throw new Error(`TEMPLATE ERROR:: unexpected closing tag </${name}>, did you mean </${_expected}>?`);
      _stack.pop();
    }
  }, {
    recognizeSelfClosing: true,
  });

  _Parser.write(raw);

  if (!_tag_stack.empty)
    throw new Error(`TEMPLATE ERROR:: unclosed tag <${_tag_stack.peek}>.`);

  _code += '})';
  return _code;
}
