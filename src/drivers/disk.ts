import {runner} from "../core/runner";

export class DiskDriver {
	static async createBootablePartition(path: string) {
		await runner([
			"parted",
			path,
			"--script",
			"mklabel", "msdos",
			"mkpart", "primary", "ext2", "1MiB", "100%",
			"set", "1", "boot", "on",
		]);
	}
}