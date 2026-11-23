import type { IImageDriver } from '../core/IImageDriver';
import { type Runner, runner as run } from '../core/runner';
import { rmSync } from 'node:fs';
import { ImageFormat, ImageSize, QemuImg } from 'qemu-img-ts';
import type { Device } from '../types';
import { DEFAULT_IMG_PATH, MOUNT_POINT_FOLDER } from '../constants';

// TODO: This class currently uses lazy initialization.
// Consider mounting the image eagerly to avoid repeated state checks
// required by TypeScript's type system.

export class ImageDriver implements IImageDriver, AsyncDisposable {
	public isMounted: boolean = false;

	constructor(
		public imagePath: string = DEFAULT_IMG_PATH,
		private shell: Runner = run,
	) {}

	async create(): Promise<void> {
		const qemuImg = new QemuImg();

		await qemuImg.create({
			format: ImageFormat.RAW,
			filename: this.imagePath,
			size: ImageSize.mb(64),
		});
	}

	delete(): void {
		rmSync(this.imagePath, { recursive: true });
	}

	async mount(device: Device): Promise<void> {
		await this.shell(['sudo', 'mkdir', '-p', MOUNT_POINT_FOLDER]);

		await this.shell(['sudo', 'mount', `${device}p1`, MOUNT_POINT_FOLDER]);
		this.isMounted = true;
	}

	async unmount(): Promise<void> {
		if (!this.isMounted) return;

		await this.shell(['sudo', 'umount', MOUNT_POINT_FOLDER]);
		this.isMounted = false;
	}

	async formatToExt2(device: Device): Promise<void> {
		await this.shell(['sudo', 'mkfs.ext2', `${device}p1`]);
	}

	async createBootablePartition(): Promise<void> {
		await this.shell([
			'parted',
			this.imagePath,
			'--script',
			'mklabel',
			'msdos',
			'mkpart',
			'primary',
			'ext2',
			'1MiB',
			'100%',
			'set',
			'1',
			'boot',
			'on',
		]);
	}

	async [Symbol.asyncDispose](): Promise<void> {
		if (!this.isMounted) return;
		await this.unmount();
	}
}
