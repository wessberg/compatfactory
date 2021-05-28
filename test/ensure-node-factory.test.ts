import test from "ava";
import {withTypeScriptVersions} from "./util/ts-macro";
import {ensureNodeFactory} from "../src/index";
import {formatStatements} from "./util/format-statements";
import {formatCode} from "./util/format-code";

test("Wrapping a NodeFactory in a call to `ensureNodeFactory` is a noop. #1", withTypeScriptVersions(">=4.0"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.is(factory, typescript.factory);
});

test("Wrapping a TypeScript object with no Node Factory returns an object that conforms with the Node Factory API. #1", withTypeScriptVersions("<4.0"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.not(factory, typescript.factory);
	t.true("createMethodDeclaration" in factory);
	t.true("createBitwiseAnd" in factory);
});

test("It is possible to construct VariableStatements via the Node Factory wrapper for legacy versions of TypeScript. #1", withTypeScriptVersions("<4.0"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createVariableStatement(
				undefined,
				factory.createVariableDeclarationList(
					[
						factory.createVariableDeclaration(
							factory.createIdentifier("myVariable"),
							undefined,
							factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword),
							factory.createStringLiteral("foo")
						)
					],
					typescript.NodeFlags.Const
				)
			)
		),
		formatCode(`const myVariable: string = "foo"`)
	);
});
