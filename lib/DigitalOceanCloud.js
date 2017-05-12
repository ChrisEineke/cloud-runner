'use strict';

const DigitalOceanAPI = require('do-wrapper');
const fs = require('fs-extra-promise');
const poll = require('when/poll');
const _ = require('lodash');
const ssh = require('node-ssh');
const when = require('when');

const Cloud = require('./Cloud');

class DigitalOceanCloud extends Cloud {

    constructor(api) {
        super();
        this.api = api;
        this.machines = {};
    }

    static create(apiKey) {
        const api = new DigitalOceanAPI(apiKey);
        const cloud = new DigitalOceanCloud(api);
        return cloud;
    }

    validateConnectivity() {
        return this.api.account().then((res) => {
            console.log(`[] Validated connectivity to cloud provider.`);
        });
    }

    spawnMachine(machineId, machineTemplate) {
        const configuration = _.merge({},
            { name: machineId },
            machineTemplate,
            { ssh_keys: [ machineTemplate['ssh_keys'] ] });
        return this.api.dropletsCreate(configuration).then((res) => {
            this.machines[machineId] = res.body.droplet;
            console.log(`[${machineId}] Spawned droplet.`);
        }).catch((e) => {
            console.error(`[${machineId}] Failed to spawn droplet: ${e.message}`);
            throw e;
        });
    }

    killMachine(machineId) {
        return this.api.dropletsDelete(this.machines[machineId].id).then((res) => {
            delete this.machines[machineId];
            console.log(`[${machineId}] Deleted droplet.`);
        }).catch((e) => {
            console.error(`[${machineId}] Failed to delete droplet: ${e.message}`);
        });
    }

    blockUntilMachineIsAvailable(machineId) {
        console.log(`[${machineId}] Blocking until droplet becomes unlocked...`);
        return poll(() => {
            return this.api.dropletsGetById(this.machines[machineId].id).then((res) => {
                this.machines[machineId] = res.body.droplet;
            }).catch((e) => {
                return { droplet: { locked: true } };
            });
        }, () => {
            return when().delay(1000);
        }, () => {
            return !this.machines[machineId].locked;
        }).catch((e) => {
            console.error(`[${machineId}] Failed to block until droplet became available: ${e.message}`);
        }).then(() => {
            console.log(`[${machineId}] has become unlocked.`);
        });
    }

    runShellCommand(machineId, cmd) {
        const sshClient = new ssh();
        return sshClient.connect({
            host: this.machines[machineId].networks.v4[0].ip_address,
            username: 'root',
            privateKey: '/home/ceineke/.ssh/digitalocean',
        }).then(() => {
            console.log(`[${machineId}] Connected via SSH.`);
            return sshClient.execCommand(cmd, { cwd: '/root' });
        }).then((result) => {
            console.log(`[${machineId}] Ran shell command ${cmd}.`);
            console.log(result.stderr);
            console.log(result.stdout);
            return sshClient.dispose();
        }).catch((e) => {
            console.error('[${machineId}] Failed to run shell command %s: ${e.message}', cmd);
        });
    }

}

module.exports = DigitalOceanCloud;
