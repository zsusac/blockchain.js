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
