import {program} from "commander";
import {runner} from "../core/runner";
import {ImageFormat} from "qemu-img-ts";
import {MemorySize} from "../core/MemorySize";

export const previewCommand = program
	.command('preview')
	.description('use QEMU to boot a minimal VM in order to test a GRUB theme')
	.option('-m, --memory <size>', 'memory size in megabytes', MemorySize.mb(64).toString())
	.option('-i, --image <path>', 'path to the image to boot')
	.option('-f, --format <image-format>', 'image format', ImageFormat.RAW)
	.action(async (args: { image?: string, memory?: string, format?: ImageFormat }) => {
		await runner([
			'-m', args.memory ? args.memory : MemorySize.mb(64).toString(),
			'-drive', `file=${args.image ? args.image : 'grub-test.img'},format=${args.format ? args.format : ImageFormat.RAW}`,
			// `-display gtk`
		]);
		console.log('preview command');
	})

// qemu-system-x86_64 -m 128M -drive file=grub-test.img,format=raw -display gtk
