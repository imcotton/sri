import { main, type Info } from './main.ts';





interface Observer <T> {
    next  (value: T): void;
    error (cause: Error): void;
}





export function make (

        form: HTMLElement | null | undefined,
        { next, error }: Observer<string>,

): () => void {

    return hook(form, {

        error,

        next (info) {

            main(info).then(next).catch(error);

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

