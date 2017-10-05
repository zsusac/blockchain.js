/**
 * Mock peer-to-peer network
 * 
 * Script spawns multiple full nodes and executes mining and transaction actions
 * 
 */

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

  console.log('\n Comparing blockchains... \n')
  setTimeout(() => {
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
    process.exit()
  }, 5000)
}, 5000)
