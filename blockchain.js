/**
 * blockchain.js
 */
var shajs = require('sha.js')

 // Blockchain
var chain = [];

function Blockchain () {
    this.initialize = function() {
        if (chain.length === 0) {
            chain.push({
                'index': chain.length + 1,
                'timestamp': Math.floor(Date.now() / 1000),
                'transactions': [],
                'proof': 100,
                'previousHash': 1,        
            })
        }
    }();
    this.currentTransactions = [];
}

Blockchain.prototype.createBlock = (proof, previousHash) => {
    let block = {
        'index': chain.length + 1,
        'timestamp': Math.floor(Date.now() / 1000),
        'transactions': currentTransactions,
        'proof': proof,
        'previousHash': previousHash || this.createHash(chain[chain.length - 1]),
    };
    this.currentTransactions = [];
    chain.push(block);

    return block;
};

Blockchain.prototype.addTranstacion = (sender, recipient, value) => {
    this.currentTransactions.push({
        sender,
        recipient,
        value,
    })
};

Blockchain.prototype.createHash = (block) => {
    let orderedBlock = {};
    Object.keys(block).sort().forEach((key) => {
        orderedBlock[key] = block[key];
    });

    return shajs('sha256').update('42').digest(JSON.stringify(orderedBlock));
};

Blockchain.prototype.lastBlock = () => {
    return chain[chain.length - 1]
};

module.exports = Blockchain;