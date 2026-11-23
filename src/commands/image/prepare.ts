import { program } from 'commander';
import { expandPath } from '../../helpers/expandPath';
import { LoopDeviceDriver } from '../../structures/LoopDeviceDriver';
import type { VideoResolution } from '../../types';
import { DEFAULT_IMG_PATH, DEFAULT_IMG_PATH_EXTENDED } from '../../constants';
import { ImageDriver } from '../../structures/ImageDriver';
import { createGrubConfigFile } from '../../assets/grub-config-file';
import { existsSync, rmSync } from 'node:fs';
import { Logger } from '../../structures/Logger';
import { stdoutWrite } from '../../helpers/iolog';

export const prepareCommand = program
	.command('prepare')
	.description('prepares the disk image by formatting it and installing GRUB2')
	.argument('[path]', 'optional path for the disk image to be created', DEFAULT_IMG_PATH)
	.option('-c, --config <config>', 'path to a custom grub.cfg file')
	.option('-r, --resolution <resolution>', 'resolution supported by the QEMU video adapter')
	.option('-v, --verbose', 'enable verbose logging', false)
	.action(prepareCommandAction);

export async function prepareCommandAction(
	path: string,
	options: { config?: string; resolution?: string; verbose: boolean },
): Promise<void> {
	const log = new Logger(`command:${prepareCommand.name()}`, options.verbose);
	const imagePath = path ? expandPath(path) : DEFAULT_IMG_PATH_EXTENDED;

	if (!existsSync(imagePath)) throw new Error(`the specified disk image path does not exist: ${imagePath}`);

	const imageDriver = new ImageDriver(imagePath);
	const loopDevice = new LoopDeviceDriver(imagePath);

	let filesystemMounted = false;

	log.trace('creating a bootable partition');
	await imageDriver.createBootablePartition();

	try {
		log.trace(`setting up a loop device for the disk image: ${imagePath}`);
		await loopDevice.mount();

		if (!loopDevice.device) throw new Error(`failed to attach the loop device to the disk image at ${imagePath}`);
		else log.trace(`loop device successfully attached ${loopDevice.device}`);

		log.trace('formatting the disk image as EXT2');
		await imageDriver.formatToExt2(loopDevice.device);

		log.trace('mounting the disk image via loop device');
		await imageDriver.mount(loopDevice.device);
		filesystemMounted = true;

		log.trace('installing GRUB2...');
		await loopDevice.installGrub();

		log.trace('copying the custom grub.cfg file into the disk image');
		if (options.config) await loopDevice.copyConfigFile(options.config);
		else {
			const configPath = await createGrubConfigFile();
			await loopDevice.copyConfigFile(configPath);
			rmSync(configPath, { recursive: true });
		}

		if (options.resolution) {
			if (!/^(?:auto|[1-9]\d*x[1-9]\d*(?:,auto)?)$/.test(options.resolution)) {
				throw new Error(`Invalid GRUB resolution: ${options.resolution}`);
			}

			log.trace(`setting the video resolution to ${options.resolution}...`);
			await loopDevice.setGrubResolution(options.resolution as VideoResolution);
		}
	} finally {
		try {
			if (filesystemMounted) {
				log.trace(`unmounting EXT2 filesystem from ${imageDriver.imagePath}`);
				await imageDriver.unmount();
			}
		} finally {
			if (loopDevice.device) {
				log.trace(`detaching loop device ${loopDevice.device}`);
				await loopDevice.unmount();
			}
		}
	}

	stdoutWrite('disk image prepared successfully.');
}
