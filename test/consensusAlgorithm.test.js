/* global test, expect, beforeEach, jest */

var Miner = require('../miner.js')

// Mock neighbour nodes
var chainOne = []
var chainTwo = []
var chainThree = []

beforeEach(() => {
  // Reset blockchain between tests
  jest.resetModules()
})

// The longest valid chain is authoritative
test('Test the longest blockchain', () => {
  var Blockchain = require('../blockchain.js')
  let blockchain = new Blockchain()
  let miner = new Miner(blockchain)
  miner.mine('someAddress')

  // Neighbour Node one blockchain (copy of blockchain at this moment)
  chainOne = JSON.parse(JSON.stringify(blockchain.chain()))

  miner.mine('someAddress')

  // Neighbour Node two blockchain (copy of blockchain at this moment)
  chainTwo = JSON.parse(JSON.stringify(blockchain.chain()))

  miner.mine('someAddress')

  // Neighbour Node three blockchain (copy of blockchain at this moment)
  chainThree = JSON.parse(JSON.stringify(blockchain.chain()))

  // Create new block to have blockchain longer than the blockchain from neighbours nodes
  miner.mine('someAddress')
  const neighboringChains = [chainOne, chainTwo, chainThree]

  expect(blockchain.resolveConflicts(neighboringChains)).toBe(false)
})

// The longest valid chain is authoritative
test('Test the neighbour longest blockchain', () => {
  var Blockchain = require('../blockchain.js')
  let blockchain = new Blockchain()

  const neighboringChains = [chainOne, chainTwo, chainThree]

  expect(blockchain.resolveConflicts(neighboringChains)).toBe(true)
})

test('Test chain validation', () => {
  var Blockchain = require('../blockchain.js')
  let blockchain = new Blockchain()
  let miner = new Miner(blockchain)
  miner.mine('someAddress')

  const invalidChain = chainOne.concat(chainTwo)
  const neighboringChains = [invalidChain]

  expect(blockchain.resolveConflicts(neighboringChains)).toBe(false)
})

test('Test previous hash validation', () => {
  var Blockchain = require('../blockchain.js')
  let blockchain = new Blockchain()
  let miner = new Miner(blockchain)
  miner.mine('someAddress')

  // Change hash (invalid chain)
  chainTwo[0].previousHash = chainTwo[2].previousHash
  const invalidChain = chainOne.concat(chainTwo)
  const neighboringChains = [invalidChain]

  expect(blockchain.resolveConflicts(neighboringChains)).toBe(false)
})
