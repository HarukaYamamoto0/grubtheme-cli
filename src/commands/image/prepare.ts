import { program } from 'commander';
import { expandPath } from '../../helpers/expandPath';
import chalk from 'chalk';
import { LoopDeviceDriver } from '../../structures/LoopDeviceDriver';
import type { VideoResolution } from '../../types';
import { DEFAULT_IMG_PATH, DEFAULT_IMG_PATH_EXTENDED } from '../../constants';
import { ImageDriver } from '../../structures/ImageDriver';
import { createGrubConfigFile } from '../../assets/grub-config-file';
import { rmSync } from 'node:fs';
import { debuglog } from 'node:util';

export const prepareCommand = program
	.command('prepare')
	.description('prepares the disk image by formatting it and installing GRUB2')
	.argument('[path]', 'optional path for the disk image to be created', DEFAULT_IMG_PATH)
	.option('-c, --config <config>', 'path to a custom grub.cfg file')
	.option('-r, --resolution <resolution>', 'resolution supported by the QEMU video adapter')
	.action(async (path: string, args: { config?: string; resolution?: string }) => {
		const imagePath = path ? expandPath(path) : DEFAULT_IMG_PATH_EXTENDED;

		const log = debuglog('image-prepare');

		const fileExists = await Bun.file(imagePath).exists();
		if (!fileExists) throw new Error('the specified disk image path does not exist: ' + imagePath);

		const imageDriver = new ImageDriver(imagePath);
		const loopDevice = new LoopDeviceDriver(imagePath);

		let filesystemMounted = false;

		log(chalk.gray('creating a bootable partition...'));
		await imageDriver.createBootablePartition();

		try {
			log(chalk.gray('setting up a loop device for the disk image: ' + imagePath));
			await loopDevice.mount();

			if (!loopDevice.device)
				throw new Error('failed to attach the loop device to the disk image at ' + imagePath);
			else log(chalk.green('loop device successfully attached ' + loopDevice.device));

			log(chalk.gray('formatting the disk image as EXT2...'));
			await imageDriver.formatToExt2(loopDevice.device);

			log(chalk.gray('mounting the disk image via loop device...'));
			await imageDriver.mount(loopDevice.device);
			filesystemMounted = true;

			log(chalk.gray('installing GRUB2...'));
			await loopDevice.installGrub();

			log(chalk.gray('copying the custom grub.cfg file into the disk image...'));
			if (args.config) await loopDevice.copyConfigFile(args.config);
			else {
				const configPath = await createGrubConfigFile();
				await loopDevice.copyConfigFile(configPath);
				rmSync(configPath, { recursive: true });
			}

			if (args.resolution) {
				if (!/^(?:auto|[1-9]\d*x[1-9]\d*(?:,auto)?)$/.test(args.resolution)) {
					throw new Error(`Invalid GRUB resolution: ${args.resolution}`);
				}

				log(chalk.gray(`setting the resolution to ${args.resolution} in the configuration file...`));
				await loopDevice.setGrubResolution(args.resolution as VideoResolution);
			}

			console.log(chalk.green('The disk image has been successfully prepared and is ready for a GRUB2 theme!'));
		} finally {
			try {
				if (filesystemMounted) {
					log(chalk.gray('unmounting EXT2 filesystem...'));
					await imageDriver.unmount();
				}
			} finally {
				if (loopDevice.device) {
					log(chalk.gray('detaching loop device...'));
					await loopDevice.unmount();
				}
			}
		}
	});
