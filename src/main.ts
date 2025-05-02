import { encodeBase64 } from '@std/encoding/base64';
import { encodeBase58 } from '@std/encoding/base58';
import { encodeHex }    from '@std/encoding/hex';





const { crypto: webcrypto } = globalThis;





function digest (algorithm: string) {

    return function (source: BufferSource) {

        return webcrypto.subtle.digest(algorithm, source);

    };

}





function encode (format: Format) {

    return function (source: ArrayBuffer) {

        const data = new Uint8Array(source);

        if (format === 'base64') {

            // @ts-ignore https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
            const result = data.toBase64?.();

            if (typeof result === 'string') {
                return result;
            }

            return encodeBase64(data);

        }

        if (format === 'base58') {
            return encodeBase58(data);
        }

        if (format === 'hex') {

            // @ts-ignore https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex
            const result = data.toHex?.();

            if (typeof result === 'string') {
                return result;
            }

            return encodeHex(data);

        }

        throw new Error(`unknown format: ${ format }`);

    };

}





export type Format = 'base64' | 'base58' | 'hex';

export type Algorithm = '1' | '256' | '384' | '512';

export interface Info {
    task: () => Promise<BufferSource>;
    algorithm?: Algorithm;
    format?: Format;
    prefix?: boolean;
    checksum?: string;
}





export async function main ({

        task,
        algorithm = '256',
        format = 'base64',
        prefix = false,
        checksum,

}: Info): Promise<string> {

    const algo = `SHA-${ algorithm }`;

    const output = await task()
        .then(digest(algo))
        .then(encode(format))
    ;

    if (checksum != null && output !== checksum) {
        throw new Error('FAILED', { cause: output });
    }

    if (prefix === true) {
        return algo.toLowerCase().replace('-', '').concat('-', output);
    }

    return output;

}

