import {runner} from "../core/runner";

export class Formatter {
	static async toEXT2(device: string) {
		await runner([
			"sudo", "mkfs.ext2",
			`${device}p1`,
		]);
	}
}