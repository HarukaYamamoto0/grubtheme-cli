/**
 * @example
 * ```ts
 * const resolution: VideoResolution = '1920x1080'
 * ```
 */
export type VideoResolution = `${number}x${number}` | 'auto';

export type Device = `/dev/loop${number}`;
