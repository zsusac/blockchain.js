[![Build Status](https://travis-ci.org/zsusac/blockchain.js.svg?branch=master)](https://travis-ci.org/zsusac/blockchain.js)
[![Coverage Status](https://coveralls.io/repos/github/zsusac/blockchain.js/badge.svg?branch=master)](https://coveralls.io/github/zsusac/blockchain.js?branch=master)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

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

# Full Node Example
Create a server with REST service to expose blockchain over HTTP protocol. Every instance of this server represents a full node. Full nodes can mine new blocks and receive new transactions. New blocks and transactions are bradcasted to neighboring full nodes. Full nodes use *Consensus algorithm* to replicate distributed ledger (blockchain). 

```javascript
var express = require('express')
var request = require('request')
var jsonfile = require('jsonfile')
var bodyParser = require('body-parser')
var Blockchain = require('../index.js').Blockchain
var Miner = require('../index.js').Miner

// Define command arguments and help message
const argv = require('yargs').array('neighbors').argv
const help = require('yargs')
  .option('port', {
    alias: 'p',
    describe: 'Node port'
  })
  .option('walletAddress', {
    alias: 'w',
    describe: 'Wallet address'
  })
  .option('neighbors', {
    alias: 'n',
    describe: 'Node neighbors'
  })
  .demandOption(['port', 'walletAddress', 'neighbors'], 'Please provide port, wallet address and neighbors arguments')
  .help()
  .argv

// Get neighbors from command argument
var neighbors = argv.neighbors
// Miner's wallet address
var walletAddress = argv.walletAddress

// Define blockchain file
var file = `./blockchain${argv.port}.json`

// Instantiate blockchain object
var blockchain = new Blockchain()

// Write blockchain to file function
var writeToFile = () => {
  jsonfile.writeFile(file, blockchain.chain(), function (err) {
    if (err) {
      console.error(err)
    }
  })
}

// Write blockchain with genesis block (first block) to file
writeToFile()

// Instantiate miner object
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
          'rel': 'transaction_new',
          'href': `127.0.0.1:${argv.port}/transaction/new`
        },
        {
          'rel': 'transaction_add',
          'href': `127.0.0.1:${argv.port}/transaction/add`
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
          'rel': 'neighbors_add',
          'href': `127.0.0.1:${argv.port}/neighbors/add`
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
      'block': miner.mine(walletAddress),
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

// Create new transaction and notify all neighbors (broadcast transaction)
app.post('/transaction/new', (req, res) => {
  let newTransaction = req.body
  if (newTransaction.sender !== undefined && newTransaction.recipient !== undefined && newTransaction.value !== undefined) {
    blockchain.addTranstacion(newTransaction.sender, newTransaction.recipient, newTransaction.value)
    broadcastTransaction(newTransaction)

    return res.json(
      {
        'transactions': blockchain.transactions(),
        'links': [
          {
            'rel': 'self',
            'href': `127.0.0.1:${argv.port}/transaction/new/`
          },
          {
            'rel': 'root',
            'href': `127.0.0.1:${argv.port}`
          }
        ]
      }
    )
  }

  return res.sendStatus(400)
})

// Add broadcasted transaction to the blockchain
app.post('/transaction/add', (req, res) => {
  let broadcastedTransaction = req.body
  if (broadcastedTransaction.sender !== undefined && broadcastedTransaction.recipient !== undefined && broadcastedTransaction.value !== undefined) {    
    blockchain.addTranstacion(broadcastedTransaction.sender, broadcastedTransaction.recipient, broadcastedTransaction.value)

    return res.json(
      {
        'transactions': blockchain.transactions(),
        'links': [
          {
            'rel': 'self',
            'href': `127.0.0.1:${argv.port}/transaction/add/`
          },
          {
            'rel': 'root',
            'href': `127.0.0.1:${argv.port}`
          }
        ]
      }
    )
  }

  return res.sendStatus(400)
})

// Return list of neighboring blockchains
app.get('/neighbors', (req, res) => {
  res.json(
    {
      'neighbors': neighbors,
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

// Add new neighbor
app.post('/neighbors/add', (req, res) => {
  let newNeighbors = req.body
  if (newNeighbors.neighbors !== undefined && newNeighbors.neighbors.constructor === Array) {
    newNeighbors.neighbors.forEach(newNeighbor => {
      neighbors.push(newNeighbor)
    })
  }

  res.json(
    {
      'neighbors': neighbors,
      'links': [
        {
          'rel': 'self',
          'href': `127.0.0.1:${argv.port}/neighbors/add`
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
    res.on('finish', () => {
      synchronize(req.headers.broadcastorigin)
    })
  }

  return res.sendStatus(200)
})

// Fetch neighbor blockchain and check consensus
var synchronize = (remoteBlockchain) => {
  request(remoteBlockchain, (error, response, body) => {
    if (error) {
      console.log('error', error)
    }

    let json = JSON.parse(body)

    // Write new blockchain to the file
    if (blockchain.resolveConflicts([json.chain])) {
      writeToFile()
    }
  })
}

// Send new block to all neighbors
var broadcast = () => {
  neighbors.forEach((node, index) => {
    request.post(
      'http://' + node + '/notify',
      {
        json: blockchain.lastBlock(),
        // Set address of node that broadcasted new block
        headers: {
          broadcastorigin: `http://127.0.0.1:${argv.port}/chain`
        }
      },
      (error, response, body) => {
        if (error) {
          console.log('error', error)
        }
      }
    )
  })
  // Write blockchain with the new block to the file
  writeToFile()
}

