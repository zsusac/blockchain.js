[![Build Status](https://travis-ci.org/zsusac/blockchain.js.svg?branch=master)](https://travis-ci.org/zsusac/blockchain.js)
[![Coverage Status](https://coveralls.io/repos/github/zsusac/blockchain.js/badge.svg?branch=master)](https://coveralls.io/github/zsusac/blockchain.js?branch=master)

# Introduction
This repository implements simple blockchain using javascript programming language. It is inspired by following [article](https://hackernoon.com/learn-blockchains-by-building-one-117428612f46)

# Modules

## blockchain.js
Contains Blockchain class that represents blockchain. Every instance of the class share same blockchain.

## block.js
Contains Block class which is template for block objects.

## blockFactory.js
Used for creating new block objects.

## miner.js
Used for mining provided blockchain. It solves simple Proof Of Work algorithm in order to create a new block.

# Proof of Work algorithm
Blockchain implements basic Proof of Work algorithm. Miners need to find a number that, when hashed with the previous block’s solution (proof), creates a hash with 4 leading 0s ('0000').  
Blockchain class methods *proofOfWork* and *validProof* implements Proof of Work algorithm.

# Consensus algorithm
Consensus algorithm ensures that all nodes in decentralized network reflect the same blockchain. Rule of Consensus algorithm is that the longest valid chain is authoritative.

# Tests
```
npm run test
```
