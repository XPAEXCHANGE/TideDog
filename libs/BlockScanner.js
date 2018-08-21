const path = require('path');

const dvalue = require('dvalue');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));

class BlockScanner extends Bot {
  constructor() {
    super();
    this.name = path.parse(__filename).base.replace(/.js$/, '');
    this.tracable = true;
  }

  start() {
    this.currentBlock = (this.config.argv.from - 1);
    this.only = this.config.argv.only || -1;
    this.freezeIndex = this.only > -1;
    return super.start()
    .then(() => this.scan())
    .catch(this.logger.trace)
    .then(() => this);
  }

  scan() {
    return this.fetchNextBlock();
  }

  fetchNextBlock() {
    if(this.only == 0) {
      return Promise.resolve();
    }

    // 0. get start block
    // 1. get block info and transaction list
    // 2. write block
    // 3. get transaction
    // 4. write transaction
    // 5. get receipt
    // 6. write receipt
    // 6.1 write events
    // 6.2 get internal transaction
    // 6.3 write internal transactions
    // 7. put BlockNumber
    // 8. again

    this.initialRound = new Date().getTime();
    return Utils.retryPromise(this.getCurrentBlock, [], 3, this)
    .then((block) => { return { block: block + 1 }; })
    .then((block) => { return this.getBlock(block); })
    .then((block) => { return this.putBlock(block); })
    .then((block) => { return this.fetchTransactions(block); })
    .then((block) => { return this.finishCurrentBlock(block); })
    .then(() => this.fetchNextBlock())
    .catch((e) => new Promise((resolve, reject) => {
      if(e) {
        this.logger.trace(e);
      }
      setTimeout(() => {
        this.fetchNextBlock()
        .then(resolve, reject);
      }, 5000);
    }));
  }

  getCurrentBlock() {
    if(this.currentBlock >= -1) {
      return Promise.resolve(this.currentBlock);
    } else {
      return this.database.leveldb.get('BlockNumber')
      .then((block) => parseInt(block))
      .then((block) => this.BlockNumber = block > -1 ? block : -1)
      .catch((e) => -1)
    }
  }

  finishCurrentBlock({ block }) {
    const blockNumber = parseInt(block.number);
    const timeCost = Utils.parseTime(this.initialRound);
    const txs = (block.transactions.length) + (block.transactions.length > 1 ? ' TXs' : ' TX');
    this.currentBlock ++;
    if(this.only > 0) { this.only--; }
    this.logger.log(`\x1b[1m\x1b[35mend of Block\x1b[0m\x1b[21m ${blockNumber} | ${timeCost} | ${txs}`);
    return this.freezeIndex ?
      Promise.resolve(block) :
      this.database.leveldb.put('BlockNumber', blockNumber)
      .then(() => block);
  }

  getBlock({ block }) {
    const type = 'block';
    const options = dvalue.clone(this.config.blockchain);
    options.data = this.constructor.cmd({ type, block });
    return Utils.ETHRPC(options)
    .then((data) => {
      if(data.result instanceof Object) {
        const block = data.result;
        block.number = parseInt(block.number);
        block.timestamp = parseInt(block.timestamp);
        return Promise.resolve({ block });
      } else {
        this.logger.log(`\x1b[1m\x1b[90mblock not found\x1b[0m\x1b[21m ${block}`);
        return Promise.reject()
      }
    });
  }

  putBlock({ block }) {
    this.logger.debug(`\x1b[1m\x1b[32mBlock\x1b[0m\x1b[21m ${block.hash}`);

    const mongodb = this.database.mongodb;
    const leveldb = this.database.leveldb;
    const tableName = `${this.config.database.prefix}Blocks`;
    const condition = { hash: block.hash };

    return mongodb ?
      new Promise((resolve, reject) => {
        mongodb.collection(tableName).update(
          condition,
          block,
          { upsert: true },
          (e, d) => {
            if(e) {
              reject(e);
            } else {
              resolve({ block });
            }
          }
      )}) :
      leveldb.put(`block.${block.hash}`, JSON.stringify(block))
      .then(() => Promise.resolve({ block }));
  }

