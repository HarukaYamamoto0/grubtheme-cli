import {runner} from "../core/runner";

export class LoopDeviceDriver {
	static async createLoopDevice(path: string): Promise<string> {
		const loop = await runner([
			"sudo",
			"losetup",
			"--find",
			"--show",
			"--partscan",
			path,
		]);
		
		return loop.trim();
	}
	
	static async detachLoopDevice(device: string): Promise<void> {
		await runner([
			"sudo", "losetup",
			"--detach",
			device,
		]);
	}
	
	static async mount(device: string): Promise<void> {
		await runner([
			"sudo", "mkdir",
			"-p",
			"/mnt/grub-qemu-mounted",
		]);
		
		await runner([
			"sudo", "mount",
			`${device}p1`,
			"/mnt/grub-qemu-mounted",
		]);
	}
	
	static async unmount(device: string): Promise<void> {
		await runner([
			"sudo", "umount",
			`${device}p1`,
		]);
	}
}