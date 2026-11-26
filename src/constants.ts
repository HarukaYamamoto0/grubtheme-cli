import { join } from 'node:path';
import envPaths from 'env-paths';

// The env-paths package is used to resolve OS-specific paths.
// Although only Linux is currently supported, defining these constants
// this way from the start will minimize future refactoring when adding
// support for other operating systems.

export const APP_NAME = 'grubtheme';
export const APP_PATHS = envPaths(APP_NAME, {
	suffix: '',
});

export const DATA_DIR = APP_PATHS.data;
export const TEMP_DIR = APP_PATHS.temp;
// export const CONFIG_DIR = APP_PATHS.config;
// export const CACHE_DIR = APP_PATHS.cache;
// export const LOG_DIR = APP_PATHS.log;

export const DEFAULT_IMG_FOLDER = join(DATA_DIR, 'images');
export const DEFAULT_IMG_FILENAME = 'preview.img';
export const DEFAULT_IMG_PATH = join(DEFAULT_IMG_FOLDER, DEFAULT_IMG_FILENAME);

/* Paths relative to the filesystem inside the disk image */

export const MOUNT_POINT_FOLDER = '/mnt/grub-qemu-mounted';
export const GUEST_GRUB_DIR_PATH = join(MOUNT_POINT_FOLDER, 'boot', 'grub');
export const GUEST_THEME_DIR_PATH = join(GUEST_GRUB_DIR_PATH, 'themes', 'current-theme');
export const GUEST_CONFIG_FILE_PATH = join(GUEST_GRUB_DIR_PATH, 'grub.cfg');
