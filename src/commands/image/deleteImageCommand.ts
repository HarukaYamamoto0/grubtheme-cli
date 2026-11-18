import {program} from "commander";
import {rmSync} from "node:fs";
import {join} from "node:path";
import {homedir} from "node:os";
import {DEFAULT_IMG_FILENAME, DEFAULT_IMG_FOLDER} from "../../structures/ImageDriver";

export const deleteImageCommand = program
	.command('delete')
	.description(`delete the image at the path ${DEFAULT_IMG_FOLDER}`)
	.action(deleteImage)

/**
 * Deletes the default image file from the configured directory in the user's home folder.
 *
 * @return A promise that resolves when the image has been deleted.
 */
export async function deleteImage(): Promise<void> {
	const path = join(homedir(), DEFAULT_IMG_FOLDER, DEFAULT_IMG_FILENAME)
	rmSync(path)
	
	console.log(`Image deleted: ${path}`)
}