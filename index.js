/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

import BCHJS from '@psf/bch-js'

import Util from './lib/util.js'

import Keys from './lib/keys.js'
import Post from './lib/post.js'
const util = new Util()

class BchNostr {
  constructor () {
    this.bchjs = new BCHJS()
    this.util = util
    this.keys = new Keys()
    this.post = new Post()
  }
}

export default BchNostr
