#!/usr/bin/env bun

import { Command } from 'commander';
import packageJson from '../package.json';
import { previewCommand } from './commands/previewCommand';
import { imageCommand } from './commands/image';
import { bootCommand } from './commands/boot';

const program = new Command();

program.name(packageJson.name).description(packageJson.description).version(packageJson.version);

program.addCommand(previewCommand);
program.addCommand(imageCommand);
program.addCommand(bootCommand);

const epipe = (error: NodeJS.ErrnoException): void => {
	if (error.code === 'EPIPE') process.exit(0);
	throw error;
};

process.stdout.on('error', epipe);
process.stderr.on('error', epipe);

program.parse();
