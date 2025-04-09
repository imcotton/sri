import * as ast from 'jsr:@std/assert@1';

import { parse } from '../src/parse.ts';
import v from '../src/valibot.ts';





Deno.test('with url on start', function () {

    const url = 'https://wat';

    const { task } = parse([
        url,
        '-m', '42',
    ]);

    ast.assertInstanceOf(task, Function);

});





Deno.test('with url on end', function () {

    const url = 'https://wat';

    const { task } = parse([
        '-p',
        url,
    ]);

    ast.assertInstanceOf(task, Function);

});





Deno.test('read local file', async function () {

    const path = 'README.md';

    const { task } = parse([
        path,
    ]);

    const [ node, deno ] = await Promise.all([

        task().then(v.parser(v.instance(Uint8Array))),

        Deno.readFile(path),

    ]);

    ast.assertEquals(node.buffer, deno.buffer);

});





Deno.test('read from stdin', async function () {

    const path = 'README.md';

    const { task } = parse([]);

    const [ node, deno ] = await Promise.all([

        task().then(v.parser(v.instance(ArrayBuffer))),

        Deno.readFile(path),

    ]);

    ast.assertEquals(node, deno.buffer);

});

