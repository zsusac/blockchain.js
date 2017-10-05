/**
 * blockchain.js
 */
var shajs = require('sha.js')
var BlockFactory = require('./blockFactory.js')

// Blockchain (distributed ledger)
var chain = []
// Current transactions waiting to be written down in the blockchain
var currentTransactions = []

/**
 * Blockchain implementation
 * 
 * @class Blockchain
 */
class Blockchain {
  constructor () {
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
   * @param {any} proof         Proof
   * @param {any} previousHash  Previous blockchain hash
   * @returns {object}          Returns created block
   * @memberof Blockchain
   */
  createBlock (proof, previousHash) {
    previousHash = (typeof previousHash !== 'undefined') ? previousHash : this.createHash(chain[chain.length - 1])
    let block = BlockFactory(
      chain.length + 1,
      currentTransactions,
      proof,
      previousHash
    )

    currentTransactions = []
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
    currentTransactions.push({
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

    return shajs('sha256').update(JSON.stringify(orderedBlock)).digest('hex')
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

  /**
   * Simple Proof of Work Algorithm - Hashcash
   * 
   * @param {any} lastProof Last proof
   * @returns {int}         Proof
   * @memberof Blockchain
   */
  proofOfWork (lastProof) {
    let proof = 0
    while (!this.validProof(lastProof, proof)) {
      proof += 1
    }

    return proof
  }

  /**
   * Validates the Proof
   * 
   * @param {any} lastProof Last proof
   * @param {any} proof     Proof
   * @returns {bool}        Returns true if hash starts with "0000"
   * @memberof Blockchain
   */
  validProof (lastProof, proof) {
    let guess = `${lastProof}${proof}`
    let guessHash = shajs('sha256').update(guess).digest('hex')

    return guessHash.substring(0, 4) === '0000'
  }

  /**
   * Check if provided blockchain is valid
   * 
   * @param {array} chain   Blockchain
   * @returns {bool}        Returns true if chain is valid
   * @memberof Blockchain
   */
  validChain (chain) {
    let lastBlock = chain[0]
    let index = 1
    while (index < chain.length) {
      let block = chain[index]
      if (block.previousHash !== this.createHash(lastBlock)) {
        return false
      }

      if (!this.validProof(lastBlock.proof, block.proof)) {
        return false
      }

      lastBlock = block
      index += 1
    }

    return true
  }

  /**
   * Resolves conflicts by replacing our chain with the longest one in the network
   * 
   * @param {any} neighboringChains Array of other blockchains in the network
   * @returns {bool} Returns true if our chain is replaced with neighboring chain
   * @memberof Blockchain
   */
  resolveConflicts (neighboringChains) {
    let newChain = false
    let maxLength = chain.length
    for (var index = 0; index < neighboringChains.length; ++index) {
      let neighboringChain = neighboringChains[index]
      let length = neighboringChain.length

      if (length > maxLength && this.validChain(neighboringChain)) {
        maxLength = length
        newChain = neighboringChain
      }
    }

    if (newChain) {
      chain = newChain
      // Clear current transactions to reduce possibility to write same transaction in two consecutive blocks
      currentTransactions = []

      return true
    }

    return false
  }

  /**
   * Return blockchain (distributed ledger)
   * 
   * @returns {array} Blockchain
   * @memberof Blockchain
   */
  chain () {
    return chain
  }

  /**
   * Current transactions waiting to be written down in the blockchain
   * 
   * @returns {array} Current transactions
   * @memberof Blockchain
   */
  transactions () {
    return currentTransactions
  }
}

module.exports = Blockchain
