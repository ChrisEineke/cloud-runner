'use strict';

const CloudFactory = require('./CloudFactory');
const ConfigDao = require('./ConfigDao');
const _ = require('lodash');
const util = require('util');
const when = require('when');

class Cloudrunner {

    static create() {
        return new Cloudrunner(ConfigDao.create(), CloudFactory.create());
    }

    constructor(configDao, cloudFactory) {
        this.configDao = configDao;
        this.cloudFactory = cloudFactory;
    }

    addCloud(id, provider, credentials) {
        return this.configDao.get().then((config) => {
            config.addCloud({
                id: id,
                provider: provider,
                credentials: credentials
            });
            return this.configDao.put(config);
        });
    }

    removeCloud(cloudId) {
        return this.configDao.get().then((config) => {
            config.removeCloud(cloudId);
            return this.configDao.put(config);
        });
    }

    listClouds() {
        return this.configDao.get().then((config) => {
            return config.getAllClouds();
        });
    }

    addMachineTemplate(id, machineTemplate) {
        return this.configDao.get().then((config) => {
            config.addMachineTemplate(_.assign({ id }, _.omit(machineTemplate, [ '_' ])));
            return this.configDao.put(config);
        });
    }

    removeMachineTemplate(machineTemplateId) {
        return this.configDao.get().then((config) => {
            config.removeMachineTemplate(machineTemplateId);
            return this.configDao.put(config);
        });
    }

    spawnMachine(cloudId, machineTemplateId, machineId) {
        return this.configDao.get().then((config) => {
            const cloudConfig = config.getCloud(cloudId);
            if (cloudConfig === null) {
                throw new Error(util.format('%s is not a cloud', cloudId));
            }
            const cloud = this.cloudFactory.createFromConfig(cloudConfig);
            const machineTemplate = config.getMachineTemplate(machineTemplateId);
            if (machineTemplate === null) {
                throw new Error(util.format('%s is not a machine template', machineTemplateId));
            }
            return cloud.validateConnectivity().then(() => {
                return cloud.spawnMachine(machineId, machineTemplate);
            }).then(() => {
                config.addMachine({
                    id: machineId,
                    cloud: cloudId,
                    machineTemplate: machineTemplateId
                });
                return this.configDao.put(config);
            }).then(() => {
                return cloud.blockUntilMachineIsAvailable(machineId);
            }).then(() => {
                return cloud;
            });
        });
    }

    killMachine(cloudId, machineId) {
        return this.configDao.get().then((config) => {
            const cloudConfig = config.getCloud(cloudId);
            if (cloudConfig === null) {
                throw new Error(util.format('%s is not a cloud', cloudId));
            }
            const cloud = this.cloudFactory.createFromConfig(cloudConfig);
            return [ config, cloud.killMachine(machineId) ];
        }).spread((config) => {
            config.removeMachine(machineId);
            return this.configDao.put(config);
        });
    }

    listMachineTemplates() {
        return this.configDao.get().then((config) => {
            return config.getAllMachineTemplates();
        });
    }

    executeTask(cloudId, machineTemplateId, machineId, cmd) {
        return this.spawnMachine(cloudId, machineTemplateId, machineId).then((cloud) => {
            return cloud.runShellCommand(machineId, cmd);
        }).then(() => {
            return this.killMachine(cloudId, machineId);
        });
    }

}

module.exports = Cloudrunner;
