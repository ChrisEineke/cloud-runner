'use strict';

const fs = require('fs-extra-promise');
const path = require('path');
const _ = require('lodash');
const util = require('util');
const when = require('when');

const DigitalOceanCloud = require('./DigitalOceanCloud');

class Cloudrunner {

    init() {
        return when.try(() => {
            return fs.ensureDirAsync(Cloudrunner.DOT_DIR_PATH);
        }).then(() => {
            return fs.openAsync(Cloudrunner.CONFIG_FILE_PATH, 'w');
        }).then((fd) => {
            return fs.closeAsync(fd);
        });
    }

    readConfig() {
        return fs.readJsonAsync(Cloudrunner.CONFIG_FILE_PATH).catch((err) => {
            return {};
        }).then((config) => {
            return config;
        });
    }

    writeConfig(config) {
        return fs.writeJsonAsync(Cloudrunner.CONFIG_FILE_PATH, config);
    }

    addCloud(id, provider, credentials) {
        return this.readConfig().then((config) => {
            config['clouds'] = config['clouds'] || {};
            config['clouds'][id] = {
                id: id,
                provider: provider,
                credentials: credentials
            };
            return config;
        }).then((config) => {
            return this.writeConfig(config);
        });
    }

    removeCloud(id) {
        return this.readConfig().then((config) => {
            if (typeof config['clouds'] === 'undefined') {
                return config;
            }
            if (typeof config['clouds'][id] === 'undefined') {
                return config;
            }
            config['clouds'][id] = undefined;
            return config;
        }).then((config) => {
            return this.writeConfig(config);
        });
    }

    addMachineTemplate(id, template) {
        return this.readConfig().then((config) => {
            config['machine-templates'] = config['machine-templates'] || {};
            config['machine-templates'][id] = _.omit(template, [ '_' ]);
            return config;
        }).then((config ) => {
            return this.writeConfig(config);
        });
    }

    removeMachineTemplate(id) {
        return this.readConfig().then((config) => {
            if (typeof config['machine-templates'] === 'undefined') {
                return config;
            }
            if (typeof config['machine-templates'][id] === 'undefined') {
                return config;
            }
            config['machine-templates'][id] = undefined;
            return config;
        }).then((config ) => {
            return this.writeConfig(config);
        });
    }

    executeTask(cloudId, machineTemplateId, machineName, cmd) {
        return this.readConfig().then((config) => {
            if (typeof config['clouds'][cloudId] === 'undefined') {
                throw new Error(util.format('%s is not a cloud', cloudId));
            }
            const cloudConfig = config['clouds'][cloudId];
            var cloud;
            switch (cloudConfig.provider) {
            case 'DigitalOcean':
                cloud = DigitalOceanCloud.create(cloudConfig.credentials);
                break;
            }
            if (typeof config['machine-templates'][machineTemplateId] === 'undefined') {
                throw new Error(util.format('%s is not a machine template', machineTemplateId));
            }
            const machineTemplate = config['machine-templates'][machineTemplateId];
            cloud.addMachineTemplate(machineTemplateId, machineTemplate);
            return cloud.validateConnectivity().then(() => {
                return cloud.spawnMachine(machineName, machineTemplateId);
            }).then(() => {
                return cloud.blockUntilMachineIsAvailable(machineName);
            }).then(() => {
                return cloud.runShellCommand(machineName, cmd);
            }).then(() => {
                return cloud.killMachine(machineName);
            });
        });
    }

}

Cloudrunner.DOT_DIR_PATH = path.join(process.env.HOME, '.cloudrunner');

Cloudrunner.CONFIG_FILE_PATH = path.join(Cloudrunner.DOT_DIR_PATH, 'config.json');

module.exports = Cloudrunner;
