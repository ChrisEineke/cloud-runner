'use strict';

class Config {

    static fromJSON(doc) {
        return Config.create(doc['clouds'], doc['machine-templates'], doc['machines']);
    }

    static create(clouds, machineTemplates, machines) {
        return new Config(clouds, machineTemplates, machines);
    }

    constructor(clouds, machineTemplates, machines) {
        this.clouds = clouds || {};
        this.machineTemplates = machineTemplates || {};
        this.machines = machines || {};
    }

    addCloud(cloud) {
        this.clouds[cloud.id] = {
            id: id,
            provider: provider,
            credentials: credentials
        };
        return this;
    }

    removeCloud(cloudId) {
        this.clouds[cloudId] = undefined;
    }

    getAllClouds() {
        return this.clouds;
    }

    getCloud(cloudId) {
        return this.clouds[cloudId] || null;
    }

    addMachineTemplate(machineTemplate) {
        this.machineTemplates[machineTemplate.id] = machineTemplate;
    }

    removeMachineTemplate(machineTemplateId) {
        this.machineTemplates[machineTemplateId] = undefined;
    }

    getAllMachineTemplates() {
        return this.machineTemplates;
    }

    getMachineTemplate(machineTemplateId) {
        return this.machineTemplates[machineTemplateId] || null;
    }

    addMachine(machine) {
        this.machines[machine.id] = machine;
    }

    removeMachine(machineId) {
        this.machines[machineId] = undefined;
    }

    getAllMachines() {
        return this.machines;
    }

    getMachine(machineId) {
        return this.machines[machineId] || null;
    }

    toJSON() {
        return {
            'clouds': this.clouds,
            'machine-templates': this.machineTemplates,
            'machines': this.machines
        };
    }

}

module.exports = Config;
