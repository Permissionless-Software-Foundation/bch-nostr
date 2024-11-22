/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

import Keys from './lib/keys.js'
import Post from './lib/post.js'
import Signal from './lib/signal.js'
import Read from './lib/read.js'

class BchNostr {
  constructor () {
    this.keys = new Keys()
    this.post = new Post()
    this.signal = new Signal()
    this.read = new Read()
  }
}

export default BchNostr
