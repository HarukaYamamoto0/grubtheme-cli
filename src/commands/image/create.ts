import { program } from 'commander';
import { ImageFormat, ImageSize, QemuImg } from 'qemu-img-ts';
import { expandPath } from '../../helpers/expandPath';
import { DEFAULT_IMG_PATH, DEFAULT_IMG_PATH_EXTENDED } from '../../constants';
import { Logger } from '../../structures/Logger';
import { stdoutWrite } from '../../helpers/iolog';

export const createCommand = program
	.command('create')
	.description('create a disk image to be used by QEMU')
	.argument('[path]', 'optional path for the disk image to be created', DEFAULT_IMG_PATH)
	.option('-v, --verbose', 'enable verbose logging', false)
	.action(createCommandAction);

export async function createCommandAction(path: string, options: { verbose: boolean }): Promise<void> {
	const log = new Logger('command:image:create', options.verbose);

	const imagePath = path === DEFAULT_IMG_PATH_EXTENDED ? DEFAULT_IMG_PATH_EXTENDED : expandPath(path);
	log.trace(`the disk image path will be ${imagePath}`);

	const qemuImg = new QemuImg();

	log.trace('creating the disk image');
	await qemuImg.create({
		format: ImageFormat.RAW,
		filename: imagePath,
		size: ImageSize.mb(64),
	});
	log.info('the disk image was created successfully');

	stdoutWrite(`disk image successfully created at ${imagePath}`);
}
