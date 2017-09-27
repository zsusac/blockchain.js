/**
 * Block implementation
 * 
 * @class Block
 */
class Block {
  /**
   * Creates an instance of Block.
   * 
   * @param {any} index Block index
   * @param {any} transactions Transatcions
   * @param {any} proof Proof
   * @param {any} previousHash Previous blockchain hash
   * @memberof Block
   */
  constructor (index, transactions, proof, previousHash) {
    this.index = index
    this.timestamp = Math.floor(Date.now() / 1000)
    this.transactions = transactions
    this.proof = proof
    this.previousHash = previousHash
  }
}

module.exports = Block
