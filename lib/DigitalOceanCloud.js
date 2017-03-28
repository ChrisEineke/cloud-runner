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
        this.templates = {};
        this.machines = {};
    }

    static create(apiKey) {
        const api = new DigitalOceanAPI(apiKey);
        const cloud = new DigitalOceanCloud(api);
        return cloud;
    }

    validateConnectivity() {
        return this.api.account().then((res) => {
            console.log(`[] Validated connectivity.`);
        });
    }

    addMachineTemplate(name, template) {
        this.templates[name] = template;
    }

    removeMachineTemplate(name) {
        delete this.templates[name];
    }

    spawnMachine(name, machineTemplateName) {
        const configuration = _.merge({},
            { name: name },
            this.templates[machineTemplateName],
            { ssh_keys: [ this.templates[machineTemplateName].ssh_keys ] });
        return this.api.dropletsCreate(configuration).then((res) => {
            this.machines[name] = res.body.droplet;
            console.log(`[${name}] Spawned droplet.`);
        }).catch((e) => {
            console.error(`[${name}] Failed to spawn droplet: ${e.message}`);
            throw e;
        });
    }

    killMachine(name) {
        return this.api.dropletsDelete(this.machines[name].id).then((res) => {
            delete this.machines[name];
            console.log(`[${name}] Deleted droplet.`);
        }).catch((e) => {
            console.error(`[${name}] Failed to delete droplet: ${e.message}`);
        });
    }

    blockUntilMachineIsAvailable(name) {
        console.log(`[${name}] Blocking until droplet becomes unlocked...`);
        return poll(() => {
            return this.api.dropletsGetById(this.machines[name].id).then((res) => {
                this.machines[name] = res.body.droplet;
            }).catch((e) => {
                return { droplet: { locked: true } };
            });
        }, () => {
            return when().delay(1000);
        }, () => {
            return !this.machines[name].locked;
        }).catch((e) => {
            console.error(`[${name}] Failed to block until droplet became available: ${e.message}`);
        }).then(() => {
            console.log(`[${name}] has become unlocked.`);
        });
    }

    runShellCommand(name, cmd) {
        const sshClient = new ssh();
        return sshClient.connect({
            host: this.machines[name].networks.v4[0].ip_address,
            username: 'root',
            privateKey: '/home/ceineke/.ssh/digitalocean',
        }).then(() => {
            console.log(`[${name}] Connected via SSH.`);
            return sshClient.execCommand(cmd, { cwd: '/root' });
        }).then((result) => {
            console.log(`[${name}] Ran shell command ${cmd}.`);
            console.log(result.stderr);
            console.log(result.stdout);
            return sshClient.dispose();
        }).catch((e) => {
            console.error('[${name}] Failed to run shell command %s: ${e.message}', cmd);
        });
    }

}

module.exports = DigitalOceanCloud;
