import { program } from 'commander';
import { runQemu } from '../core/runQemu';
import { expandPath } from '../helpers/expandPath';
import { DEFAULT_IMG_PATH } from '../constants';

export const bootCommand = program
	.command('boot')
	.description('simply launch QEMU using an existing disk image')
	.argument('[path]', 'path to a prepared disk image ready for use with QEMU')
	.action(bootCommandAction);

export async function bootCommandAction(path?: string): Promise<void> {
	const imagePath = path ? expandPath(path) : DEFAULT_IMG_PATH;

	await runQemu(imagePath);
}
