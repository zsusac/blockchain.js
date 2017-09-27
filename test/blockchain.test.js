/* global test, expect */

var Blockchain = require('../blockchain.js')

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
