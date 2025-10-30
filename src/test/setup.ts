/**
 * Test setup file
 * This file is loaded before any tests run to set up the testing environment.
 * It registers the vscode mock so that modules can import 'vscode' in tests.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-rest-params */

import * as Module from 'module';
import * as path from 'path';

// Get the original require function
const originalRequire = Module.prototype.require;

// Override Module.prototype.require to intercept 'vscode' imports
Module.prototype.require = function (this: any, id: string): any {
    // If the module being required is 'vscode', return our mock instead
    if (id === 'vscode') {
        return originalRequire.call(this, path.join(__dirname, 'mocks', 'vscode'));
    }
    
    // Otherwise, use the original require
    return originalRequire.apply(this, arguments as any);
};