// Send transaction to all neighbors
var broadcastTransaction = (transaction) => {
  neighbors.forEach((node, index) => {
    request.post(
      'http://' + node + '/transaction/add',
      { json: transaction },
      (error, response, body) => {
        if (error) {
          console.log('error', error)
        }
      }
    )
  })
}
```

Run two instances of blockchain node severs on localhost and different ports

[Terminal Window 1]
```
$ node nodeServer.js --port 3000 --walletAddress minersWalletOne --neighbors 127.0.0.1:3001
Blockchain Node Server started at 127.0.0.1:3000
```

[Terminal Window 2]
```
$ node nodeServer.js --port 3001 --walletAddress minersWalletTwo --neighbors 127.0.0.1:3000
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

[Terminal Window 3]
```
$ curl -H "Content-Type: application/json" -X POST -d '{"sender": "Mark","recipient": "John","value": 100}' http://127.0.0.1:3000/transaction/new
{"transactions":[{"sender":"Mark","recipient":"John","value":100}],"links":[{"rel":"self","href":"127.0.0.1:3000/transaction/new/"},{"rel":"root","href":"127.0.0.1:3000"}]}

$ curl -H "Content-Type: application/json" -X POST -d '{"sender": "John","recipient": "Mark","value": 50}' http://127.0.0.1:3001/transaction/new
{"transactions":[{"sender":"Mark","recipient":"John","value":100},{"sender":"John","recipient":"Mark","value":50}],"links":[{"rel":"self","href":"127.0.0.1:3001/transaction/new/"},{"rel":"root","href":"127.0.0.1:3001"}]}

$ curl http://127.0.0.1:3000/mine
{"block":{"index":2,"timestamp":1506966870878,"transactions":[{"sender":"Mark","recipient":"John","value":100},{"sender":"John","recipient":"Mark","value":50},{"sender":0,"recipient":"me","value":1}],"proof":35293,"previousHash":"782134ab9e021aaf7ff370b2a149a1d82fd87b44b5374d7ccea51a9cb3755365"},"links":[{"rel":"self","href":"127.0.0.1:3000/mine"},{"rel":"root","href":"127.0.0.1:3000"}]}

$ curl http://127.0.0.1:3001/chain
{"chain":[{"index":1,"timestamp":1506966743710,"transactions":[],"proof":100,"previousHash":1},{"index":2,"timestamp":1506966870878,"transactions":[{"sender":"Mark","recipient":"John","value":100},{"sender":"John","recipient":"Mark","value":50},{"sender":0,"recipient":"me","value":1}],"proof":35293,"previousHash":"782134ab9e021aaf7ff370b2a149a1d82fd87b44b5374d7ccea51a9cb3755365"}],"links":[{"rel":"self","href":"127.0.0.1:3001/chain"},{"rel":"root","href":"127.0.0.1:3001"}]}

$ curl http://127.0.0.1:3000/chain
{"chain":[{"index":1,"timestamp":1506966743710,"transactions":[],"proof":100,"previousHash":1},{"index":2,"timestamp":1506966870878,"transactions":[{"sender":"Mark","recipient":"John","value":100},{"sender":"John","recipient":"Mark","value":50},{"sender":0,"recipient":"me","value":1}],"proof":35293,"previousHash":"782134ab9e021aaf7ff370b2a149a1d82fd87b44b5374d7ccea51a9cb3755365"}],"links":[{"rel":"self","href":"127.0.0.1:3000/chain"},{"rel":"root","href":"127.0.0.1:3000"}]}
```

Every new transaction is added to the local blockchain and broadcasted to the neighbor nodes. Node that first creates a new block, writes down current transactions in that block. You can see how that works by executing previous commands.  

# Peer-To-Peer Network Example
This script spawns multiple full node servers to mimic real peer-to-peer network, and then executes mining and transaction actions on random nodes.
At the end, script compares distributed ledgers (blockchains) to test if network reflects the same ledger (blockchain).

