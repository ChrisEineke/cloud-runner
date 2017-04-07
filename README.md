# cloud-runner
Run tasks in the cloud. Currently supports the following providers:
   * DigitalOcean

## Prerequisites
cloud-runner is written in node.js and thus requires `npm` for installation and `node.js` for operation.

## Installation
```
$ npm install -g cloud-runner
```

## Usage
To run a task in the cloud, cloud-runner requires access to a cloud provider and a machine template.

### First-Time Setup
Before using cloud-runner proper, you must first run the cloud-runner initialization:
```
$ cloud-runner init
```
This creates a `.cloud-runner` directory in the current user's home directory, where cloud-runner will store its
configuration and other data.

### Adding a Cloud Provider
A cloud provider is a service that spawns and destroys machines, either virtual or physical.

#### DigitalOcean
```
$ cloud-runner add-cloud --id=do1 --provider=DigitalOcean --credentials=<accessToken>
```
This registers a DigitalOcean cloud provider under the ID `do1`. `<accessToken>` must be a valid DigitalOcean API token.

### Removing a Cloud Provider
```
$ cloud-runner remove-cloud --id=do1
```
Makes cloud-runner forget the details of the cloud provider with the ID `do1`, in this case the DigitalOcean cloud
provider we registered above.

### Adding a Machine Template

#### DigitalOcean
```
$ cloud-runner add-machine-template --id=small --region=tor1 --size=512mb --image=ubuntu-16-04-x64 --ssh_keys=<sshKeyFingerprint>
```
This registers a machine template under the ID `small` for use with a DigitalOcean cloud provider in the Toronto region,
512 MiB of RAM, running Ubuntu 16.04. `<sshKeyFingerprint>` must be the fingerprint of a SSH key add to DigitalOcean.

### Removing a Machine Template
```
$ cloud-runner remove-machine-template --id=small
```
Makes cloud-runner forget the details of the machine template with the ID `small`, in this case the DigitalOcean-specific
template we registered above.

### Executing a Task
```
$ cloud-runner exec --cloud=do1 --machine-template=small --machine-name=test --cmd="echo 'Hello, world'"
[] Validated connectivity.
[test] Spawned droplet.
[test] Blocking until droplet becomes unlocked...
[test] has become unlocked.
[test] Connected via SSH.
[test] Ran shell command echo 'Hello, world'.

Hello, world
[test] Deleted droplet.
```
Spawns a machine under the cloud provider `do1`, with the machine specs given by the machine template `small`, naming it
`test`, and running the command `echo 'Hello, world'`.
