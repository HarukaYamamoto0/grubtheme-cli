import type { Device } from '../structures/LoopDeviceDriver';

export interface IImageDriver {
	// criar o arquivo imagem
	create(): Promise<void>;

	// deleta o arquivo de image
	delete(): void;

	// monta a imagem e seu filesystem
	mount(device: Device): Promise<void>;

	// desmonta a imagem e seu filesystem
	unmount(): Promise<void>;

	// cria a tabela MBR e a partição de boot
	createBootablePartition(): Promise<void>;

	// formata o loop device como
	formatToExt2(device: Device): Promise<void>;
}
