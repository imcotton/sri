import * as ast from 'jsr:@std/assert@1';

import { digest } from '../src/main.ts';
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





Deno.test('on invalid --max-time', function () {

    const list = [
        '4.2',
        '1-2',
        'wat',
    ];

    for (const m of list) {

        const run = () => parse([ '--max-time', m ]);

        ast.assertThrows(run, Error, 'invalid max time', `on: ${ m }`);

    }

});





Deno.test('read local file', async function () {

    const path = 'README.md';

    const { task } = parse([
        path,
    ]);

    const algo = 'SHA3-256';

    const [ node, deno ] = await Promise.all([

        task(algo).then(v.parser(v.instance(Uint8Array))),

        Deno.readFile(path).then(digest(algo)),

    ]);

    ast.assertEquals(node.buffer, deno);

});





Deno.test('read from stdin', async function () {

    const path = 'README.md';
    const algo = 'SHA-256';

    using source = await Deno.open(path, { read: true });

    const [ s1, s2 ] = source.readable.tee();

    const { task: t1 } = parse([     ], s1);
    const { task: t2 } = parse([ '-' ], s2);

    const [ r1, r2 ] = await Promise.all([ t1(algo), t2(algo) ]);

    ast.assertEquals(r1, r2);

});





Deno.test('read from stdin (required)', async function () {

    const algo = 'SHA-256';

    await Promise.all([

        ast.assertRejects(() => parse([     ]).task(algo)),
        ast.assertRejects(() => parse([ '-' ]).task(algo)),

    ]);

});





Deno.test('format flags', function () {

    ast.assertObjectMatch(parse([ '--hex' ]),    { format: 'hex' });
    ast.assertObjectMatch(parse([ '--base58' ]), { format: 'base58' });
    ast.assertObjectMatch(parse([ '--base64' ]), { format: 'base64' });

    ast.assertObjectMatch(parse([ '--base64', '--hex' ]), { format: 'hex' });
    ast.assertObjectMatch(parse([ '--hex', '--base58' ]), { format: 'base58' });

});

