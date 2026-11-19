import type { Device } from '../types';

export interface IImageDriver {
	// Creates the disk image file.
	create(): Promise<void>;

	// Deletes the disk image file.
	delete(): void;

	// Mounts the disk image and its filesystem.
	mount(device: Device): Promise<void>;

	// Unmounts the disk image and its filesystem.
	unmount(): Promise<void>;

	// Creates an MBR partition table and a bootable partition.
	createBootablePartition(): Promise<void>;

	// Formats the loop device with an EXT2 filesystem.
	formatToExt2(device: Device): Promise<void>;
}
