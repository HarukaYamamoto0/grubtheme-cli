import {join} from "node:path";
import {homedir} from "node:os";
import {program} from "commander";
import {DEFAULT_IMG_PATH, ImageDriver,} from "../../structures/ImageDriver";
import {LoopDeviceDriver} from "../../structures/LoopDeviceDriver";
import {runner} from "../../core/runner";

export const prepareImageCommand = program
	.command('prepare')
	.description("prepare the image by formatting it and installing GRUB2")
	.argument("[imagePath]", "path to where the image is located", DEFAULT_IMG_PATH)
	.action(prepareImage)

export async function prepareImage(imagePath: string): Promise<void> {
	if (imagePath === DEFAULT_IMG_PATH) {
		imagePath = join(homedir(), DEFAULT_IMG_PATH)
	}
		
		await using imageDriver = new ImageDriver(imagePath, runner);
		await using loopDevice = new LoopDeviceDriver(imagePath)
	
	await imageDriver.createBootablePartition()
	await loopDevice.mount()
	await imageDriver.formatToExt2(loopDevice.device!)
	await imageDriver.mount()
	await loopDevice.installGrub()
}