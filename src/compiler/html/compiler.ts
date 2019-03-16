const parser = require('htmlparser2');

import { Namer } from '../util/namer';
import { Stack } from '../util/stack';


export default function(raw: string) {
  let _code = '()=>{';
  let _stack = new Stack<string>();

  let _namer = new Namer()

  let _Parser = new parser.Parser({
    onopentag: (name: string, attributes: any) => {
      let _vname: string = undefined;

      let _host = 'this.root';
      if (!_stack.empty) _host = _stack.peek;

      //
      // TODO: validate the tagname
      //
      let _command = `this.renderer.render('${name}')`;

      Object.entries(attributes).forEach(([attr, val]:[string, string]) => {
        if (attr.startsWith('$')) {
          _vname = 'this.$.' + attr.slice(1);

          //
          // TODO: validate the id
          //
        }
        else {
          //
          // TODO: validate the attribute
          //
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
      //
      //TODO: do safety check.
      //
      _stack.pop();
    }
  }, {
    recognizeSelfClosing: true,
  });

  _Parser.write(raw);
  _Parser.end();

  _code += '}';
  return _code;
}
