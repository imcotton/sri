import * as v from 'valibot';
export *      from 'valibot';





export const algorithm = v.picklist(
    [ '1', '256', '384', '512' ],
    'invalid algorithm',
);





export const format = v.picklist(
    [ 'hex', 'base64' ],
    'invalid format',
);





export const http_https = v.union([
    v.pipe(v.string(), v.startsWith('http://')),
    v.pipe(v.string(), v.startsWith('https://')),
], 'invalid url');





export const max_time = v.pipe(
    v.string(),
    v.digits(),
    v.transform(d => Number.parseInt(d) * 1000),
);

