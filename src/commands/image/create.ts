import { program } from 'commander';
import { ImageFormat, ImageSize, QemuImg } from 'qemu-img-ts';
import { expandPath } from '../../helpers/expandPath';
import chalk from 'chalk';
import { DEFAULT_IMG_PATH, DEFAULT_IMG_PATH_EXTENDED } from '../../constants';

export const createCommand = program
	.command('create')
	.description('create a disk image to be used by QEMU')
	.argument('[path]', 'optional path for the disk image to be created', DEFAULT_IMG_PATH)
	.action(async (path?: string) => {
		const imagePath = path ? expandPath(path) : DEFAULT_IMG_PATH_EXTENDED;

		const qemuImg = new QemuImg();

		await qemuImg.create({
			format: ImageFormat.RAW,
			filename: imagePath,
			size: ImageSize.mb(64),
		});

		console.log(chalk.green(`disk image successfully created at ${imagePath}`));
	});