  fetchTransactions({ block }) {
    const txHashes = block.transactions;
    const timestamp = block.timestamp;
    /*
    return txHashes.reduce((prev, curr) => {
      return prev.then((list) => 
        this.getTransaction({ txHash: curr })
        .then((tx) => {
          const newTx = tx;
          newTx.timestamp = timestamp;
          // list.push(newTx);
          return this.putTransaction({ transaction: newTx })
          .then(() => Promise.resolve(list));
        })
      );
    }, Promise.resolve([]))
    */
    return Promise.all(txHashes.map((v) => {
      return Promise.all([
        this.getTransaction({ txHash: v }),
        this.getReceipt({ txHash: v })
      ])
      .then(([ tx, receipt ]) => {
        const newReceipt = receipt;
        const newTransaction = tx;
        newReceipt.timestamp = timestamp;
        newReceipt.blockNumber = parseInt(receipt.blockNumber);
        newTransaction.timestamp = timestamp;
        newTransaction.blockNumber = parseInt(receipt.blockNumber);
        return Promise.all([
          this.putTransaction({ transaction: newTransaction }),
          this.putReceipt({ transaction: newTransaction, receipt: newReceipt })
        ]);
      })
    }))
    .then(() => Promise.resolve({ block }));
  }

  getReceipt({ txHash }) {
    const type = 'receipt';
    const options = dvalue.clone(this.config.blockchain);
    options.data = this.constructor.cmd({ type, txHash });
    return Utils.ETHRPC(options)
    .then((data) => {
      if(data.result instanceof Object) {
        return Promise.resolve(data.result);
      } else {
        this.logger.log(`\x1b[1m\x1b[90mreceipt not found\x1b[0m\x1b[21m ${txHash}`);
        return Promise.reject();
      }
    });
  }

  getTransaction({ txHash }) {
    const type = 'transaction';
    const options = dvalue.clone(this.config.blockchain);
    options.data = this.constructor.cmd({ type, txHash });
    return Utils.ETHRPC(options)
    .then((data) => {
      if(data.result instanceof Object) {
        return Promise.resolve(data.result);
      } else {
        this.logger.log(`\x1b[1m\x1b[90mtransaction not found\x1b[0m\x1b[21m ${txHash}`);
        return Promise.reject();
      }
    });
  }  

  getContract({ address }) {
    const type = 'contract';
    const options = dvalue.clone(this.config.blockchain);
    options.data = this.constructor.cmd({ type, address });
    return Utils.ETHRPC(options)
    .then((data) => {
      if(!!data.result) {
        return Promise.resolve(data.result);
      } else {
        this.logger.log(`\x1b[1m\x1b[90mcontract not found\x1b[0m\x1b[21m ${address}`);
        return Promise.reject();
      }
    });
  }

  putTransaction({ transaction }) {
    this.logger.debug(`\x1b[1m\x1b[32mTransaction\x1b[0m\x1b[21m ${transaction.hash}`);

    const condition = { hash: transaction.hash };
    const mongodb = this.database.mongodb;
    const leveldb = this.database.leveldb;
    const tableName = `${this.config.database.prefix}Transactions`;
    return mongodb ? 
      new Promise((resolve, reject) => {
        mongodb.collection(tableName).update(
          condition,
          transaction,
          { upsert: true },
          (e, d) => {
            if(e) {
              reject(e);
            } else {
              resolve({ transaction });
            }
          }
      )}) :
      leveldb.put(`Transactions.${transaction.hash}`, JSON.stringify(transaction))
      .then(() => Promise.resolve({ transaction }));
  }

  putReceipt({ transaction, receipt }) {
    this.logger.debug(`\x1b[1m\x1b[32mReceipt\x1b[0m\x1b[21m ${receipt.transactionHash}`);

    const condition = { transactionHash: receipt.transactionHash };
    const mongodb = this.database.mongodb;
    const leveldb = this.database.leveldb;
    const tableName = `${this.config.database.prefix}Receipts`;
    return Promise.all([
      this.putEvent(receipt),
      this.putContract({ transaction, receipt }),
      this.putInternalTranction(receipt)
    ]).then(() => {
      return mongodb ? 
        new Promise((resolve, reject) => {
          mongodb.collection(tableName).update(
            condition,
            receipt,
            { upsert: true },
            (e, d) => {
              if(e) {
                reject(e);
              } else {
                resolve({ receipt });
              }
            }
        )}) :
        leveldb.put(`Receipts.${receipt.transactionHash}`, JSON.stringify(receipt))
        .then(() => Promise.resolve({ receipt }));
    });
  }

