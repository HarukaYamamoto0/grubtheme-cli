import { debuglog } from 'node:util';

export type Runner = (args: string[]) => Promise<string>;

/**
 * Runs a command with the provided arguments, captures its standard output and standard error,
 * and returns the standard output when the process exits successfully.
 *
 * @param args Command and arguments to execute.
 * @return Standard output produced by the executed process.
 * @throws RunnerError If the process exits with a non-zero exit code.
 */
export async function runner(args: string[]): Promise<string> {
	debuglog('runner')(args.join(' '));
	const proc = Bun.spawn(args, {
		stdout: 'pipe',
		stderr: 'pipe',
	});

	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();

	const exitCode = await proc.exited;

	if (exitCode !== 0) {
		throw new RunnerError({
			args,
			exitCode,
			stdout,
			stderr,
		});
	}

	return stdout;
}

/**
 * Error thrown when a runner process fails.
 *
 * Provides a failure message derived from the runner output when a custom message is not supplied.
 * The generated message includes the exit code and prefers standard error output over standard output.
 *
 * @param options - Details of the failed runner invocation.
 * @param options.args - Arguments passed to the runner.
 * @param options.exitCode - Exit code returned by the runner.
 * @param options.stdout - Captured standard output.
 * @param options.stderr - Captured standard error.
 * @param options.message - Optional custom error message.
 */
export class RunnerError extends Error {
	override readonly name = 'RunnerError';

	readonly args: string[];
	readonly exitCode: number | null;
	readonly stdout: string;
	readonly stderr: string;

	constructor(options: { args: string[]; exitCode: number; stdout: string; stderr: string; message?: string }) {
		const detail = options.stderr.trim() || options.stdout.trim();
		const defaultMessage = detail
			? `runner failed with exit code ${options.exitCode}: ${detail}`
			: `runner failed with exit code ${options.exitCode}`;

		super(options.message ?? defaultMessage);

		this.args = options.args;
		this.exitCode = options.exitCode;
		this.stdout = options.stdout;
		this.stderr = options.stderr;

		Object.setPrototypeOf(this, new.target.prototype);
	}
}
