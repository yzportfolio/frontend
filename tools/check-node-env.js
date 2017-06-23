#!/usr/bin/env node
/* eslint-disable global-require, import/no-dynamic-require */

// Check for node and yarn at correct versions using `check-node-version`:
// https://github.com/parshap/check-node-version

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

// this is our environment spec
const requiredEnv = Object.assign(
    {
        node: fs
            .readFileSync(path.join(process.cwd(), '.nvmrc'), 'utf8')
            .trim(),
    },
    require(path.join(process.cwd(), 'package.json')).engines
);

const nodeErrorMessage = (got, need) => `
*******************************

You are using Node ${got} but Frontend requires ${need}.

If you're using NVM, you can \`nvm use\`.

*******************************

Install NVM: https://github.com/creationix/nvm
Automate NVM: https://git.io/vKTnK

*******************************
`;

// if check-node-version is not installed (e.g. we're setting up
// frontend for the first time) we just do a quick local install.
// it's a dev dep so this will rarely be needed.
const requireCheckNodeVersion = new Promise(resolve => {
    try {
        resolve(require('check-node-version'));
    } catch (e) {
        childProcess
            .spawn('npm', ['i', 'check-node-version', '--no-save'], {
                stdio: 'inherit',
            })
            .on('close', code => {
                if (code !== 0) process.exit(code);
                resolve(require('check-node-version'));
            });
    }
});

requireCheckNodeVersion.then(checkNodeVersion => {
    checkNodeVersion(requiredEnv, (e, result) => {
        if (!result.node.isSatisfied) {
            const {
                version: { raw: got },
                wanted: { range: need },
            } = result.node;
            console.log(nodeErrorMessage(got, need));
            process.exit(1);
        }
        if (!result.yarn.isSatisfied) {
            childProcess
                .spawn('npm', ['i', '-g', `yarn@${result.yarn.wanted.raw}`], {
                    stdio: 'inherit',
                })
                .on('close', code => {
                    if (code !== 0) process.exit(code);
                });
        }
    });
});