  putEvent({ logs, timestamp }) {
    if(logs instanceof Array) {
      return Promise.all(logs.map((log) => this.putEvent({ logs: log, timestamp })));
    } else {
      this.logger.debug(`  \x1b[1m\x1b[36mEvent\x1b[0m\x1b[21m ${logs.logIndex} - ${logs.topics[0] || logs.topics}`);

      const log = logs;
      log.blockNumber = parseInt(logs.blockNumber);
      log.timestamp = timestamp;

      const condition = {
        transactionHash: log.transactionHash,
        logIndex: log.logIndex
      };
      const mongodb = this.database.mongodb;
      const leveldb = this.database.leveldb;
      const tableName = `${this.config.database.prefix}Events`;
      return mongodb ? 
        new Promise((resolve, reject) => {
          mongodb.collection(tableName).update(
            condition,
            log,
            { upsert: true },
            (e, d) => {
              if(e) {
                reject(e);
              } else {
                resolve({ logs });
              }
            }
        )}) :
        leveldb.put(`Events.${log.transactionHash}.${log.logIndex}`, JSON.stringify(log))
        .then(() => Promise.resolve({ logs }));
    }
  }

  putContract({
    transaction,
    receipt
  }) {
    const contractAddress = receipt.contractAddress;
    if(!contractAddress) { return Promise.resolve({}); }
    this.logger.log(`\x1b[1m\x1b[32mContract\x1b[0m\x1b[21m ${contractAddress}`);
    this.getContract({ address: contractAddress }).then((code) => {
      const condition = { contractAddress };
      const contract = {
        blockNumber: parseInt(receipt.blockNumber),
        contractAddress: receipt.contractAddress,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        from: transaction.from,
        gasUsed: receipt.gasUsed,
        transactionHash: receipt.transactionHash,
        timestamp: receipt.timestamp,
        code
      };
      const mongodb = this.database.mongodb;
      const leveldb = this.database.leveldb;
      const tableName = `${this.config.database.prefix}Contracts`;
      return mongodb ?
      new Promise((resolve, reject) => {
        mongodb.collection(tableName).update(
          condition,
          contract,
          { upsert: true },
          (e, d) => {
            if(e) {
              reject(e);
            } else {
              resolve({ contract });
            }
          }
        )}) :
        leveldb.put(`Contracts.${contractAddress}`, JSON.stringify(contract))
        .then(() => Promise.resolve({ contract }));
    })
  }

  putInternalTranction({ transactionHash }) {
    const type = 'trace';
    const options = dvalue.clone(this.config.blockchain);
    options.data = this.constructor.cmd({ type, txHash: transactionHash });
    return Utils.ETHRPC(options)
    .then((data) => {
      if(data.result instanceof Object) {
        return Promise.resolve(data.result);
      } else {
        this.logger.log(`\x1b[1m\x1b[90mtransaction not found\x1b[0m\x1b[21m ${txHash}`);
        return Promise.reject();
      }
    })
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(true));
  }

  static cmd({ type, txHash, block, address }) {
    let result;
    switch(type) {
      case 'block':
        result = {
          "jsonrpc": "2.0",
          "method": "eth_getBlockByNumber",
          "params": [ `0x${block.toString(16)}`, false ],
          "id": dvalue.randomID()
        };
        break;
      case 'transaction':
        result = {
          "jsonrpc": "2.0",
          "method": "eth_getTransactionByHash",
          "params": [ txHash ],
          "id": dvalue.randomID()
        };
        break;
      case 'receipt':
        result = {
          "jsonrpc": "2.0",
          "method": "eth_getTransactionReceipt",
          "params": [ txHash ],
          "id": dvalue.randomID()
        };
        break;
      case 'trace':
        result = {
          "jsonrpc": "2.0",
          "method": "trace_transaction",
          "params": [ txHash ],
          "id": dvalue.randomID()
        };
        break;
      case 'contract':
        result = {
          "jsonrpc":"2.0",
          "method":"eth_getCode",
          "params":[ address ],
          "id": dvalue.randomID()
        };
        break;
    }
    return result;
  }

  jsonrpc({ body, files, params, header, method, query }) {
    const options = dvalue.clone(this.config.blockchain);
    options.data = body;
    return Utils.ETHRPC(options);
  }
}

module.exports = BlockScanner;