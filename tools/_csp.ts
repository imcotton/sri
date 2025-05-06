import { main as shasum } from '../src/main.ts';

import { mark } from './_utils.ts';





const text = new TextEncoder();





export async function csp_hashes (html: string) {

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

