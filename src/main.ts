import { argv } from 'node:process';
import { parseArgs } from 'node:util';

import { encodeHex } from '@std/encoding/hex';
import { encodeBase64 } from '@std/encoding/base64';

import * as v from './valibot.ts';

const { crypto: webcrypto } = globalThis;





function parse (args: Iterable<string>) {

    const { values, positionals } = parseArgs({

        args: Array.from(args),

        allowPositionals: true,

        options: {

            algorithm: {
                type: 'string',
                short: 'a',
            },

            format: {
                type: 'string',
                short: 'f',
            },

            'max-time': {
                type: 'string',
                short: 'm',
            },

            prefix: {
                type: 'boolean',
                short: 'p',
            },

        },

    });

    const { 'max-time': max_time, ...rest } = v.parse(v.object({

        algorithm: v.optional(v.algorithm, '256'),
        format: v.optional(v.format, 'base64'),
        'max-time': v.optional(v.max_time, '10'),
        prefix: v.optional(v.boolean(), false),

    }), values);

    const [ url ] = v.parse(v.tuple([ v.http_https ]), positionals);

    return { ...rest, url, max_time };

}





function digest (algorithm: string) {

    return function (source: BufferSource) {

        return webcrypto.subtle.digest(algorithm, source);

    };

}





function encode (format: 'base64' | 'hex') {

    if (format === 'base64') {
        return encodeBase64;
    }

    return encodeHex;

}





export async function main ({

        args = argv.slice(2),
        print = console.log,

} = {}) {

    const { url, algorithm, format, prefix, max_time } = parse(args);

    const res = await fetch(url, { signal: AbortSignal.timeout(max_time) });

    if (res.ok !== true) {
        await res.body?.cancel();
        throw new Error('error on fetch');
    }

    const algo = `SHA-${ algorithm }`;

    const output = await res.arrayBuffer()
        .then(digest(algo))
        .then(encode(format))
    ;

    if (prefix) {
        return print(algo.toLowerCase().replace('-', '').concat('-', output));
    }

    print(output);

}

