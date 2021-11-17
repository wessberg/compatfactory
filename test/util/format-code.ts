import {format} from "prettier";

export function formatCode(code: string): string {
	try {
		return format(code, {parser: "typescript", endOfLine: "lf"});
	} catch {
		// Prettier may not support the given language feature. Try simply cleaning up whitespace instead
		return code.replace(/\r?\n/g, "\n");
	}
}
