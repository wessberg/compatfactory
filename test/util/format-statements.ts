import type * as TS from "typescript";
import {MaybeArray} from "helpertypes";
import {ensureNodeFactory} from "../../src/index.js";
import {formatCode} from "./format-code.js";

export function formatStatements(typescript: typeof TS, statements: MaybeArray<TS.Statement>): string {
	const factory = ensureNodeFactory(typescript);
	const printer = typescript.createPrinter({
		newLine: typescript.NewLineKind.LineFeed
	});

	const sourceFile = factory.createSourceFile(Array.isArray(statements) ? statements : [statements], typescript.createToken(typescript.SyntaxKind.EndOfFileToken), 0);
	return formatCode(printer.printFile(sourceFile));
}
