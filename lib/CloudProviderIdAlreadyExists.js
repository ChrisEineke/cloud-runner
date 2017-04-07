'use strict';

const ExtendableError = require("es6-error");

class CloudProviderIdAlreadyExists extends ExtendableError {
    constructor(message) {
        super(message);
    }
}

module.exports = CloudProviderIdAlreadyExists;
