/* eslint no-console: "off" */

import $ from 'jquery'
import './style.css'

$('pre').text(`
DEBUG: ${DEBUG}
VERSION: ${VERSION}
CONFIG: ${JSON.stringify(CONFIG)}
`)
