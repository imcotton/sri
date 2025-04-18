import { stdin } from 'node:process';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { arrayBuffer } from 'node:stream/consumers';

import v, * as w from './valibot.ts';
import type { Info } from './main.ts';





export function parse (args: Iterable<string>): Info {

    const { values, positionals } = parseArgs({

        args: Array.from(args),

        allowPositionals: true,

        options: {

            algorithm: {
                type: 'string',
                short: 'a',
            },

            'max-time': {
                type: 'string',
                short: 'm',
            },

            checksum: {
                type: 'string',
                short: 'c',
            },

            prefix: {
                type: 'boolean',
                short: 'p',
            },

            hex: {
                type: 'boolean',
            },

            base58: {
                type: 'boolean',
            },

            base64: {
                type: 'boolean',
            },

        },

    });

    const { 'max-time': max_time, ...rest } = v.parse(options, values);

    const [ task ] = v.parse(v.tuple([

        v.union([ load_by(max_time), from_file, from_stdin ]),

    ]), positionals);

    return { ...rest, task } ;

}





const options = v.pipe(

    v.object({

        algorithm:  v.exactOptional(w.algorithm),
        'max-time': v.exactOptional(w.max_time),
        checksum:   v.exactOptional(v.string()),
        prefix:     v.exactOptional(v.boolean()),
        hex:        v.exactOptional(v.boolean()),
        base58:     v.exactOptional(v.boolean()),
        base64:     v.exactOptional(v.boolean()),

    }),

    v.check(function ({ hex, base58, base64 }) {

        return [ hex, base58, base64 ].filter(Boolean).length < 2;

    }, 'conflict between: --hex, --base58, --base64'),

    v.transform(function ({ hex, base58, base64, ...rest }) {

        const format =    hex ?    'hex' as const
                     : base58 ? 'base58' as const
                     : base64 ? 'base64' as const
                     : void 0
        ;

        return format ? { ...rest, format } : rest;

    }),

);





export function load_by (max_time = 60)  {

    return v.pipe(

        w.http_https,

        v.transform(url => async function () {

            const res = await fetch(url, {
                signal: AbortSignal?.timeout(max_time * 1000),
            });

            if (res.ok !== true) {
                await res.body?.cancel();
                throw new Error('error on fetch');
            }

            return res.arrayBuffer();

        }),

    );

}





const from_stdin = v.pipe(
    v.undefined(),
    v.transform(() => () => arrayBuffer(stdin)),
);





const from_file = v.pipe(
    v.string(),
    v.transform(path => () => readFile(pathToFileURL(path))),
);

