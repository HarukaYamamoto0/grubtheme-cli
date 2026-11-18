import {program} from "commander";
import {DEFAULT_IMG_FILENAME, DEFAULT_IMG_FOLDER, ImageDriver} from "../../structures/ImageDriver";
import type {IImageDriver} from "../../core/IImageDriver";

export const createImageCommand = program
	.command('create')
	.description("creates an offline disk image in RAW format for use with QEMU")
	.argument("[path]", "path where the image should be stored", DEFAULT_IMG_FOLDER)
	// .option("-s, --size [size]", "image size, kilo = k, mega = M, giga = G, tera = T, peta = P and exa = E", "64M")
	.action(async (pathToDirectory: string) => {
		await createImage(pathToDirectory)
	})

export async function createImage(pathToDirectory: string = DEFAULT_IMG_FOLDER, filename: string = DEFAULT_IMG_FILENAME): Promise<IImageDriver> {
	const imageDriver = new ImageDriver(pathToDirectory, filename)
	await imageDriver.create()
	
	return imageDriver
}