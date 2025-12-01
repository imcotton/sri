import * as ast from 'jsr:@std/assert@1';

import { main } from '../src/main.ts';
import { load_by } from '../src/parse.ts';
import v from '../src/valibot.ts';





Deno.test('smoking npm:semver@7.7.1 -p -a 512', async function () {

    const url = 'https://registry.npmjs.org/semver/-/semver-7.7.1.tgz';
    const integrity = 'sha512-hlq8tAfn0m/61p4BVRcPzIGr6LKiMwo4VM6dGi6pt4qcRkmNzTcWq6eCEjEh+qXjkMDvPlOFFSGwQjoEa6gyMA==';

    const task = load(url);

    const res = await main({ task, algorithm: '512', prefix: true });

    ast.assertStrictEquals(res, integrity);

});





Deno.test('smoking npm:semver@7.7.1 -p -a 512 --base58', async function () {

    const url = 'https://registry.npmjs.org/semver/-/semver-7.7.1.tgz';

    const integrity = `

        3goJ6iN1JJsjXqeMd1CGHVD56zv3mRjy3zr5ct1ytDis
        c3JNK8j5redEKHgeRtCvQ1wydViMr4E8mtzbZCVS1XYb

    `.replaceAll(/\W+/g, '');

    const task = load(url);

    const res = await main({ task, algorithm: '512', format: 'base58' });

    ast.assertStrictEquals(res, integrity);

});





Deno.test('smoking npm:semver@7.7.1 -p -a 512 --hex', async function () {

    const url = 'https://registry.npmjs.org/semver/-/semver-7.7.1.tgz';

    const checksum = `

        865abcb407e7d26ffad69e0155170fcc81abe8b2a2330a3854ce9d1a2ea9
        b78a9c46498dcd3716aba782123121faa5e390c0ef3e53851521b0423a04
        6ba83230

    `.replaceAll(/\W+/g, '');

    const task = load(url);

    const res = await main({ task, checksum, algorithm: '512', format: 'hex' });

    ast.assertStrictEquals(res, checksum);

});





Deno.test('error on fetch', async function () {

    await using server = Deno.serve({ port: 0 }, function () {

        return new Response(null, { status: 404 });

    });

    const { addr: { hostname, port } } = server;

    const task = load(`http://${ hostname }:${ port }`);

    await ast.assertRejects(
        () => main({ task }),
        Error,
        'error on fetch',
    );

});





Deno.test('checksum FAILED', async function () {

    const sample = crypto.getRandomValues(new Uint8Array(42));

    const task = () => Promise.resolve(sample);

    const checksum = 'wat';

    try {

        await main({ task, checksum });

    } catch (e) {

        ast.assertIsError(e, Error, 'FAILED');
        ast.assert(typeof e.cause === 'string');

    }

});





const load = v.parser(load_by());

