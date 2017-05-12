'use strict';

const Config = require('./Config');
const fs = require('fs-extra-promise');
const path = require('path');
const when = require('when');

class ConfigDao {

    static create() {
        return new ConfigDao(ConfigDao.DOT_DIR_PATH, ConfigDao.CONFIG_FILE_PATH);
    }

    constructor(dotDirPath, configFilePath) {
        this.dotDirPath = dotDirPath;
        this.configFilePath = configFilePath;
    }

    get() {
        return when.try(() => {
            return fs.ensureDirAsync(this.dotDirPath);
        }).then(() => {
            return fs.openAsync(this.configFilePath, 'r');
        }).then((fd) => {
            return fs.closeAsync(fd);
        }).then(() => {
            return fs.readJsonAsync(this.configFilePath);
        }).catch((err) => {
            return {};
        }).then((doc) => {
            return Config.fromJSON(doc);
        });
    }

    put(config) {
        return when.try(() => {
            return fs.ensureDirAsync(this.dotDirPath);
        }).then(() => {
            return fs.writeJsonAsync(this.configFilePath, config);
        });
    }

}

ConfigDao.DOT_DIR_PATH = path.join(process.env.HOME, '.cloud-runner');

ConfigDao.CONFIG_FILE_PATH = path.join(ConfigDao.DOT_DIR_PATH, 'config.json');

module.exports = ConfigDao;
