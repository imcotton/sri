import { encodeHex } from '@std/encoding/hex';
import { encodeBase64 } from '@std/encoding/base64';

const { crypto: webcrypto } = globalThis;





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





export interface Info {
    task: () => Promise<BufferSource>;
    algorithm?: '1' | '256' | '384' | '512';
    format?: 'hex' | 'base64';
    prefix?: boolean;
}





export async function main ({

        task,
        algorithm = '256',
        format = 'base64',
        prefix = false,

}: Info): Promise<string> {

    const algo = `SHA-${ algorithm }`;

    const output = await task()
        .then(digest(algo))
        .then(encode(format))
    ;

    if (prefix === true) {
        return algo.toLowerCase().replace('-', '').concat('-', output);
    }

    return output;

}

