
export interface QemuErrorOptions {
	args: string[];
	exitCode: number | null;
	stdout: string;
	stderr: string;
	message?: string;
}

/**
 * Represents an error that occurs during the execution of a QEMU command.
 *
 * This error is thrown when the QEMU command exits with a non-zero exit code or fails to execute,
 * capturing the command arguments, exit code, and stdout/stderr output streams for debugging.
 */
export class QemuError extends Error {
	override readonly name = 'QemuError';
	
	readonly args: string[];
	readonly exitCode: number | null;
	readonly stdout: string;
	readonly stderr: string;

	constructor(options: QemuErrorOptions) {
		const detail = options.stderr.trim() || options.stdout.trim();
		const defaultMessage = detail
			? `qemu failed with exit code ${options.exitCode}: ${detail}`
			: `qemu failed with exit code ${options.exitCode}`;
		
		super(options.message ?? defaultMessage);
		
		this.args = options.args;
		this.exitCode = options.exitCode;
		this.stdout = options.stdout;
		this.stderr = options.stderr;
		
		Object.setPrototypeOf(this, new.target.prototype);
	}
}