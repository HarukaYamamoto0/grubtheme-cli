export type loggerFun = (content: Uint8Array | string, newLine?: boolean) => void;

/**
 * Writes content to the standard error stream, optionally appending a newline.
 *
 * @param content The content to write to standard error.
 * @param newLine Whether to append a newline after the content.
 */
export function stderrWrite(content: Uint8Array | string, newLine: boolean = true): void {
	process.stderr.write(content + (newLine ? '\n' : ''));
}

/**
 * Writes content to standard output, optionally appending a newline.
 *
 * @param content The content to write to standard output.
 * @param newLine Whether to append a newline after the content.
 */
export function stdoutWrite(content: Uint8Array | string, newLine: boolean = true): void {
	process.stdout.write(content + (newLine ? '\n' : ''));
}
