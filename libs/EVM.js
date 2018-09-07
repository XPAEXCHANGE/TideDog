const Ganache = require("ganache-core");
//const server = Ganache.server();
//server.listen(port, function(err, blockchain) {...});

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));

const defaultHTTP = [8545];

class Receptor extends Bot {
  constructor() {
  	super();
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n });
  }

  start() {
    return super.start()
    .then(() => {
      return this.startEVM();
    })
  }

  startEVM() {
    this.server = Ganache.server();
    const port = defaultHTTP.pop();
    return this.listenHttp({ port });
  }

  listenHttp({ port }) {
  	return new Promise((resolve, reject) => {
      this.server.on('error', () => {
        const newPort = defaultHTTP.length > 0 ? defaultHTTP.pop() : port + 1;
        this.listenHttp({ port: newPort }).then(resolve, reject);
      });
      serverHTTP.listen(port, (err, blockchain) => {
        if(err) {
          reject(err);
        } else {
          this.logger.log('\x1b[1m\x1b[32mHTTP \x1b[0m\x1b[21m ', `http://127.0.0.1:${port}`);
          resolve(this);
        }
      });
    });
  }
}

module.exports = Receptor;