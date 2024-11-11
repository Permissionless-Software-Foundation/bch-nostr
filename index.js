/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

import BCHJS from '@psf/bch-js'

import Util from './lib/util.js'
const util = new Util()

import Keys from './lib/keys.js'

class BchNostr {
  constructor () {

    this.bchjs = new BCHJS()
    this.util = util
    this.keys = new Keys()
  }
}

export default BchNostr
