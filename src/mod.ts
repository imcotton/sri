import { argv, stdin } from 'node:process';

import { parse } from './parse.ts';
import { main } from './main.ts';





main(parse(argv.slice(2), stdin)).then(console.log);

