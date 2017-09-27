/**
 * Miner implementation
 * 
 * @class Miner
 */
class Miner {
  /**
   * Creates an instance of Miner.
   * 
   * @param {Blockchain} blockchain Blockchain instance
   * @memberof Miner
   */
  constructor (blockchain) {
    this.blockchain = blockchain
  }

  /**
   * Mine
   * 
   * @returns {Block} Mined block 
   * @memberof Miner
   */
  mine () {
    let lastBlock = this.blockchain.lastBlock()
    let lastProof = lastBlock.proof
    let proof = this.blockchain.proofOfWork(lastProof)
    this.blockchain.addTranstacion(0, 'me', 1)

    return this.blockchain.createBlock(proof)
  }
}

module.exports = Miner
