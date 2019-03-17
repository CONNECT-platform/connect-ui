const parser = require('htmlparser2');

import { Namer } from '../util/namer';
import { Stack } from '../util/stack';
import validate from './validations';


export default function(raw: string) {
  let _code = '()=>{';
  let _stack = new Stack<string>();
  let _tag_stack = new Stack<string>();

  let _namer = new Namer()

  let _Parser = new parser.Parser({
    onopentag: (name: string, attributes: any) => {
      validate(name, validate.tag);
      _tag_stack.push(name);

      let _vname: string = undefined;

      let _host = 'this.root';
      if (!_stack.empty) _host = _stack.peek;

      let _command = `this.renderer.render('${name}')`;

      Object.entries(attributes).forEach(([attr, val]:[string, string]) => {
        if (attr.startsWith('$')) {
          validate(attr, validate.id);
          _vname = 'this.$.' + attr.slice(1);
        }
        else {
          validate(attr, validate.attribute);
          _command += `.attr('${attr}', \`${val}\`)`;
        }
      });

      if (!_vname) {
        _vname = _namer.next;
        _command = `let ${_vname}=`+_command;
      }
      else _command = `${_vname}=`+_command;

      _stack.push(_vname);

      _command += `.on(${_host});`;
      _code += _command;
    },

    ontext: (content: string) => {
      content = content.trim();
      if (content.length > 0) {
        let _host = 'this.root';
        if (!_stack.empty) _host = _stack.peek;

        _code += `this.renderer.render('').text(\`${content}\`).on(${_host});`;
      }
    },

    onclosetag: (name: string) => {
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

  _code += '}';
  return _code;
}
