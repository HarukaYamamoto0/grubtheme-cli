import { type Runner, runner as run } from '../core/runner';
import type { ILoopDeviceDriver } from '../core/ILoopDeviceDriver';
import { MOUNT_POINT_FOLDER } from './ImageDriver';
import type { Path } from '../index';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import type { Device, VideoResolution } from '../types';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export const DEFAULT_CONFIG_PATH = './src/assets/grub-mock.cfg';

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

	async copyConfigFile(path?: Path): Promise<void> {
		if (!this.device) throw new Error('There is no open device in this instance');
		const configPath = path ? path : DEFAULT_CONFIG_PATH;

		const file = Bun.file(configPath);
		const fileExist = await file.exists();

		if (!fileExist) throw new Error('the provided configuration file does not exist: ' + configPath);

		await this.shell(['sudo', 'cp', configPath, `${MOUNT_POINT_FOLDER}/boot/grub/grub.cfg`]);
	}

	async copyTheme(themeDirectory: Path): Promise<void> {
		if (!this.device) throw new Error('There is no open device in this instance');
		if (!existsSync(themeDirectory))
			throw new Error('the provided theme directory does not exist: ' + themeDirectory);

		// delete the themes folder to avoid resource conflicts
		await this.shell(['sudo', 'rm', '-rf', `${MOUNT_POINT_FOLDER}/boot/grub/themes/current-theme`]);
		await this.shell(['sudo', 'mkdir', '-p', `${MOUNT_POINT_FOLDER}/boot/grub/themes/current-theme`]);

		await this.shell([
			'sudo',
			'cp',
			'-r',
			`${themeDirectory}/.`, // copy only content
			`${MOUNT_POINT_FOLDER}/boot/grub/themes/current-theme/`,
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

		const tempDir = mkdtempSync(join(tmpdir(), 'grubtheme-'));
		const tempConfigPath = join(tempDir, 'grub.cfg');

		try {
			const configFile = Bun.file(`${MOUNT_POINT_FOLDER}/boot/grub/grub.cfg`);
			const content = await configFile.text();

			const pattern = /^([ \t]*set[ \t]+gfxmode[ \t]*=[ \t]*)[^\r\n]*$/gm;
			const matches = [...content.matchAll(pattern)];

			if (matches.length !== 1) {
				throw new Error(`Expected exactly one gfxmode declaration, found ${matches.length}`);
			}

			const updated = content.replace(pattern, (_, prefix: string) => `${prefix}${resolution}`);

			await Bun.write(tempConfigPath, updated);

			await this.shell(['sudo', 'cp', tempConfigPath, `${MOUNT_POINT_FOLDER}/boot/grub/grub.cfg`]);
		} finally {
			rmSync(tempDir, { recursive: true, force: true });
		}
	}

	async [Symbol.asyncDispose](): Promise<void> {
		if (!this.device) return;
		await this.unmount();
	}
}
