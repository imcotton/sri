import { argv } from 'node:process';

import { parse } from './parse.ts';
import { main } from './main.ts';





await main(parse(argv.slice(2)));

