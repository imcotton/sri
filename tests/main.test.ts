import * as ast from 'jsr:@std/assert@1';

import { main } from '../src/main.ts';





Deno.test('smoking npm:semver@7.7.1 -p -a 512', async function () {

    const url = 'https://registry.npmjs.org/semver/-/semver-7.7.1.tgz';
    const integrity = 'sha512-hlq8tAfn0m/61p4BVRcPzIGr6LKiMwo4VM6dGi6pt4qcRkmNzTcWq6eCEjEh+qXjkMDvPlOFFSGwQjoEa6gyMA==';

    const res = await main({ url, algorithm: '512', prefix: true });

    ast.assertStrictEquals(res, integrity);

});





Deno.test('smoking npm:semver@7.7.1 -p -a 512 -f hex', async function () {

    const url = 'https://registry.npmjs.org/semver/-/semver-7.7.1.tgz';

    const integrity = `

        865abcb407e7d26ffad69e0155170fcc81abe8b2a2330a3854ce9d1a2ea9
        b78a9c46498dcd3716aba782123121faa5e390c0ef3e53851521b0423a04
        6ba83230

    `.replaceAll(/\W+/g, '');

    const res = await main({ url, algorithm: '512', format: 'hex' });

    ast.assertStrictEquals(res, integrity);

});





Deno.test('error on fetch', async function () {

    try {

        await main({ url: 'https://example.net/waaaat' });

    } catch (e) {

        ast.assertIsError(e, Error, 'error on fetch');

    }

});

