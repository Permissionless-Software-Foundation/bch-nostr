/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

import Keys from './lib/keys.js'
import Post from './lib/post.js'
import Signal from './lib/signal.js'

class BchNostr {
  constructor () {
    this.keys = new Keys()
    this.post = new Post()
    this.signal = new Signal()
  }
}

export default BchNostr
