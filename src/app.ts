import { main } from './main.ts';





make('inputs');

function make (id: string) {

    const root = document.getElementById(id);

    assert(root instanceof HTMLFormElement, `getElementBy ${ id }`);

    root.addEventListener('submit', async function (event) {

        event.preventDefault();

            assert(event.target instanceof HTMLFormElement);

        const form = new FormData(event.target);

        const file = form.get('file');

            assert(file instanceof File);

        const task = () => file.arrayBuffer();

        const format = form.get('format');

            assert(format === 'base64'
                || format === 'base58'
                || format === 'hex'
            );

        const algorithm = form.get('algorithm');

            assert(algorithm === '1'
                || algorithm === '256'
                || algorithm === '384'
                || algorithm === '512'
            );

        const prefix = form.get('prefix') === 'on';

        const result = await main({ format, algorithm, task, prefix });

        alert(result);

    });

}





function assert (expr: unknown, cause?: string): asserts expr {

    if (!expr) {
        throw new Error('fail assertion', { cause });
    }

}

