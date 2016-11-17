/* eslint no-console: "off" */

import $ from 'jquery';
import './style.css';

console.log(DEBUG);
console.log(VERSION);
console.log(CONF);

$('.foo__info').html(`
  DEBUG: ${DEBUG}
  VERSION: ${VERSION}
  CONF: ${JSON.stringify(CONF, null, 2)}
`);
