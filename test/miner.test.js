/* global test, expect */

var Miner = require('../miner.js')
var Blockchain = require('../blockchain.js')

test('Initilize miner and blockchain', () => {
  let blockchain = new Blockchain()
  let miner = new Miner(blockchain)
  let blockOne = miner.mine('someAddress')

  expect(blockOne.index).toBe(2)
  expect(blockOne.transactions.length).toEqual(1)

  let blockTwo = miner.mine('someAddress')
  expect(blockTwo.index).toBe(3)
  expect(blockTwo.transactions.length).toEqual(1)
})

test('Test if blockchain is shared between multiple blockchain object instances', () => {
  let blockchainOne = new Blockchain()
  let minerOne = new Miner(blockchainOne)
  let blockOne = minerOne.mine('someAddress')
  expect(blockOne.index).toBe(4)
  expect(blockOne.transactions.length).toEqual(1)

  let blockchainTwo = new Blockchain()
  let lastBlock = blockchainTwo.lastBlock()
  expect(blockOne).toEqual(lastBlock)
})
