const os = require('os');
const fs = require('fs');
const path = require('path');
const url = require('url');

const level = require('level');
const mongodb = require('mongodb').MongoClient;
const toml = require('toml');
const i18n = require("i18n");
const dvalue = require('dvalue');
const ecRequest = require('ecrequest');

class Utils {
  static waterfallPromise(jobs) {
    return jobs.reduce((prev, curr) => {
      return prev.then(() => curr());
    }, Promise.resolve());
  }
  static retryPromise(promise, args, maxTries, context, timeout) {
    context = context || null;
    return promise.apply(context, args)
    .then((d) => {
      return Promise.resolve(d);
    },
    (e) => {
      if (maxTries <= 0) return Promise.reject(e);
      else {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.retryPromise(promise, args, maxTries - 1, context, timeout)
            .then(resolve, reject);
          }, timeout || 0);
        });
      }
    });
  }

  static toHex(n) {
    return `0x${(n).toString(16)}`;
  }

  static zeroFill(i, l) {
    let s = i.toString();
    if(l > s.length) {
      s = `${new Array(l - s.length).fill(0).join('')}${s}`;
    }
    return s;
  }

  static parseBoolean(bool) {
    return typeof(bool) == 'string' ?
      bool.toLowerCase() != 'false' :
      !!bool;
  }

  static parseTime(timestamp) {
    let result;
    const uptime = new Date().getTime() - timestamp;
    if(uptime > 86400 * 365 * 1000) {
      result = `${(uptime / (86400 * 365 * 1000)).toFixed(2)} Yrs`;
    } else if(uptime > 86400 * 30 * 1000) {
      result = `${(uptime / (86400 * 30 * 1000)).toFixed(2)} Mon`;
    } else if(uptime > 86400 * 1000) {
      result = `${(uptime / (86400 * 1000)).toFixed(2)} Day`;
    } else if(uptime > 3600 * 1000) {
      result = `${(uptime / (3600 * 1000)).toFixed(2)} Hrs`;
    } else if(uptime > 60 * 1000) {
      result = `${(uptime / (60 * 1000)).toFixed(2)} Min`;
    } else {
      result = `${(uptime / (1000)).toFixed(2)} Sec`;
    }
    return result;
  }
  static toToml(data, notRoot) {
    let result;

    if(data instanceof Object) {
      result = Object.keys(data)
      .map((v) => {
      if(data[v] instanceof Object) {
        return `[${v}]\r\n${this.toToml(data[v], true)}\r\n` ;
      } else if (typeof(data[v]) == 'string') {
          return `${v} = "${data[v]}"${!notRoot ? '\r\n' : ''}`;
      } else {
        return `${v} = ${data[v]}${!notRoot ? '\r\n' : ''}`;
      }
      }).join('\r\n');
    } else {
      result = new String(data).toString();
    }

    return result;
  }

  static ETHRPC({ protocol, port, hostname, path, data }) {
    const opt = {
      protocol,
      port,
      hostname,
      path,
      headers: { 'content-type': 'application/json' },
      data
    };
    return ecRequest.post(opt).then((rs) => {
      return Promise.resolve(JSON.parse(rs.data));
    });
  }

  static initialAll({ version, configPath }) {
    const cfg = configPath ? configPath : path.resolve(__dirname, '../config.toml');
    return this.readConfig({ configPath: cfg })
    .then((config) => {
      const rsConfig = config;
      // const uploadFolder = path.resolve(config.homeFolder, 'uploads');
      rsConfig.argv = arguments[0];
      return this.initialFolder(config)
      // .then(() => this.initialFolder({ homeFolder: config.uploadFolder }))
      .then(() => rsConfig);
    })
    .then((config) => Promise.all([
      config,
      this.initialLevel(config),
      this.initialDB(config),
      this.initialLogger(config),
      this.initiali18n(config),
      this.initialProcess(config)
    ]))
    .then((rs) => Promise.resolve({
      config: rs[0],
      database: {
        leveldb: rs[1],
        mongodb: rs[2]
      },
      logger: rs[3],
      i18n: rs[4]
    }))
  }

  static readConfig({ configPath }) {
    let config;
    return this.readPackageInfo()
    .then((packageInfo) => {
      const basePath = path.resolve(os.homedir(), packageInfo.name);
      return new Promise((resolve, reject) => {
        fs.readFile(configPath, (err, data) => {
          if(err) {
            return reject(err);
          } else {
            config = toml.parse(data);
            config.packageInfo = packageInfo;
            config.runtime = {
              configPath,
              startTime: new Date().getTime()
            };
            config.homeFolder = config.base.folder ?
              path.resolve(basePath, config.base.folder) :
              basePath;
            // config.uploadFolder = path.resolve(basePath, 'uploads');
            return resolve(config);
          }
        });
      });
    });
  }

  static readPackageInfo() {
    const pkg = require(path.resolve(__dirname, '../package.json'));
    const packageInfo = {
      name: pkg.name,
      version: pkg.version,
      powerby: pkg.name + " v" + pkg.version
    };
    return Promise.resolve(packageInfo);
  }

  static listProcess() {
    return this.readPackageInfo()
    .then((packageInfo) => {
      const PIDFolder = path.resolve(os.homedir(), packageInfo.name, 'PIDs');
      this.scanFolder({ folder: PIDFolder })
      .then((list) => {
        const jobs = list
        .map((v) => parseInt(path.parse(v).name))
        .filter((v) => v > -1)
        .sort((a, b) => {
          return a > b ?
            1 :
            -1 ;
        })
        .map((PID, i) => this.readProcess({ PID, PIDFolder }));

        return Promise.all(jobs)
        .then((d) => {
          const bar = new Array(20).fill('-').join('');
          console.log(`${bar}\r\n${d.join('\r\n')}\r\n${bar}`);
        });
      });
    });
  }

  static readProcess({ PID, PIDFolder }) {
    return this.readPackageInfo()
    .then(packageInfo => {
      const PIDFolder = path.resolve(os.homedir(), packageInfo.name, 'PIDs');
      const PFile = path.resolve(PIDFolder, `${PID}.toml`);
      return Promise.resolve(PFile);
    })
    .then((PFile) => new Promise((resolve, reject) => {
      fs.readFile(PFile, (e, d) => {
        if(e) {
          reject(e);
        } else {
          let status;
          let uptime = '';
          const pInfo = toml.parse(d);
          const cPath = pInfo.runtime.configPath;
          if(this.testProcess({ PID })) {
            status = `\x1b[42m  on  \x1b[0m`;
            uptime = this.parseTime(pInfo.runtime.startTime);
          } else {
            status = `\x1b[41m off  \x1b[0m`;
            PID = `\x1b[90m${PID}\x1b[0m`;
            uptime = '\t';
          }
          resolve([PID, status, uptime, cPath].join('\t'));
        }
      });
    }));
  }

  static testProcess({ PID }) {
    try {
      process.kill(PID, 0);
      return true;
    } catch(e) {
      return false;
    }
  }

  static killProcess({ PID, pause }) {
    if(PID == 0) {
      return this.readPackageInfo()
      .then(packageInfo => {
        const PIDFolder = path.resolve(os.homedir(), packageInfo.name, 'PIDs');
        return this.scanFolder({ folder: PIDFolder });
      })
      .then((list) => {
        const PIDs = list.map((PFile) => path.parse(PFile).name);
        return Promise.all(PIDs.map((pid) => this.killProcess({ PID: pid, pause })));
      });
    }

    try {
      process.kill(PID);
    } catch(e) {

    }
    return this.readPackageInfo()
    .then(packageInfo => {
      const fPID = path.resolve(os.homedir(), packageInfo.name, 'PIDs', `${PID}.toml`);
      return new Promise((resolve, reject) => {
        if(pause) {
          resolve(true);
        } else {
          fs.unlink(fPID, resolve);
        }
      });
    })
  }

  static scanFolder({ folder }) {
    return new Promise((resolve, reject) => {
      fs.readdir(folder, (e, d) => {
        if(e) {
          reject(e);
        } else {
          resolve(d.map(v => path.resolve(folder, v)));
        }
      });
    })
  }

  static initialFolder({ homeFolder }) {
    if(!homeFolder) {
      return Promise.reject(new Error('folder name is undefined'));
    }
    return new Promise((resolve, reject) => {
      fs.exists(homeFolder, (rs) => {
        if(!rs) {
          fs.mkdir(homeFolder, (e, d) => {
            if(e) {
              reject(e);
            } else {
              resolve(homeFolder);
            }
          });
        } else {
          resolve(homeFolder);
        }
      });
    });
  }

  static initialProcess(config) {
    const { packageInfo } = config;
    const processContent = Utils.toToml(config);
    const systemHome = path.resolve(os.homedir(), packageInfo.name);

    return new Promise((resolve, reject) => {
      const PID = process.pid;
      const pathPID = path.resolve(systemHome, 'PIDs', `${PID}.toml`);
      fs.writeFile(pathPID, processContent, function(e) {
        if(e) {
          reject(e);
        } else {
          resolve(true);
        }
      });
    });
  }

  static initialLevel({ homeFolder }) {
    const dbPath = path.resolve(homeFolder, 'dataset');
    return this.initialFolder({ homeFolder: dbPath })
    .then(() => level(dbPath));
  }

  static initialDB({ database }) {
    if(Object.keys(database).length == 0) {
      return Promise.resolve(false);
    }
    let dbPath;
    let dbConfig = database;
    dbConfig.pathname = `/${database.db}`;
    dbConfig.slashes = true;
    if(database.user && database.password) {
      dbConfig.auth = dvalue.sprintf('%s:%s', database.user, database.password);
      dbPath = url.format(database);
    }
    else {
      dbPath = url.format(database);
    }
    return new Promise((resolve, reject) => {
      mongodb.connect(dbPath, { useNewUrlParser: true }, (e, d) => {
        if(e) {
          resolve(false);
        } else {
          const db = d.db();
          db.close = d.close;
          resolve(db);
        }
      });
    });
  }

  static initialLogger({ homeFolder, base }) {
    return Promise.resolve({
      log: console.log,
      debug: base.debug ? console.log : () => {},
      trace: console.trace
    });
  }

  static initiali18n() {
    const localesFolder = path.resolve(__dirname, '../locales');
    return Promise.resolve(i18n);
  }

  static initialBots({ config, database, logger, i18n }) {
    const interfaceFN = 'Bot.js';
    const interfaceBot = require(path.resolve(__dirname, interfaceFN));
    return this.scanFolder({ folder: __dirname })
    .then((list) => list.filter((v) => path.parse(v).name != path.parse(interfaceFN).name))
    .then((list) => list.map((v) => require(v)))
    .then((list) => list.filter((v) => v.isBot))
    .then((list) => list.map((v) => new v()))
    .then((list) => Promise.all(
      list.map((v) => v.init({ config, database, logger, i18n }))
    ))
  }

  static startBots({ Bots }) {
    return Promise.all(Bots.map((bot) => bot.start()))
    .then(() => Bots );
  }

  static close({ Bots }) {
    const database = Bots[0].database;
    database.mongodb.close();
    database.leveldb.close();
  }

  static fileExists({ filePath, rejectError }) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (error, stats) => {
        const isFile = stats && stats instanceof fs.Stats && stats.isFile();
        const isDirectory = stats && stats instanceof fs.Stats && stats.isDirectory();
        if(isDirectory) {
          const htmFilePath = path.resolve(filePath, 'index.htm');
          const htmlFilePath = path.resolve(filePath, 'index.html');
          return Promise.all([
            this.fileExists({ filePath: htmFilePath }),
            this.fileExists({ filePath: htmlFilePath })
          ]).then((rs) => {
            const f = rs.find((v) => !!v);
            if(rejectError && !f) {
              reject(f);
            } else {
              resolve(f);
            }
          });
        }

        if(rejectError && !isFile) {
          reject(error);
        } else {
          resolve(isFile && filePath);
        }
      });
    });
  }
}

module.exports = Utils;