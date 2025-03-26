import { parseArgs } from 'node:util';

import * as v from './valibot.ts';
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

        algorithm: v.exactOptional(v.algorithm),
        format: v.exactOptional(v.format),
        'max-time': v.exactOptional(v.max_time),
        prefix: v.exactOptional(v.boolean()),

    }), values);

    const [ url ] = v.parse(v.tuple([ v.http_https ]), positionals);

    return max_time ? { ...rest, url, max_time }
                    : { ...rest, url }
    ;

}

