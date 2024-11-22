/*
  This library is concerned with reading messages from a Nostr relay.
*/

// Global npm libraries
import Nostr from 'nostr'
import MsgLib from 'bch-message-lib'

class Read {
  constructor () {
    // Encapsulate Dependencies
    this.RelayPool = Nostr.RelayPool
    this.MsgLib = MsgLib
    this.msgLib = {} // Placeholder

    // Bind 'this' object to all subfunctions
    this.getNostrMsgFromTxid = this.getNostrMsgFromTxid.bind(this)
    this.getEventIdFromTx = this.getEventIdFromTx.bind(this)
    this.getNostrMsg = this.getNostrMsg.bind(this)
    this.instanceMsgLib = this.instanceMsgLib.bind(this)
    this.createSub = this.createSub.bind(this)
    this.closeConnection = this.closeConnection.bind(this)
  }

  // Macro orchestrator function.
  // Given a TXID for a PS001 message signal, retrieve the Nostr post event ID
  // and retrieve the post from a Nostr relay.
  async getNostrMsgFromTxid (inObj = {}) {
    try {
      const { txid, wallet, relayWs = 'https://nostr-relay.psfoundation.info' } = inObj

      // Input validation
      if (!txid) throw new Error('txid property in input object required when calling getNostrMsgFromTxid()')
      if (!wallet) throw new Error('Instance of minimal-slp-wallet required as wallet property of input object when calling getNostrMsgFromTxid()')

      // Instantiate the message library.
      this.instanceMsgLib({ wallet })

      // Get TX Data
      const txDataResult = await wallet.getTxData([txid])
      const txData = txDataResult[0]
      // console.log('txData: ', JSON.stringify(txData, null, 2))

      // Get the BCH address of the sender.
      const sender = txData.vin[0].address

      // Get the Nostr eventId from tx OP_RETURN
      const { eventId } = this.getEventIdFromTx({ tx: txData })
      console.log(`Nostr Event ID: ${eventId}`)

      // Get the post from the Nostr relay
      const { message } = await this.getNostrMsg({ eventId, relayWs })

      return { message, sender }
    } catch (err) {
      console.error('Error in bch-nostr/lib/read.js/getNostrMsgFromTxid()')
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

  // Given a TX object for a message signal, retrieve the Nostr Event ID holding
  // the message contents.
  getEventIdFromTx (inObj = {}) {
    try {
      const { tx } = inObj

      if (!tx) throw new Error('tx data object required')

      let eventId = ''

      // Loop through all the vout entries in this transaction.
      for (let j = 0; j < tx.vout.length; j++) {
        // for (let j = 0; j < 5; j++) {
        const thisVout = tx.vout[j]
        // console.log(`thisVout: ${JSON.stringify(thisVout,null,2)}`)

        // Assembly code representation of the transaction.
        const asm = thisVout.scriptPubKey.asm
        // console.log(`asm: ${asm}`)

        // Decode the transactions assembly code.
        const msg = this.msgLib.memo.decodeTransaction(asm, '-21101')

        if (msg) {
          // Filter the code to see if it contains an IPFS eventId And Subject.
          const data = this.msgLib.memo.filterMSG(msg, 'MSG NOSTR')
          // console.log('data: ', data)
          if (data && data.hash) {
            eventId = data.hash
          }
        }
      }
      console.log('eventId: ', eventId)
      if (!eventId) {
        throw new Error('Message not found!')
      }

      return { eventId }
    } catch (err) {
      console.error('Error in getEventIdFromTx()')
      throw err
    }
  }

  // Given an Event ID, retrieve the post content from a Nostr relay.
  async getNostrMsg (inObj = {}) {
    const { eventId, relayWs } = inObj

    // Input validation
    if (!eventId) throw new Error('eventId required for input object to getNostrMsg()')
    if (!relayWs) throw new Error('relayWs required for input object to getNostrMsg()')

    // Define the relay pool.
    const relays = [relayWs]
    const pool = this.RelayPool(relays)

    const nostrData = new Promise((resolve, reject) => {
      pool.on('open', relay => {
        // relay.subscribe('REQ', { ids: [eventId] })
        this.createSub({ relay, eventId })
      })

      pool.on('eose', relay => {
        this.closeConnection({ relay })
      })

      pool.on('event', (relay, subId, ev) => {
        resolve(ev)
      })
    })

    const event = await nostrData
    // console.log('event: ', event)

    // Extract the message part of the event.
    const message = event.content

    return { message }
  }

  // Event handler for submitting a subscription to the Nostr relay.
  createSub (inObj = {}) {
    const { relay, eventId } = inObj
    relay.subscribe('REQ', { ids: [eventId] })

    return true
  }

  // Event handler for closing the connection to the Nostr relay.
  closeConnection (inObj = {}) {
    const { relay } = inObj
    relay.close()

    return true
  }
}

export default Read
