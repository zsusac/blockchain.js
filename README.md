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

# Example
Create http server to expose our blockchain  

```javascript
var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')
var Blockchain = require('../index.js').Blockchain
var Miner = require('../index.js').Miner

const argv = require('yargs').array('neighbors').argv
const help = require('yargs')
  .option('port', {
    alias: 'p',
    describe: 'Node port'
  })
  .option('neighbors', {
    alias: 'n',
    describe: 'Node neighbors'
  })
  .demandOption(['port', 'neighbors'], 'Please provide port and neighbors arguments')
  .help()
  .argv

var blockchain = new Blockchain()
var miner = new Miner(blockchain)
var app = express()
app.use(bodyParser.json())

app.listen(argv.port, () => {
  console.log(`Blockchain Node Server started at 127.0.0.1:${argv.port}`)
})

app.get('/', (req, res) => {
  res.json(
    {
      'links': [
        {
          'rel': 'self',
          'href': `127.0.0.1:${argv.port}`
        },
        {
          'rel': 'chain',
          'href': `127.0.0.1:${argv.port}/chain`
        },
        {
          'rel': 'mine',
          'href': `127.0.0.1:${argv.port}/mine`
        },
        {
          'rel': 'neighbors',
          'href': `127.0.0.1:${argv.port}/neighbors`
        },
        {
          'rel': 'notify',
          'href': `127.0.0.1:${argv.port}/notify`
        }
      ]
    }
  )
})

// Return current blockchain
app.get('/chain', (req, res) => {
  res.json(
    {
      'chain': blockchain.chain(),
      'links': [
        {
          'rel': 'self',
          'href': `127.0.0.1:${argv.port}/chain`
        },
        {
          'rel': 'root',
          'href': `127.0.0.1:${argv.port}`
        }
      ]
    }
  )
})

// Mine new block
app.get('/mine', (req, res, next) => {
  // Broadcast block to neighbors
  res.on('finish', () => {
    broadcast()
  })

  res.json(
    {
      'block': miner.mine(),
      'links': [
        {
          'rel': 'self',
          'href': `127.0.0.1:${argv.port}/mine`
        },
        {
          'rel': 'root',
          'href': `127.0.0.1:${argv.port}`
        }
      ]
    }
  )
})

// Return list of neighboring blockchains
app.get('/neighbors', (req, res) => {
  res.json(
    {
      'neighbors': argv.neighbors,
      'links': [
        {
          'rel': 'self',
          'href': `127.0.0.1:${argv.port}/neighbors`
        },
        {
          'rel': 'root',
          'href': `127.0.0.1:${argv.port}`
        }
      ]
    }
  )
})

// Receive broadcasted block
app.post('/notify', (req, res) => {
  let remoteBlock = req.body
  let lastBlock = blockchain.lastBlock()
  if (remoteBlock.index > lastBlock.index) {
    request(req.headers.nodeblockchain, (error, response, body) => {
      console.log('error:', error)
      let json = JSON.parse(body)
      blockchain.resolveConflicts([json.chain])
    })
  }

  res.sendStatus(200)
})

// Send new block to all neighbors
var broadcast = () => {
  argv.neighbors.forEach((node, index) => {
    request.post(
      'http://' + node + '/notify',
      {
        json: blockchain.lastBlock(),
        headers: {
          nodeBlockchain: `http://127.0.0.1:${argv.port}/chain`
        }
      },
      function (error, response, body) {
        if (error) {
          console.log('error', error)
        }
      }
    )
  })
}
```

Run two instances of blockchain node severs on localhost and different port  

[Terminal Window 1]
```
$ node nodeServer.js --port 3000 --neighbors 127.0.0.1:3001
Blockchain Node Server started at 127.0.0.1:3000
```

[Terminal Window 2]
```
$ node nodeServer.js --port 3001 --neighbors 127.0.0.1:3000
Blockchain Node Server started at 127.0.0.1:3001
```

When a node generates a new block, it broadcasts it to the neighbors. Neighbors then replace their local blockchain with longest blockchain in the network.

[Terminal Window 3]
```
$ curl http://127.0.0.1:3000/mine
{"block":{"index":2,"timestamp":1506944085760,"transactions":[{"sender":0,"recipient":"me","value":1}],"proof":35293,"previousHash":"50777cbc3f3d232a5be6a7de00699edb97f3a0fa399ee16a191387f3ea001af1"},"links":[{"rel":"self","href":"127.0.0.1:3000/mine"},{"rel":"root","href":"127.0.0.1:3000"}]}

$ curl http://127.0.0.1:3000/chain
{"chain":[{"index":1,"timestamp":1506944064254,"transactions":[],"proof":100,"previousHash":1},{"index":2,"timestamp":1506944085760,"transactions":[{"sender":0,"recipient":"me","value":1}],"proof":35293,"previousHash":"50777cbc3f3d232a5be6a7de00699edb97f3a0fa399ee16a191387f3ea001af1"}],"links":[{"rel":"self","href":"127.0.0.1:3000/chain"},{"rel":"root","href":"127.0.0.1:3000"}]}
  
$ curl http://127.0.0.1:3001/chain
{"chain":[{"index":1,"timestamp":1506944064254,"transactions":[],"proof":100,"previousHash":1},{"index":2,"timestamp":1506944085760,"transactions":[{"sender":0,"recipient":"me","value":1}],"proof":35293,"previousHash":"50777cbc3f3d232a5be6a7de00699edb97f3a0fa399ee16a191387f3ea001af1"}],"links":[{"rel":"self","href":"127.0.0.1:3001/chain"},{"rel":"root","href":"127.0.0.1:3001"}]}
```

Executing previous commands, we see that blockchains in the peer to peer network are synchronized.
  
# Tests
```
npm run test
```
