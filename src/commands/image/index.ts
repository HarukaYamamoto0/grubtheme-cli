import {program} from 'commander';
import {createImageCommand} from "./createImageCommand";
import {deleteImageCommand} from "./deleteImageCommand";
import {prepareImageCommand} from "./prepareImageCommand";

export const imageCommand = program
	.command('image')
	.description('used to control the image used by QEMU')
	.addCommand(createImageCommand)
	.addCommand(prepareImageCommand)
	.addCommand(deleteImageCommand);

