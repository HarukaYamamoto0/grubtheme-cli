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

program.parse();
