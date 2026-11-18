import {type Runner, runner as run} from "../core/runner";
import type {ILoopDeviceDriver} from "../core/ILoopDeviceDriver";
import {MOUNT_POINT_FOLDER} from "./ImageDriver";
import type {Path} from "../index";
import {expandPath} from "../helpers/expandPath";
import { existsSync} from "node:fs";

export type Device = `/dev/loop${number}`

export class LoopDeviceDriver implements ILoopDeviceDriver, AsyncDisposable {
	public device: Device | undefined
	
	constructor(
		public imagePath: string,
		private shell: Runner = run
	) {
	
	}
	
	async mount(): Promise<Device> {
		const device = await this.shell(["sudo", "losetup", "--find", "--show", "--partscan", this.imagePath]);
		this.device = device.trim() as Device
		
		return this.device
	}
	
	async unmount(): Promise<void> {
		if (!this.device) throw new Error("There is no open device in this instance")
		
		await this.shell(["sudo", "losetup", "-d", this.device]);
	}
	
	async installGrub(): Promise<void> {
		if (!this.device) throw new Error("There is no open device in this instance")
		
		await this.shell([
			"sudo",
			"grub-install",
			"--target=i386-pc",
			`--boot-directory=${MOUNT_POINT_FOLDER}/boot`,
			this.device
		]);
	}
	
	async copyConfigFile(configPath?: Path): Promise<void> {
		if (!this.device) throw new Error("There is no open device in this instance")
		if (!configPath) configPath = "./src/assets/grub-mock.cfg"
		
		const file = Bun.file(configPath)
		const fileExist = await file.exists()
		
		if (!fileExist) throw new Error("the provided configuration file does not exist: " + configPath)
		
		await this.shell([
			"sudo",
			"cp",
			expandPath(configPath),
			`${MOUNT_POINT_FOLDER}/boot/grub/grub.cfg`
		])
	}
	
	async copyTheme(themeDirectory: Path) {
		if (!this.device) throw new Error("There is no open device in this instance")
		if (!existsSync(themeDirectory)) throw new Error("the provided theme directory does not exist: " + themeDirectory)
		
		await this.shell([
			"sudo", "mkdir",
			"-p",
			`${MOUNT_POINT_FOLDER}/boot/grub/themes/current-theme`
		]);
		
		await this.shell([
			"sudo", "cp",
			"-r",
			`${themeDirectory}/.`, // copy only content
			`${MOUNT_POINT_FOLDER}/boot/grub/themes/current-theme/`
		]);
		
	}
	
	async [Symbol.asyncDispose](): Promise<void> {
		if (!this.device) return;
		await this.unmount()
	}
}