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

// Create new transaction and notify all neighbors (broadcast transaction)
app.post('/transaction/new', (req, res) => {
  let newTransaction = req.body
  console.log(newTransaction)
  if (newTransaction.sender !== undefined && newTransaction.recipient !== undefined && newTransaction.value !== undefined) {
    blockchain.addTranstacion(newTransaction.sender, newTransaction.recipient, newTransaction.value)
    broadcastTransaction(newTransaction)

    return res.sendStatus(200)
  }

  return res.sendStatus(400)
})

// Add broadcasted transaction to the blockchain
app.post('/transaction/add', (req, res) => {
  let broadcastedTransaction = req.body
  console.log(broadcastedTransaction)
  if (broadcastedTransaction.sender !== undefined && broadcastedTransaction.recipient !== undefined && broadcastedTransaction.value !== undefined) {    
    blockchain.addTranstacion(broadcastedTransaction.sender, broadcastedTransaction.recipient, broadcastedTransaction.value)

    return res.sendStatus(200)
  }

  return res.sendStatus(400)
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
    // Get blockchain from node that broadcasted new block
    request(req.headers.broadcastorigin, (error, response, body) => {
      console.log('error:', error)
      let json = JSON.parse(body)
      blockchain.resolveConflicts([json.chain])
    })
  }

  return res.sendStatus(200)
})

// Send new block to all neighbors
var broadcast = () => {
  argv.neighbors.forEach((node, index) => {
    request.post(
      'http://' + node + '/notify',
      {
        json: blockchain.lastBlock(),
        // Set address of node that broadcasted block
        headers: {
          broadcastorigin: `http://127.0.0.1:${argv.port}/chain`
        }
      },
      (error, response, body) => {
        if (error) {
          console.log('error', error)
          console.log('body', body)
        }
      }
    )
  })
}

var broadcastTransaction = (transaction) => {
  argv.neighbors.forEach((node, index) => {
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
