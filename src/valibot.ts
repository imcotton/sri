import * as v from 'valibot';
export * as default from 'valibot';





export const algorithm = v.picklist(
    [ '1', '256', '384', '512' ],
    'invalid algorithm',
);





export const format = v.picklist(
    [ 'base64', 'base58', 'hex' ],
    'invalid format',
);





export const http_https = v.union([
    v.pipe(v.string(), v.startsWith('http://')),
    v.pipe(v.string(), v.startsWith('https://')),
], 'invalid url');





export const max_time = v.message(v.pipe(

    v.string(),
    v.digits(),
    v.transform(Number.parseInt),

), 'invalid max time');





export function exist <T> () {

    return v.custom<NonNullable<T>>(a => a != null);

}

