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

        if (format === 'base64') {
            return encodeBase64(source);
        }

        if (format === 'base58') {
            return encodeBase58(source);
        }

        return encodeHex(source);

    };

}





export type Format = 'base64' | 'base58' | 'hex';

export interface Info {
    task: () => Promise<BufferSource>;
    algorithm?: '1' | '256' | '384' | '512';
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

