/**
 * 
 */

var Blockchain = require('../blockchain.js');

test('Initilize blockchain', () => {
    let blockchain = new Blockchain();
    let lastBlock = blockchain.lastBlock();
    expect(lastBlock.index).toBe(1);
    expect(lastBlock.transactions).toEqual([]);
    expect(lastBlock.proof).toBe(100);    
    expect(lastBlock.previousHash).toBe(1);
});