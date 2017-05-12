'use strict';

const DigitalOceanCloud = require('./DigitalOceanCloud');
const util = require('util');

class CloudFactory {

    static create() {
        return new CloudFactory();
    }

    constructor() {
    }

    createFromConfig(cloudConfig) {
        switch (cloudConfig.provider) {
        case 'DigitalOcean':
            return DigitalOceanCloud.create(cloudConfig.credentials);
            break;
        default:
            throw new Error(util.format('%s is not a supported provider', cloudConfig.provider));
        }
    }

}

module.exports = CloudFactory;
