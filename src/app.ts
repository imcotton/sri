import { encodeQR } from 'qr';

import { main, type Info } from './main.ts';





interface Observer <T> {
    next  (value: T): void;
    error (cause: Error): void;
}





export type Result = {
    hash: string,
    qr: {
        blob: Blob,
    },
};





export function make (

        form: HTMLElement | null | undefined,
        { next, error }: Observer<Result>,

): () => void {

    return hook(form, {

        error,

        async next (info) {

            try {

                const hash = await main(info);

                const blob = await gen_qr_png(hash);

                next({ hash, qr: { blob } });

            } catch (cause) {

                error(failed(cause));

            }

        },

    });

}





function hook (form: unknown, { next, error }: Observer<Info>) {

    assert(form instanceof HTMLFormElement, 'invalid form');

    const { abort, signal } = new AbortController();

    form.addEventListener('submit', function (event) {

        try {

            event.preventDefault();

                assert(event.target instanceof HTMLFormElement);

            const data = new FormData(event.target);

            const file = data.get('file');

                assert(file instanceof File, 'invalid file');
                assert(file.size > 0,          'empty file');

            const task = () => file.arrayBuffer();

            const format = data.get('format');

                assert(format === 'base64'
                    || format === 'base58'
                    || format === 'hex'
                , 'invalid format');

            const algorithm = data.get('algorithm');

                assert(algorithm === '1'
                    || algorithm === '256'
                    || algorithm === '384'
                    || algorithm === '512'
                , 'invalid algorithm');

            const prefix = data.get('prefix') === 'on';

            next({ format, algorithm, task, prefix });

        } catch (cause) {

            error(failed(cause));

        }

    }, { signal });

    return () => abort();

}





async function gen_qr_png (txt: string, scale = 6) {

    const bitmap = await createImageBitmap(new Blob([

        encodeQR(txt, 'gif', { scale }) as BufferSource,

    ], { type: 'image/gif' }));

    try {

        return await convert_png(bitmap);

    } finally {

        bitmap.close();
    }

}





async function convert_png (bitmap: ImageBitmap) {

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);

    const ctx = canvas.getContext('bitmaprenderer', { alpha: false });

        assert(ctx);

    ctx.transferFromImageBitmap(bitmap);

    return await canvas.convertToBlob({ type: 'image/png' });

}





function failed (cause: unknown) {

    if (cause instanceof Error) {
        return cause;
    }

    return new Error('unknown', { cause });

}





function assert (expr: unknown, msg = 'fail assertion'): asserts expr {

    if (!expr) {
        throw new Error(msg);
    }

}





export function byId     (id: string): HTMLElement | undefined;
export function byId <T> (id: string, f: (_: HTMLElement) => T): T | undefined;
export function byId <T> (id: string, f?: (_: HTMLElement) => T) {

    const elm = document.getElementById(id);

    if (elm != null) {

        if (typeof f === 'function') {
            return f(elm);
        }

        return elm;

    }

}





export function removeAttribute (

        attr: string,

): (elm: HTMLElement) => void {

    return function (elm) {

        if (elm.hasAttribute(attr)) {
            elm.removeAttribute(attr);
        }

    };

}





export function setAttribute (

        attr: string,
        value: string,

): (elm: HTMLElement) => void {

    return function (elm) {

        elm.setAttribute(attr, value);

    };

}

