import {program} from 'commander';
import {ImageFormat, ImageSize, QemuImg} from "qemu-img-ts";
import {DiskDriver} from "../drivers/disk";
import {LoopDeviceDriver} from "../drivers/loopDevice";
import {Formatter} from "../drivers/formatter";
import {runner} from "../core/runner";

export const previewCommand = program
	.command('preview')
	.description('use QEMU to boot a minimal VM in order to test a GRUB theme')
	.argument("<path>", "path to theme")
	.argument("<configFile>", "path to grub.cfg")
	.action(async (path: string, configFile: string) => {
		const qemuImg = new QemuImg()
		const pathToImage = "./grub-test.img"
		
		await qemuImg.create({
			filename: pathToImage,
			format: ImageFormat.RAW,
			size: ImageSize.mb(64)
		})
		
		await DiskDriver.createBootablePartition(pathToImage)
		const loop = await LoopDeviceDriver.createLoopDevice(pathToImage)
		
		await Formatter.toEXT2(loop)
		await LoopDeviceDriver.mount(loop);
		
		// install grub
		await runner([
			"sudo",
			"grub-install",
			"--target=i386-pc",
			"--boot-directory=/mnt/grub-qemu-mounted/boot",
			loop
		])
		
		// copy grub.cfg
		await runner([
			"sudo",
			"cp",
			configFile,
			`/mnt/grub-qemu-mounted/boot/grub/grub.cfg`
		])
		
		await runner([
			"sudo", "mkdir",
			"-p",
			"/mnt/grub-qemu-mounted/boot/grub/themes/current-theme",
		]);
		
		// copy theme
		await runner([
			"sudo", "cp",
			"-r",
			`${path}/.`,
			"/mnt/grub-qemu-mounted/boot/grub/themes/current-theme/",
		]);
		
		await LoopDeviceDriver.unmount(loop)
		await LoopDeviceDriver.detachLoopDevice(loop)
		
		// qemu-system-x86_64 \
		//     -m 128M \
		//     -drive file=grub-test.img,format=raw
		
		await runner([
			"qemu-system-x86_64",
			'-m',
			"128M",
			'-drive',
			`file=grub-test.img,format=raw`
		]);
		console.log('preview command');
	});

