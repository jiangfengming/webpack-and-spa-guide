/* eslint no-console: "off" */

import $ from 'jquery'
import './style.css'

console.log(DEBUG)
console.log(VERSION)
console.log(CONFIG)

$('.foo__info').html(`
  DEBUG: ${DEBUG}
  VERSION: ${VERSION}
  CONFIG: ${JSON.stringify(CONFIG, null, 2)}
`)
