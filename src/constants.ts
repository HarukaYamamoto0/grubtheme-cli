import { join } from 'node:path';
import { expandPath } from './helpers/expandPath';

// Image
export const DEFAULT_IMG_FOLDER = '~/.local/share/grubtheme/images';
export const DEFAULT_IMG_FILENAME = 'preview.img';
export const DEFAULT_IMG_PATH = join(DEFAULT_IMG_FOLDER, DEFAULT_IMG_FILENAME);
export const DEFAULT_IMG_PATH_EXTENDED = join(expandPath(DEFAULT_IMG_FOLDER), DEFAULT_IMG_FILENAME);

export const MOUNT_POINT_FOLDER = '/mnt/grub-qemu-mounted';
export const OUTPUT_THEME_PATH = `${MOUNT_POINT_FOLDER}/boot/grub/themes/current-theme`;
