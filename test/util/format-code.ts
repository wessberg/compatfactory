import prettier from "@prettier/sync";

export function formatCode(code: string): string {
	try {
		return prettier.format(code, {parser: "typescript", endOfLine: "lf"});
	} catch (ex) {
		// Prettier may not support the given language feature. Try simply cleaning up whitespace instead
		return code.replace(/\r?\n/g, "\n");
	}
}
