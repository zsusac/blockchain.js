var Block = require('./block.js')

/**
 * BlockFactory creates block objects
 * 
 * @param {any} index Block index
 * @param {any} transactions Transatcions
 * @param {any} proof Proof
 * @param {any} previousHash Previous blockchain hash
 * @returns {Block} Block object
 */
function BlockFactory (index, transactions, proof, previousHash) {
  return new Block(index, transactions, proof, previousHash)
}

module.exports = BlockFactory
