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

            checksum: {
                type: 'string',
                short: 'c',
            },

        },

    });

    const { 'max-time': max_time, ...rest } = v.parse(v.object({

        algorithm:  v.exactOptional(w.algorithm),
        format:     v.exactOptional(w.format),
        'max-time': v.exactOptional(w.max_time),
        prefix:     v.exactOptional(v.boolean()),
        checksum:   v.exactOptional(v.string()),

    }), values);

    const [ task ] = v.parse(v.tuple([

        v.union([ load_by(max_time), from_file, from_stdin ]),

    ]), positionals);

    return { ...rest, task } ;

}





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

