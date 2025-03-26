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
    url: string;
    algorithm?: '1' | '256' | '384' | '512';
    format?: 'hex' | 'base64';
    max_time?: number;
    prefix?: boolean;
}





export async function main ({

        url,
        algorithm = '256',
        format = 'base64',
        max_time = 10,
        prefix = false,

}: Info): Promise<string> {

    const res = await fetch(url, {
        signal: AbortSignal?.timeout(max_time * 1000),
    });

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
        return algo.toLowerCase().replace('-', '').concat('-', output);
    }

    return output;

}

