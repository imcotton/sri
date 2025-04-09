import { argv } from 'node:process';

import { parse } from './parse.ts';
import { main } from './main.ts';





main(parse(argv.slice(2))).then(console.log);

