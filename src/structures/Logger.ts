import { type ILogger, LogLevel } from '../core/ILogger';
import { stderrWrite } from '../helpers/iolog';

export class Logger implements ILogger {
	constructor(
		private readonly namespace: string,
		private readonly verbose = false,
	) {}

	private write(level: LogLevel, message: string): void {
		stderrWrite(`[${this.namespace}] ${level}: ${message}`);
	}

	trace(message: string): void {
		if (this.verbose) this.write(LogLevel.TRACE, message);
	}

	debug(message: string): void {
		if (this.verbose) this.write(LogLevel.DEBUG, message);
	}

	info(message: string): void {
		if (this.verbose) this.write(LogLevel.INFO, message);
	}

	warn(message: string): void {
		this.write(LogLevel.WARN, message);
	}

	error(message: string): void {
		this.write(LogLevel.ERROR, message);
	}
}
