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
