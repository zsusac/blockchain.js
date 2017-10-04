/* global test, expect */

var Blockchain = require('../blockchain.js')
var Miner = require('../miner.js')

test('Initilize blockchain object', () => {
  let blockchain = new Blockchain()
  let lastBlock = blockchain.lastBlock()
  expect(lastBlock.index).toBe(1)
  expect(lastBlock.transactions).toEqual([])
  expect(lastBlock.proof).toBe(100)
  expect(lastBlock.previousHash).toBe(1)
})

test('Initilize multiple blockchain objects', () => {
  let blockchainOne = new Blockchain()
  let lastBlockOne = blockchainOne.lastBlock()
  expect(lastBlockOne.index).toBe(1)
  expect(lastBlockOne.transactions).toEqual([])
  expect(lastBlockOne.proof).toBe(100)
  expect(lastBlockOne.previousHash).toBe(1)

  let blockchainTwo = new Blockchain()
  let lastBlockTwo = blockchainTwo.lastBlock()
  expect(lastBlockTwo.index).toBe(1)
  expect(lastBlockTwo.transactions).toEqual([])
  expect(lastBlockTwo.proof).toBe(100)
  expect(lastBlockTwo.previousHash).toBe(1)

  expect(lastBlockOne).toEqual(lastBlockTwo)
})

test('Create new block in blockchain', () => {
  let blockchain = new Blockchain()
  let newBlock = blockchain.createBlock(100, 'hash')

  let newBlockchain = new Blockchain()
  let lastBlock = newBlockchain.lastBlock()

  expect(newBlock).toEqual(lastBlock)
})

test('Get current transactions', () => {
  let blockchain = new Blockchain()
  let miner = new Miner(blockchain)

  expect(blockchain.transactions()).toEqual([])
  blockchain.addTranstacion('Mark', 'John', 100)
  expect(blockchain.transactions().length).toBe(1)
  blockchain.addTranstacion('John', 'Mark', 100)
  expect(blockchain.transactions().length).toBe(2)
  miner.mine('someAddress')
  expect(blockchain.transactions()).toEqual([])
})
