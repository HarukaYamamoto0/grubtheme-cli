export enum LogLevel {
	TRACE = 'trace',
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
}

export interface ILogger {
	trace(message: string): void;

	debug(message: string): void;

	info(message: string): void;

	error(message: string): void;

	warn(message: string): void;
}
