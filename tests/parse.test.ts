import * as ast from 'jsr:@std/assert@1';

import { parse } from '../src/parse.ts';





Deno.test('with url on start and max-time', function () {

    const url = 'https://wat';

    const res = parse([
        url,
        '-m', '42',
    ]);

    ast.assertObjectMatch(res, { url, max_time: 42 });

});





Deno.test('with url on end', function () {

    const url = 'https://wat';

    const res = parse([
        '-p',
        url,
    ]);

    ast.assertObjectMatch(res, { url });

});





Deno.test('without url', function () {

    const run = () => parse([
        '--format', 'hex'
    ]);

    ast.assertThrows(run, 'invalid url');

});

