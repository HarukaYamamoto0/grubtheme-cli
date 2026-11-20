import type { Device } from '../types';

export interface ILoopDeviceDriver {
	mount(path?: string): Promise<Device>;
	unmount(device?: Device): Promise<void>;
	installGrub(): Promise<void>;
}
