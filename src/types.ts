/**
 * Represents a video resolution setting.
 *
 * Accepts either a resolution string in the form of width by height, using numeric
 * pixel dimensions separated by "x", or the value "auto" to allow the resolution
 * to be selected automatically.
 */
export type VideoResolution = `${number}x${number}` | 'auto';

/**
 * Represents a Linux loop block device path.
 *
 * Matches strings in the form `/dev/loopN`, where `N` is a numeric value.
 */
export type Device = `/dev/loop${number}`;

export type CommandResult<T> =
	{ success: true; data: T } | { success: false; error: { code: string; message: string } };
