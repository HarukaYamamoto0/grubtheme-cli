import { Option, program } from 'commander';
import { QemuImg, ImageFormat, ImageSize } from 'qemu-img-ts';

const qemu = new QemuImg();

export const createImageCommand = program
	.command('create')
	.addOption(
		new Option('-f, --format <format>', 'format of image')
			.choices([ImageFormat.RAW, ImageFormat.QCOW2, ImageFormat.VDI, ImageFormat.VHDX, ImageFormat.VMDK])
			.default(ImageFormat.RAW),
	)
	.option('-n, --filename <filename>', 'name of the file to be generated')
	.action(async (args: { format: ImageFormat; filename?: string }) => {
		try {
			await qemu.create({
				format: args.format,
				filename: args.filename ? args.filename : 'grub-test.img',
				size: ImageSize.mb(64),
			});
			console.log('Creating image');
		} catch (error) {
			console.error('Error creating image: ', error);
		}
	});

export const deleteImageCommand = program.command('delete').action(() => {
	Bun.gc();
	console.log('Delete image');
});

export const imageCommand = program
	.command('image')
	.description('used to control the image used by QEMU')
	.addCommand(createImageCommand)
	.addCommand(deleteImageCommand);
