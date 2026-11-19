import { program } from 'commander';
import { DEFAULT_IMG_PATH_EXTENDED, ImageDriver } from '../structures/ImageDriver';
import { LoopDeviceDriver } from '../structures/LoopDeviceDriver';
import { expandPath } from '../helpers/expandPath';
import type { VideoResolution } from '../types';
import { runQemu } from '../core/runQemu';

export const previewCommand = program
	.command('preview')
	.description('use QEMU to boot a minimal VM in order to test a GRUB theme')
	.argument('<path>', 'path to theme')
	.option('-i, --image <path>', 'path to a prepared disk image ready for use with QEMU')
	.option('-c, --config <config>', 'path to a custom grub.cfg file')
	.option('-r, --resolution <resolution>', 'resolution supported by the QEMU video adapter')
	.action(async (path: string, args: { image?: string; config?: string; resolution?: string }) => {
		const themeDirectory = expandPath(path);
		const imagePath = args.image ? expandPath(args.image) : DEFAULT_IMG_PATH_EXTENDED;

		const imageDriver = new ImageDriver(imagePath);
		const loopDevice = new LoopDeviceDriver(imagePath);

		let filesystemMounted = false;

		try {
			await loopDevice.mount();
			filesystemMounted = true;

			if (!loopDevice.device) throw new Error('The device was not mounted correctly');
			await imageDriver.mount(loopDevice.device);

			if (args.config) await loopDevice.copyConfigFile(expandPath(args.config));

			// TODO: Restore this flag to its original state after execution.
			// However, the disk image must be unmounted before launching QEMU
			// to avoid concurrent access to the underlying filesystem.
			if (args.resolution) await loopDevice.setGrubResolution(args.resolution as VideoResolution);

			await loopDevice.copyTheme(themeDirectory);
		} finally {
			try {
				if (filesystemMounted) {
					await imageDriver.unmount();
				}
			} finally {
				if (loopDevice.device) {
					await loopDevice.unmount();
				}
			}
		}

		await runQemu(imagePath);
	});
