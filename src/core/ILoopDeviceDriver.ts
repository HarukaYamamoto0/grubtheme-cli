import type {Device} from "../drivers/loopDeviceDriver";

export interface ILoopDeviceDriver {
	mount(path?: string): Promise<Device>
	
	unmount(device?: Device): Promise<void>
	installGrub(): Promise<void>
}