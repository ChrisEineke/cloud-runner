'use strict';

const commandLineCommands = require('command-line-commands');
const commandLineArgs = require('command-line-args');
const fs = require('fs-extra-promise');
const minimist = require('minimist');
const path = require('path');
const when = require('when');

const Cloudrunner = require('./Cloudrunner');

class Cli {

    constructor(cloudrunner) {
        this.cloudrunner = cloudrunner;
        this.commandMap = {
            null: this.null,
            init: this.init
        };
        this.validCommands = [ null, 'init', 'add-cloud', 'remove-cloud', 'add-machine-template', 'remove-machine-template', 'exec' ];
    }

    static create() {
        return new Cli(new Cloudrunner());
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
                case 'add-machine-template':
                    return this.addMachineTemplate(argv);
                case 'remove-machine-template':
                    return this.removeMachineTemplate(argv);
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

    executeCommand(argv) {
        const optionDefinitions = [
            { name: 'cloud', type: String },
            { name: 'machine-template', type: String },
            { name: 'machine-name', type: String },
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
        if (typeof options['machine-name'] === 'undefined') {
            throw new Error('Missing option: machine-name');
        }
        const machineName = options['machine-name'];
        if (typeof options['cmd'] === 'undefined') {
            throw new Error('Missing option: cmd');
        }
        const cmd = options['cmd'];
        return this.cloudrunner.executeTask(cloudId, machineTemplateId, machineName, cmd);
    }

}

module.exports = Cli;
