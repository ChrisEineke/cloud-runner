'use strict';

const Cloudrunner = require('./Cloudrunner');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');
const fs = require('fs-extra-promise');
const minimist = require('minimist');
const path = require('path');
const _ = require('lodash');
const when = require('when');

class Cli {

    constructor(cloudrunner) {
        this.cloudrunner = cloudrunner;
        this.commandMap = {
            null: this.null,
            init: this.init
        };
        this.validCommands = [
            null,
            'init',
            'add-cloud',
            'remove-cloud',
            'clouds',
            'add-machine-template',
            'remove-machine-template',
            'machine-templates',
            'spawn-machine',
            'kill-machine',
            'machines',
            'exec'
        ];
    }

    static create() {
        return new Cli(Cloudrunner.create());
    }

    run() {
        try {
            const { command, argv } = commandLineCommands(this.validCommands);
            switch (command) {
                case null:
                    return this.null();
                case 'init':
                    return this.init();
                case 'add-cloud':
                    return this.addCloud(argv);
                case 'remove-cloud':
                    return this.removeCloud(argv);
                case 'clouds':
                    return this.listClouds(argv);
                case 'add-machine-template':
                    return this.addMachineTemplate(argv);
                case 'remove-machine-template':
                    return this.removeMachineTemplate(argv);
                case 'machine-templates':
                    return this.listMachineTemplates(argv);
                case 'spawn-machine':
                    return this.spawnMachine(argv);
                case 'kill-machine':
                    return this.killMachine(argv);
                case 'exec':
                    return this.executeCommand(argv);
            }
        }
        catch (e) {
            console.dir(e);
        }
    }

    null() {
    }

    init() {
        return this.cloudrunner.init();
    }

    addCloud(argv) {
        const optionDefinitions = [
            { name: 'id', type: String },
            { name: 'provider', type: String },
            { name: 'credentials', type: String }
        ];
        const options = commandLineArgs(optionDefinitions, { argv });
        if (typeof options.id === 'undefined') {
            throw new Error('Missing option: id');
        }
        if (typeof options.provider === 'undefined') {
            throw new Error('Missing option: provider');
        }
        if (typeof options.credentials === 'undefined') {
            throw new Error('Missing option: credentials');
        }
        return this.cloudrunner.addCloud(options.id, options.provider, options.credentials);
    }

    removeCloud(argv) {
        const optionDefinitions = [
            { name: 'id', type: String }
        ];
        const options = commandLineArgs(optionDefinitions, { argv });
        if (typeof options.id === 'undefined') {
            throw new Error('Missing option: id');
        }
        return this.cloudrunner.removeCloud(options.id);
    }

    listClouds(argv) {
        return this.cloudrunner.listClouds().then((clouds) => {
            _.each(clouds, function (cloud) {
                console.log("%s", cloud.id);
            });
        });
    }

    addMachineTemplate(argv) {
        const options = minimist(argv);
        if (typeof options.id === 'undefined') {
            throw new Error('Missing option: id');
        }
        return this.cloudrunner.addMachineTemplate(options.id, options);
    }

    removeMachineTemplate(argv) {
        const optionDefinitions = [
            { name: 'id', type: String }
        ];
        const options = commandLineArgs(optionDefinitions, { argv });
        if (typeof options.id === 'undefined') {
            throw new Error('Missing option: id');
        }
        return this.cloudrunner.removeMachineTemplate(options.id);
    }

    listMachineTemplates(argv) {
        return this.cloudrunner.listMachineTemplates().then((machineTemplates) => {
            _.each(machineTemplates, function (machineTemplate) {
                console.log("%s", machineTemplate.id);
            });
        });
    }

    spawnMachine(argv) {
        const optionDefinitions = [
            { name: 'cloud', type: String },
            { name: 'machine-template', type: String },
            { name: 'machine-id', type: String }
        ];
        const options = commandLineArgs(optionDefinitions, { argv });
        if (typeof options['cloud'] === 'undefined') {
            throw new Error('Missing option: cloud');
        }
        const cloudId = options['cloud'];
        if (typeof options['machine-template'] === 'undefined') {
            throw new Error('Missing option: machine-template');
        }
        const machineTemplateId = options['machine-template'];
        if (typeof options['machine-id'] === 'undefined') {
            throw new Error('Missing option: machine-id');
        }
        const machineId = options['machine-id'];
        return this.cloudrunner.spawnMachine(cloudId, machineTemplateId, machineId);
    }

    killMachine(argv) {
        const optionDefinitions = [
            { name: 'cloud', type: String },
            { name: 'machine-id', type: String }
        ];
        const options = commandLineArgs(optionDefinitions, { argv });
        if (typeof options['cloud'] === 'undefined') {
            throw new Error('Missing option: cloud');
        }
        const cloudId = options['cloud'];
        if (typeof options['machine-id'] === 'undefined') {
            throw new Error('Missing option: machine-id');
        }
        const machineId = options['machine-id'];
        return this.cloudrunner.killMachine(cloudId, machineId);
    }

    executeCommand(argv) {
        const optionDefinitions = [
            { name: 'cloud', type: String },
            { name: 'machine-template', type: String },
            { name: 'machine-id', type: String },
            { name: 'cmd', type: String }
        ];
        const options = commandLineArgs(optionDefinitions, { argv });
        if (typeof options['cloud'] === 'undefined') {
            throw new Error('Missing option: cloud');
        }
        const cloudId = options['cloud'];
        if (typeof options['machine-template'] === 'undefined') {
            throw new Error('Missing option: machine-template');
        }
        const machineTemplateId = options['machine-template'];
        if (typeof options['machine-id'] === 'undefined') {
            throw new Error('Missing option: machine-id');
        }
        const machineId = options['machine-id'];
        if (typeof options['cmd'] === 'undefined') {
            throw new Error('Missing option: cmd');
        }
        const cmd = options['cmd'];
        return this.cloudrunner.executeTask(cloudId, machineTemplateId, machineId, cmd);
    }

}

module.exports = Cli;
