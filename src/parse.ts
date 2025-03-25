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

        algorithm: v.optional(v.algorithm, '256'),
        format: v.optional(v.format, 'base64'),
        'max-time': v.optional(v.max_time, '10'),
        prefix: v.optional(v.boolean(), false),

    }), values);

    const [ url ] = v.parse(v.tuple([ v.http_https ]), positionals);

    return { ...rest, url, max_time };

}

