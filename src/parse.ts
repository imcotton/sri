import { parseArgs, type ParseArgsConfig } from 'node:util';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { arrayBuffer } from 'node:stream/consumers';

import v, * as w from './valibot.ts';
import type { Format, Info } from './main.ts';





export function parse (

        args: Iterable<string>,
        input?: AsyncIterable<Uint8Array<ArrayBuffer>>,

): Info {

    const { values, positionals, tokens } = parseArgs({

        args: Array.from(args),
        allowPositionals: true,
        tokens: true,
        options,

    });

    const { 'max-time': max_time, ...rest } = v.parse(v.object({

        algorithm:  v.exactOptional(w.algorithm),
        'max-time': v.exactOptional(w.max_time),
        checksum:   v.exactOptional(v.string()),
        prefix:     v.exactOptional(v.boolean()),

    }), values);

    const [ task ] = v.parse(v.tuple([

        v.union([ load_by(max_time), from_standard(input), from_file ]),

    ]), positionals);

    const format = tokens.reduce(function (acc, token) {

        if (token.kind === 'option') {

            if (   token.name === 'base64'
                || token.name === 'base58'
                || token.name === 'hex'
            ) {
                return token.name;
            }

        }

        return acc;

    }, void 0 as Format | undefined);

    return format ? { ...rest, format, task }
                  : { ...rest,         task }
    ;

}





const options = {

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

} satisfies ParseArgsConfig['options'];





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





function from_standard (input?: AsyncIterable<Uint8Array<ArrayBuffer>>) {

    return v.pipe(

        v.optional(v.literal('-')),

        v.transform(() => async function () {

            v.assert(w.exist(), input);

            return await arrayBuffer(input);

        }),

    );

}





const from_file = v.pipe(
    v.string(),
    v.transform(path => () => readFile(pathToFileURL(path))),
);

