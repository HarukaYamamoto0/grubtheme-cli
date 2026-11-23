import { type Runner, runner as run } from '../core/runner';
import type { ILoopDeviceDriver } from '../core/ILoopDeviceDriver';
import { existsSync, rmSync } from 'node:fs';
import type { Device, VideoResolution } from '../types';
import { createGrubConfigFile } from '../assets/grub-config-file';
import { MOUNT_POINT_FOLDER, OUTPUT_THEME_PATH } from '../constants';

// TODO: This class currently uses lazy initialization.
// Consider mounting the image eagerly to avoid repeated state checks
// required by TypeScript's type system.

export class LoopDeviceDriver implements ILoopDeviceDriver, AsyncDisposable {
	public device: Device | undefined;

	constructor(
		public imagePath: string,
		private shell: Runner = run,
	) {}

	async mount(): Promise<Device> {
		const device = await this.shell(['sudo', 'losetup', '--find', '--show', '--partscan', this.imagePath]);
		this.device = device.trim() as Device;

		return this.device;
	}

	async unmount(): Promise<void> {
		if (!this.device) throw new Error('There is no open device in this instance');

		await this.shell(['sudo', 'losetup', '-d', this.device]);
	}

	async installGrub(): Promise<void> {
		if (!this.device) throw new Error('There is no open device in this instance');

		await this.shell([
			'sudo',
			'grub-install',
			'--target=i386-pc',
			`--boot-directory=${MOUNT_POINT_FOLDER}/boot`,
			this.device,
		]);
	}

	async copyConfigFile(configPath: string): Promise<void> {
		if (!this.device) throw new Error('There is no open device in this instance');

		const file = Bun.file(configPath);
		const fileExist = await file.exists();

		if (!fileExist) throw new Error('the provided configuration file does not exist: ' + configPath);

		await this.shell(['sudo', 'cp', configPath, `${MOUNT_POINT_FOLDER}/boot/grub/grub.cfg`]);
	}

	async copyTheme(themeDirectory: string): Promise<void> {
		if (!this.device) throw new Error('There is no open device in this instance');
		if (!existsSync(themeDirectory))
			throw new Error('the provided theme directory does not exist: ' + themeDirectory);

		// delete the themes folder to avoid resource conflicts
		await this.shell(['sudo', 'rm', '-rf', OUTPUT_THEME_PATH]);
		await this.shell(['sudo', 'mkdir', '-p', OUTPUT_THEME_PATH]);

		await this.shell([
			'sudo',
			'cp',
			'-r',
			`${themeDirectory}/.`, // copy only content
			OUTPUT_THEME_PATH,
		]);
	}

	/**
	 * Updates the GRUB gfxmode setting in the mounted GRUB configuration file.
	 *
	 * @param resolution - The GRUB video resolution to set, either "auto", a WIDTHxHEIGHT value, or WIDTHxHEIGHT followed by ",auto".
	 * @return A promise that resolves when the GRUB configuration has been updated.
	 * @throws If the resolution format is invalid.
	 * @throws If the GRUB configuration does not contain exactly one gfxmode declaration.
	 */
	async setGrubResolution(resolution: VideoResolution): Promise<void> {
		if (!/^(?:auto|[1-9]\d*x[1-9]\d*(?:,auto)?)$/.test(resolution)) {
			throw new Error(`Invalid GRUB resolution: ${resolution}`);
		}

		const configFile = Bun.file(`${MOUNT_POINT_FOLDER}/boot/grub/grub.cfg`);
		const content = await configFile.text();

		const configFileTempPath = await createGrubConfigFile({ content, resolution });

		await this.shell(['sudo', 'cp', configFileTempPath, `${MOUNT_POINT_FOLDER}/boot/grub/grub.cfg`]);

		rmSync(configFileTempPath, { recursive: true });
	}

	async [Symbol.asyncDispose](): Promise<void> {
		if (!this.device) return;
		await this.unmount();
	}
}
