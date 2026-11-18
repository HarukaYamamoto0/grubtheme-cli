import { Command } from 'commander';
import packageJson from '../package.json';
import { previewCommand } from './commands/previewCommand';

const program = new Command();

program.name(packageJson.name).description(packageJson.description).version(packageJson.version);

program.addCommand(previewCommand);

program.parse();

export type Path = string;
