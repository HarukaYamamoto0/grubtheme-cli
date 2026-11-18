import {homedir} from "node:os";
import {join, resolve} from "node:path";

/**
 * Expands a file system path by replacing a leading home directory shortcut with the user's home directory.
 * Resolves non-home-relative paths to an absolute path.
 *
 * @param path The path to expand.
 * @return The expanded absolute path.
 */
export function expandPath(path: string): string {
	if (path === "~") {
		return homedir();
	}
	
	if (path.startsWith("~/")) {
		return join(homedir(), path.slice(2));
	}
	
	return resolve(path);
}