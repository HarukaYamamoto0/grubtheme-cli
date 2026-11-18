import type {IImageDriver} from "../core/IImageDriver";
import {type Runner, runner as run} from "../core/runner"
import {join} from "node:path";
import {rmSync} from "node:fs";
import {ImageFormat, ImageSize, QemuImg} from "qemu-img-ts";
import type {Device} from "./LoopDeviceDriver";
import {homedir} from "node:os";

export const DEFAULT_IMG_FOLDER = ".local/share/grubtheme/images"
export const DEFAULT_IMG_FILENAME = "preview.img"
export const DEFAULT_IMG_PATH = join(homedir(), DEFAULT_IMG_FOLDER, DEFAULT_IMG_FILENAME)
export const MOUNT_POINT_FOLDER = "/mnt/grub-qemu-mounted"

export class ImageDriver implements IImageDriver, AsyncDisposable {
	public isMounted: boolean = false
	
	constructor(
		public imagePath: string = DEFAULT_IMG_PATH,
		private shell: Runner = run
	) {
	
	}
	
	async create(): Promise<void> {
		const qemuImg = new QemuImg
		
		await qemuImg.create({
			format: ImageFormat.RAW,
			filename: this.imagePath,
			size: ImageSize.mb(64),
		});
		
		this.isMounted = true
	}
	
	async delete(): Promise<void> {
		rmSync(this.imagePath, {recursive: true})
	}
	
	async mount(device: Device): Promise<void> {
		await this.shell([
			"sudo", "mkdir", "-p", MOUNT_POINT_FOLDER
		])
		
		await this.shell([
			"sudo", "mount", `${device}p1`, MOUNT_POINT_FOLDER
		])
	}
	
	async unmount(): Promise<void> {
		await this.shell([
			"sudo", "umount", MOUNT_POINT_FOLDER
		])
		this.isMounted = false
	}
	
	async formatToExt2(device: Device): Promise<void> {
		await this.shell(["sudo", "mkfs.ext2", `${device}p1`]);
	}
	
	async createBootablePartition(): Promise<void> {
		await this.shell([
			"parted",
			this.imagePath,
			"--script",
			"mklabel", "msdos",
			"mkpart", "primary", "ext2", "1MiB", "100%",
			"set", "1", "boot", "on",
		]);
	}
	
	async [Symbol.asyncDispose](): Promise<void> {
		if (!this.isMounted) return;
		await this.unmount()
	}
}