/**
 * Mock peer-to-peer network
 * 
 * Script spawns multiple full nodes and executes mining and transaction actions
 * 
 */

const { spawn } = require('child_process')
const fs = require('fs')

// Full node one
const fullNodeOne = spawn('node', ['nodeServer.js', '--port', '3000', '--walletAddress', 'nodeWalletOne', '--neighbors', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3003', '127.0.0.1:3004'])
fullNodeOne.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})
fullNodeOne.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`)
})
fullNodeOne.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})

// Full node two
const fullNodeTwo = spawn('node', ['nodeServer.js', '--port', '3001', '--walletAddress', 'nodeWalletTwo', '--neighbors', '127.0.0.1:3000', '127.0.0.1:3002', '127.0.0.1:3003', '127.0.0.1:3004'])
fullNodeTwo.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})
fullNodeTwo.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`)
})
fullNodeTwo.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})

// Full node three
const fullNodeThree = spawn('node', ['nodeServer.js', '--port', '3002', '--walletAddress', 'nodeWalletThree', '--neighbors', '127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3003', '127.0.0.1:3004'])
fullNodeThree.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})
fullNodeThree.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`)
})
fullNodeThree.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})

// Full node four
const fullNodeFour = spawn('node', ['nodeServer.js', '--port', '3003', '--walletAddress', 'nodeWalletFour', '--neighbors', '127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3004'])
fullNodeFour.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})
fullNodeFour.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`)
})
fullNodeFour.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})

// Full node five
const fullNodeFive = spawn('node', ['nodeServer.js', '--port', '3004', '--walletAddress', 'nodeWalletFive', '--neighbors', '127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3003'])
fullNodeFive.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})
fullNodeFive.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`)
})
fullNodeFive.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})

setTimeout(() => {
  console.log("Let's go!")
  const spawn = require('child_process').spawnSync
  for (var index = 0; index < 10; index++) {
    // Mock mining
    let mine1 = spawn('curl', [ '127.0.0.1:3000/mine' ])
    console.log(`stderr: ${mine1.stderr.toString()}`)
    console.log(`stdout: ${mine1.stdout.toString()}`)

    // Mock transaction
    let json1 = {
      'sender': Math.random().toString(36).substr(2, 5),
      'recipient': Math.random().toString(36).substr(2, 5),
      'value': Math.floor(Math.random() * (1000 - 1 + 1)) + 1
    }
    let transaction1 = spawn('curl', [
      '-H', 'Content-Type: application/json',
      '-X', 'POST',
      '-d', JSON.stringify(json1),
      'http://127.0.0.1:3001/transaction/new'
    ])
    console.log(`stderr: ${transaction1.stderr.toString()}`)
    console.log(`stdout: ${transaction1.stdout.toString()}`)

    // Mock mining
    let mine2 = spawn('curl', [ '127.0.0.1:3001/mine' ])
    console.log(`stderr: ${mine2.stderr.toString()}`)
    console.log(`stdout: ${mine2.stdout.toString()}`)

    // Mock transaction
    let json2 = {
      'sender': Math.random().toString(36).substr(2, 5),
      'recipient': Math.random().toString(36).substr(2, 5),
      'value': Math.floor(Math.random() * (1000 - 1 + 1)) + 1
    }
    let transaction2 = spawn('curl', [
      '-H', 'Content-Type: application/json',
      '-X', 'POST',
      '-d', JSON.stringify(json2),
      'http://127.0.0.1:3000/transaction/new'
    ])
    console.log(`stderr: ${transaction2.stderr.toString()}`)
    console.log(`stdout: ${transaction2.stdout.toString()}`)

    // Mock transaction
    let json3 = {
      'sender': Math.random().toString(36).substr(2, 5),
      'recipient': Math.random().toString(36).substr(2, 5),
      'value': Math.floor(Math.random() * (1000 - 1 + 1)) + 1
    }
    let transaction3 = spawn('curl', [
      '-H', 'Content-Type: application/json',
      '-X', 'POST',
      '-d', JSON.stringify(json3),
      'http://127.0.0.1:3002/transaction/new'
    ])
    console.log(`stderr: ${transaction3.stderr.toString()}`)
    console.log(`stdout: ${transaction3.stdout.toString()}`)

    // Mock transaction
    let json4 = {
      'sender': Math.random().toString(36).substr(2, 5),
      'recipient': Math.random().toString(36).substr(2, 5),
      'value': Math.floor(Math.random() * (1000 - 1 + 1)) + 1
    }
    let transaction4 = spawn('curl', [
      '-H', 'Content-Type: application/json',
      '-X', 'POST',
      '-d', JSON.stringify(json4),
      'http://127.0.0.1:3002/transaction/new'
    ])
    console.log(`stderr: ${transaction4.stderr.toString()}`)
    console.log(`stdout: ${transaction4.stdout.toString()}`)

    // Mock transaction
    let json5 = {
      'sender': Math.random().toString(36).substr(2, 5),
      'recipient': Math.random().toString(36).substr(2, 5),
      'value': Math.floor(Math.random() * (1000 - 1 + 1)) + 1
    }
    let transaction5 = spawn('curl', [
      '-H', 'Content-Type: application/json',
      '-X', 'POST',
      '-d', JSON.stringify(json5),
      'http://127.0.0.1:3003/transaction/new'
    ])
    console.log(`stderr: ${transaction5.stderr.toString()}`)
    console.log(`stdout: ${transaction5.stdout.toString()}`)
  }
  let blockchain3000 = JSON.parse(fs.readFileSync('blockchain3000.json', 'utf8'))
  let blockchain3001 = JSON.parse(fs.readFileSync('blockchain3001.json', 'utf8'))
  let blockchain3002 = JSON.parse(fs.readFileSync('blockchain3002.json', 'utf8'))
  let blockchain3003 = JSON.parse(fs.readFileSync('blockchain3003.json', 'utf8'))
  let blockchain3004 = JSON.parse(fs.readFileSync('blockchain3004.json', 'utf8'))
  console.log('Network reflects the same blockchain? ',
    JSON.stringify(blockchain3000) === JSON.stringify(blockchain3001) &&
    JSON.stringify(blockchain3000) === JSON.stringify(blockchain3002) &&
    JSON.stringify(blockchain3000) === JSON.stringify(blockchain3003) &&
    JSON.stringify(blockchain3000) === JSON.stringify(blockchain3004)
  )
}, 5000)
