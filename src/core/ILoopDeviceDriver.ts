import type { Device } from '../structures/LoopDeviceDriver';

export interface ILoopDeviceDriver {
	mount(path?: string): Promise<Device>;

	unmount(device?: Device): Promise<void>;
	installGrub(): Promise<void>;
}