```javascript
const { spawn } = require('child_process')
const fs = require('fs')

const argv = require('yargs').number('blocks').argv
const help = require('yargs')
  .option('blocks', {
    alias: 'n',
    describe: 'Number of blocks to mine'
  })
  .demandOption(['blocks'], 'Please provide number of blocks mine')
  .help()
  .argv
var blocks = argv.blocks || argv.n

let fullNodes = [
  {
    instance: null,
    name: 'Full Node One',
    args: ['nodeServer.js', '--port', '3000', '--walletAddress', 'nodeWalletOne', '--neighbors', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3003', '127.0.0.1:3004'],
    mine: '127.0.0.1:3000/mine',
    transaction: 'http://127.0.0.1:3000/transaction/new'
  },
  {
    instance: null,
    name: 'Full Node Two',
    args: ['nodeServer.js', '--port', '3001', '--walletAddress', 'nodeWalletTwo', '--neighbors', '127.0.0.1:3000', '127.0.0.1:3002', '127.0.0.1:3003', '127.0.0.1:3004'],
    mine: '127.0.0.1:3001/mine',
    transaction: 'http://127.0.0.1:3001/transaction/new'
  },
  {
    instance: null,
    name: 'Full Node Three',
    args: ['nodeServer.js', '--port', '3002', '--walletAddress', 'nodeWalletThree', '--neighbors', '127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3003', '127.0.0.1:3004'],
    mine: '127.0.0.1:3002/mine',
    transaction: 'http://127.0.0.1:3002/transaction/new'
  },
  {
    instance: null,
    name: 'Full Node Four',
    args: ['nodeServer.js', '--port', '3003', '--walletAddress', 'nodeWalletFour', '--neighbors', '127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3004'],
    mine: '127.0.0.1:3003/mine',
    transaction: 'http://127.0.0.1:3003/transaction/new'
  },
  {
    instance: null,
    name: 'Full Node Five',
    args: ['nodeServer.js', '--port', '3004', '--walletAddress', 'nodeWalletFive', '--neighbors', '127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3003'],
    mine: '127.0.0.1:3004/mine',
    transaction: 'http://127.0.0.1:3004/transaction/new'
  }
]

console.log('Initialize Peer-To-Peer network of full nodes \n')

fullNodes.forEach(node => {
  node.instance = spawn('node', node.args)
  node.instance.stdout.on('data', (data) => {
    console.log(`${node.name} stdout: ${data}`)
  })
  node.instance.stderr.on('data', (data) => {
    console.log(`${node.name} stderr: ${data}`)
  })
  node.instance.on('close', (code) => {
    console.log(`${node.name} child process exited with code ${code}`)
  })
})

var generateTransaction = () => {
  return {
    'sender': Math.random().toString(36).substr(2, 5),
    'recipient': Math.random().toString(36).substr(2, 5),
    'value': Math.floor(Math.random() * (1000 - 1 + 1)) + 1
  }
}

setTimeout(() => {
  console.log('Start with network testing \n')
  const spawn = require('child_process').spawnSync
  for (var index = 0; index < blocks; index++) {
    // Make five transactions
    fullNodes.forEach(node => {
      // Make new transaction on random node
      let randomNode = fullNodes[Math.floor(Math.random() * fullNodes.length)]
      let transaction = spawn('curl', [
        '-H', 'Content-Type: application/json',
        '-X', 'POST',
        '-d', JSON.stringify(generateTransaction()),
        randomNode.transaction
      ])
      console.log(`New Transaction ${randomNode.name} stderr: ${transaction.stderr.toString()}`)
      console.log(`New Transaction ${randomNode.name} stdout: ${transaction.stdout.toString()}`)
    })

    // Mine new block on random node
    let randomNode = fullNodes[Math.floor(Math.random() * fullNodes.length)]
    let mine = spawn('curl', [ randomNode.mine ])
    console.log(`Mine ${randomNode.name} stderr: ${mine.stderr.toString()}`)
    console.log(`Mine ${randomNode.name} stdout: ${mine.stdout.toString()}`)
  }

  // Compare distributed ledgers (blockchains)
  let blockchain3000 = JSON.parse(fs.readFileSync('blockchain3000.json', 'utf8'))
  let blockchain3001 = JSON.parse(fs.readFileSync('blockchain3001.json', 'utf8'))
  let blockchain3002 = JSON.parse(fs.readFileSync('blockchain3002.json', 'utf8'))
  let blockchain3003 = JSON.parse(fs.readFileSync('blockchain3003.json', 'utf8'))
  let blockchain3004 = JSON.parse(fs.readFileSync('blockchain3004.json', 'utf8'))
  console.log('Peer-to-Peer Network reflects the same blockchain? ',
    JSON.stringify(blockchain3000) === JSON.stringify(blockchain3001) &&
    JSON.stringify(blockchain3000) === JSON.stringify(blockchain3002) &&
    JSON.stringify(blockchain3000) === JSON.stringify(blockchain3003) &&
    JSON.stringify(blockchain3000) === JSON.stringify(blockchain3004)
  )
}, 5000)
```
# Tests
```
npm run test
```
