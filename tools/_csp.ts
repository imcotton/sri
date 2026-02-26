import { main as shasum } from '../src/main.ts';

import { mark } from './_utils.ts';





const text = new TextEncoder();





export async function hashes (html: string) {

    const collect = hashes_from(scrape(html));

    const [ scripts, styles, unsafe_hashes ] = await Promise.all([

        collect(
            mark(`<script type="importmap">`, `</script>`),
            mark(`<script type="module">`, `</script>`),
            mark(`<script>`, `</script>`),
        ),

        collect(
            mark(`<style>`, `</style>`),
        ),

        collect(
            mark(`onclick="`, `"`),
        ),

    ]);

    return { scripts, styles, unsafe_hashes };

}





export function content (res : Awaited<ReturnType<typeof hashes>>) {

    const { scripts, styles, unsafe_hashes } = res;

    const dict = {
        ['default-src']: [ 'none' ],
        ['form-action']: [ 'none' ],
        ['img-src']:     [ 'self', 'data:', 'blob:' ],
        ['style-src']:   [ 'self', ...styles ],
        ['script-src']:  [
            'self', ...scripts, 'unsafe-hashes', ...unsafe_hashes,
        ],
    };

    const list = Object.entries(dict).map(function ([ key, xs ]) {

        const refined = xs.map(x => /^(data|blob):/.test(x) ? x : `'${ x }'`);

        return Array.of(key).concat(refined).join(' ');

    });

    return list.join('; ');

}





function hashes_from (f: ReturnType<typeof scrape>) {

    return function (...xs: ReturnType<typeof mark>[]) {

        const list = Iterator.from(xs)
            .flatMap(f)
            .map(content => shasum({
                prefix: true,
                algorithm: '256',
                format: 'base64',
                task: () => Promise.resolve(text.encode(content)),
            }))
        ;

        return Promise.all(list.toArray());

    };

}





function scrape (state: string) {

    return function * (f: ReturnType<typeof mark>) {

        while (true) {

            const { i, down, middle } = f(state);

            if (i < 0) {
                return;
            }

            yield middle;

            state = state.slice(down);

        }

    };

}

