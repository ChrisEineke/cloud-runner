'use strict';

class Cloud {

    constructor() {}

    validateConnectivity() {}

    addMachineTemplate(name, machineSpecs) {}

    removeMachineTemplate(name) {}

    spawnMachine(name, machineSpecs) {}

    killMachine(name, machineSpecs) {}

    blockUntilMachineIsAvailable(name) {}

    runShellCommand(cmd) {}

}

module.exports = Cloud;
