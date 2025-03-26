import { parseArgs } from 'node:util';

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

        },

    });

    const { 'max-time': max_time, ...rest } = v.parse(v.object({

        algorithm:  v.exactOptional(w.algorithm),
        format:     v.exactOptional(w.format),
        'max-time': v.exactOptional(w.max_time),
        prefix:     v.exactOptional(v.boolean()),

    }), values);

    const [ url ] = v.parse(v.tuple([ w.http_https ]), positionals);

    return max_time ? { ...rest, url, max_time }
                    : { ...rest, url }
    ;

}

