#!/usr/bin/env -S deno run --allow-run -E -R -N=raw.esm.sh:443 -W=./dist

import { build, stop } from 'npm:esbuild@0.25.3';

import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@0.11.1';

import pkg from '../deno.json' with { type: 'json' };

import * as csp from './_csp.ts';

import * as u from './_utils.ts';





async function main ({

        dist = u.concat('./dist'),
        pages = u.concat('./pages'),

} = {}) {

    const dist_assets = dist.slash('./assets');

    await Deno.mkdir(dist_assets.join(), { recursive: true });

    await Deno.copyFile(pages.slash('favicon.ico').join(),
                         dist.slash('favicon.ico').join(),
    );

    const dist_assets_app = dist_assets.slash('app.js').join();

    await build({

        entryPoints: [ './src/app.ts' ],
        outfile: dist_assets_app,
        plugins: [ ...denoPlugins() ],
        legalComments: 'none',
        format: 'esm',
        bundle: true,
        minify: true,

    }).then(stop);

    const { integrity, checksum } = await Deno.open(dist_assets_app).then(

        u.calculate({ algorithm: '256', size: 8 })

    );

    const dist_assets_app_hashed = dist_assets.slash(`app.${ checksum }.js`);
    const      assets_app_hashed = dist_assets_app_hashed.tail.join();

    await Deno.copyFile(dist_assets_app,
                        dist_assets_app_hashed.join(),
    );

    const       index_html = 'index.html';
    const pages_index_html = pages.slash(index_html).join();

    await Deno.readTextFile(pages_index_html)

        .then(u.parse_pico_css)

        .then(async function ({ folder, version, name, ...remote }) {

            const path = dist_assets.slash(folder, version, name);

            await Deno.mkdir(path.init.join(), { recursive: true });

            await u.load_and_verify(remote).then(

                u.write_file(path.join())

            );

            return Deno.readTextFile(pages_index_html).then(

                u.replace(remote.url, path.tail.join())

            );

        })

        .then(u.alert(`<script type="importmap">`,

            JSON.stringify({

                imports: {
                    './app.js': assets_app_hashed,
                },

                integrity: {
                    [ assets_app_hashed ]: integrity,
                },

            }, null, 2),

        `</script>`, '\n'))

        .then(html => csp.hashes(html)

            .then(csp.content)

            .then(content => u.alert(`http-equiv="Content-Security-Policy" content="`,

                content,

            `" />`))

            .then(update => update(html))

        )

        .then(u.alert(`<code x-ver>`,

            pkg.version,

        `</code>`))

        .then(u.write_text_file(

            dist.slash(index_html).join()

        ))

    ;

}





if (import.meta.main) {

    main();

}

