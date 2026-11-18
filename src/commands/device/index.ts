import {program} from "commander";
import {mountDeviceCommand} from "./mountDeviceCommand";
import {unmountDeviceCommand} from "./unmountDeviceCommand";

export const deviceCommand = program
	.command('image')
	.description('used to control the image used by QEMU')
	.addCommand(mountDeviceCommand)
	.addCommand(unmountDeviceCommand)