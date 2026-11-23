import { program } from 'commander';
import { ImageDriver } from '../structures/ImageDriver';
import { LoopDeviceDriver } from '../structures/LoopDeviceDriver';
import { expandPath } from '../helpers/expandPath';
import type { VideoResolution } from '../types';
import { runQemu } from '../core/runQemu';
import { DEFAULT_IMG_PATH_EXTENDED } from '../constants';
import { Logger } from '../structures/Logger';
import { stdoutWrite } from '../helpers/iolog';

export const previewCommand = program
	.command('preview')
	.description('use QEMU to boot a minimal VM in order to test a GRUB theme')
	.argument('<path>', 'path to theme')
	.option('-i, --image <path>', 'path to a prepared disk image ready for use with QEMU')
	.option('-c, --config <config>', 'path to a custom grub.cfg file')
	.option('-r, --resolution <resolution>', 'resolution supported by the QEMU video adapter')
	.option('-v, --verbose', 'enable verbose logging')
	.action(previewCommandAction);

export async function previewCommandAction(
	path: string,
	options: { image?: string; config?: string; verbose: boolean; resolution: string },
): Promise<void> {
	const log = new Logger('command:preview', options.verbose);

	const themeDirectory = expandPath(path);
	log.trace(`resolved theme path: ${themeDirectory}`);

	const imagePath = options.image ? expandPath(options.image) : DEFAULT_IMG_PATH_EXTENDED;
	log.trace(`resolved image path: ${imagePath}`);

	const imageDriver = new ImageDriver(imagePath);
	const loopDevice = new LoopDeviceDriver(imagePath);

	let filesystemMounted = false;

	try {
		log.trace('mounting the loop device...');
		await loopDevice.mount();
		if (!loopDevice.device) throw new Error('the device was not mounted correctly');
		log.info(`loop device mounted at ${loopDevice.device}`);

		log.trace('mounting the image disk...');
		await imageDriver.mount(loopDevice.device);
		filesystemMounted = true;
		log.info(`disk image mounted`);

		if (options.config) {
			log.trace(`copying the custom configuration file from ${options.config}`);
			await loopDevice.copyConfigFile(expandPath(options.config));
		}

		if (options.resolution) {
			// TODO: Restore this flag to its original state after execution.
			// However, the disk image must be unmounted before launching QEMU
			// to avoid concurrent access to the underlying filesystem.

			log.trace(`setting the video resolution to ${options.resolution}...`);
			await loopDevice.setGrubResolution(options.resolution as VideoResolution);
		}

		log.trace(`copying the theme from ${themeDirectory}`);
		await loopDevice.copyTheme(themeDirectory);
	} finally {
		try {
			if (filesystemMounted) {
				log.trace(`unmounting image ${imagePath}`);
				await imageDriver.unmount();
			}
		} finally {
			if (loopDevice.device) {
				log.trace(`unmounting loop device ${loopDevice.device}`);
				await loopDevice.unmount();
			}
		}
	}

	log.info('launching QEMU'); // a minor redundancy to account for cases where stderr is separated from stdout
	stdoutWrite('launching QEMU');
	await runQemu(imagePath);
}
