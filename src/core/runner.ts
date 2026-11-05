import { QemuError } from '../erros';

/**
 * Executes the QEMU command with the specified arguments and returns the standard output.
 * If the command fails, an error is thrown with details including exit code, standard output, and standard error.
 *
 * @param {string[]} args - An array of string arguments to pass to the QEMU command.
 * @return {Promise<string>} The standard output of the command execution.
 * @throws {QemuError} Throws an error if the command exits with a non-zero code containing command details.
 */
export async function runner(args: string[]): Promise<string> {
	const proc = Bun.spawn(['qemu-system-x86_64', ...args], {
		stdout: 'pipe',
		stderr: 'pipe',
	});

	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();

	const exitCode = await proc.exited;

	if (exitCode !== 0) {
		throw new QemuError({
			args,
			exitCode,
			stdout,
			stderr,
		});
	}

	return stdout;
}
