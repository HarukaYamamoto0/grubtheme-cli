import {program} from 'commander';
import {runner} from "../core/runner";
import {DEFAULT_IMG_PATH, ImageDriver} from "../structures/ImageDriver";
import {LoopDeviceDriver} from "../structures/LoopDeviceDriver";

export const previewCommand = program
	.command('preview')
	.description('use QEMU to boot a minimal VM in order to test a GRUB theme')
	.argument("<path>", "path to theme")
	.argument("[configFile]", "path to grub.cfg")
	.action(async (path: string, configFile?: string) => {
		try {
			const imageDriver = new ImageDriver(DEFAULT_IMG_PATH)
			await imageDriver.create()
			await imageDriver.createBootablePartition()
			
			const loopDevice = new LoopDeviceDriver(DEFAULT_IMG_PATH)
			await loopDevice.mount()
			await imageDriver.formatToExt2(loopDevice.device!)
			
			await imageDriver.mount(loopDevice.device!)
			await loopDevice.installGrub()
			await loopDevice.copyConfigFile(configFile)
			await loopDevice.copyTheme(path)
			
			await imageDriver.unmount()
			await loopDevice.unmount()
			
			await runner([
				"qemu-system-x86_64",
				'-full-screen',
				'-display', 'gtk,full-screen=on,zoom-to-fit=on,show-menubar=off,grab-on-hover=on',
				'-m',
				"128M",
				'-drive',
				`file=${DEFAULT_IMG_PATH},format=raw`
			]);
		} catch (error: unknown) {
			if (error instanceof SuppressedError) {
				console.error("Latest error:", error.error);
				console.error("Previous error:", error.suppressed);
			} else {
				console.error(error);
			}
			
			process.exitCode = 1;
		}
	});

