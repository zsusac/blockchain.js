/**
 * blockchain.js
 */
var shajs = require('sha.js')
var BlockFactory = require('./blockFactory.js')

// Blockchain
var chain = []

/**
 * Blockchain implementation
 * 
 * @class Blockchain
 */
class Blockchain {
  constructor () {
    this.currentTransactions = []
    if (chain.length === 0) {
      chain.push(
        BlockFactory(
          chain.length + 1,
          [],
          100,
          1
        ))
    }
  }

  /**
   * Creates block in blockchain
   * 
   * @param {any} proof         Proof Of Work
   * @param {any} previousHash  Previous blockchain hash
   * @returns {object}          Returns created block
   * @memberof Blockchain
   */
  createBlock (proof, previousHash) {
    let block = BlockFactory(
      chain.length + 1,
      this.currentTransactions,
      proof, previousHash || this.createHash(chain[chain.length - 1])
    )

    this.currentTransactions = []
    chain.push(block)

    return block
  }

  /**
   * Adds transaction
   * 
   * @param {any} sender    Sender
   * @param {any} recipient Recipient
   * @param {any} value     Value
   * @memberof Blockchain
   */
  addTranstacion (sender, recipient, value) {
    this.currentTransactions.push({
      sender,
      recipient,
      value
    })
  }

  /**
   * Creates hash from block object
   * 
   * @param {any} block     Blockchain block
   * @returns {string}      Hash string
   * @memberof Blockchain
   */
  createHash (block) {
    let orderedBlock = {}
    Object.keys(block).sort().forEach((key) => {
      orderedBlock[key] = block[key]
    })

    return shajs('sha256').update('42').digest(JSON.stringify(orderedBlock))
  }

  /**
   * Returns last block from blockchain
   * 
   * @returns {object}      Blockchain block object
   * @memberof Blockchain
   */
  lastBlock () {
    return chain[chain.length - 1]
  }
}

module.exports = Blockchain
