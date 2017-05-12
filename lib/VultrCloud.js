'use strict';

const Vultr = require('vultr');
const when = require('when');

const Cloud = require('./Cloud');

class VultrCloud extends Cloud {

    constructor(api) {
        super();
        this.api = api;
        this.templates = {};
        this.machines = {};
    }

    static create(apiKey) {
        const api = new Vultr(apiKey);
        return new VultrCloud(api);
    }

    validateConnectivity() {
        return this.api.account.info((res) => {
            console.log(`[] Validated connectivity.`);
        });
    }

    addMachineTemplate(name, template) {
        this.templates[name] = template;
    }

    removeMachineTemplate(name) {
        this.templates[name] = undefined;
    }

    spawnMachine(name, machineTemplateName) {
        const configuration = _.merge({},
            { hostname: name },
            this.templates(machineTemplateName),
            { SSHKEYID: [ this.templates[machineTemplateName].SSHKEYID ] });
        return this.api.server.create(configuration).then((res) => {
            this.machines[name] = res.body.SUBID;
            console.log(`[${name}] Spawned VPS.`);
        }).catch((e) => {
            console.error(`[${name}] Failed to spawn VPS: ${e.message}`);
            throw e;
        });
    }

    killMachine(name) {
        return this.server.destroy(this.templates[name]).then(

}

module.exports = VultrCloud;
