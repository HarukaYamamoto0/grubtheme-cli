import { runner } from './runner';

export async function runQemu(imagePath: string): Promise<void> {
	// TODO: make better optimizations for QEMU
	await runner([
		'qemu-system-x86_64',
		'-display',
		'gtk,full-screen=on,zoom-to-fit=on,show-menubar=on,grab-on-hover=on',
		'-m',
		'128M',
		'-drive',
		`file=${imagePath},format=raw`,
	]);
}
