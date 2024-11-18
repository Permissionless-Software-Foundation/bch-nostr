/*
  This library is concerned with PS001 message signals for signaling a BCH
  address that it has a message waiting for it on a Nostr relay.
*/

// Global npm libraries
import MsgLib from 'bch-message-lib'

class Signal {
  constructor () {
    // Encapsulate Dependencies
    this.MsgLib = MsgLib
    this.msgLib = {} // Placeholder

    // Bind 'this' object to all subfunctions
    this.sendMsgSignal = this.sendMsgSignal.bind(this)
    this.instanceMsgLib = this.instanceMsgLib.bind(this)
  }

  // Send a BCH TX to an address to signal that it has a message waiting for it
  // on Nostr. Returns a TXID of the TX representing the signal.
  // Expects input object with the following properties:
  // - wallet - instance of minimal-slp-wallet
  // - addr - BCH address to send signal to.
  // - subject - (optional) cleartext subject line to include in signal OP_RETURN
  // - eventId - Nostr Event ID for a post containing the e2ee message.
  async sendMsgSignal (inObj = {}) {
    try {
      const { wallet, addr, subject, eventId } = inObj

      // Input validation
      if (!wallet) throw new Error('Instance of minimal-slp-wallet required as wallet input property.')
      if (!addr) throw new Error('Receiver address required as addr input property.')
      if (!eventId) throw new Error('Nostr Event ID required as eventId property.')

      // Wait a couple seconds to let the indexer update its UTXO state.
      await wallet.bchjs.Util.sleep(2000)

      // Update the UTXO store in the wallet.
      await wallet.getUtxos()

      // Instantiate the message library.
      // const msgLib = new this.MsgLib({ wallet })
      this.instanceMsgLib({ wallet })

      // Generate the hex transaction containing the PS001 message signal.
      const txHex = await this.msgLib.memo.writeMsgSignalNostr(
        eventId,
        [addr],
        subject
      )

      if (!txHex) {
        throw new Error('Could not build a hex transaction')
      }

      // Broadcast Transaction
      const txidStr = await wallet.ar.sendTx(txHex)
      // console.log(`Signal Transaction ID : ${JSON.stringify(txidStr, null, 2)}`)

      return { txid: txidStr }
    } catch (err) {
      console.error('Error in bch-nostr/lib/signal.js/sendMsgSignal()')
      throw err
    }
  }

  // Instantiate the message library. This function makes it easier to mock unit
  // tests.
  instanceMsgLib (inObj = {}) {
    const { wallet } = inObj
    this.msgLib = new this.MsgLib({ wallet })
    return this.msgLib
  }
}

export default Signal
