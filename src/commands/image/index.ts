import { program } from 'commander';
import { createCommand } from './create';
import { prepareCommand } from './prepare';

export const imageCommand = program
	.command('image')
	.description('manages the images to be used by QEMU')
	.addCommand(createCommand)
	.addCommand(prepareCommand);
