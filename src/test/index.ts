const Mocha = require('mocha');
import * as path from 'path';

const mocha = new Mocha();
const root = path.join(__dirname, '../');

const test = (file: string) => mocha.addFile(path.join(root, file));

test('core/base/test/index.ts');
test('core/decorators/test/index.ts');
test('core/test/index.ts');

test('renderer/test/index.ts');
test('renderer/html/test/index.ts');

test('compiler/html/test/index.ts');
test('compiler/css/test/index.ts');

test('util/test/index.ts');

mocha.run(console.log);
