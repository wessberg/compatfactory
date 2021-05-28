import test from "ava";
import {withTypeScriptVersions} from "./util/ts-macro";
import {ensureNodeFactory} from "../src/index";
import {formatStatements} from "./util/format-statements";
import {formatCode} from "./util/format-code";

test("Wrapping a NodeFactory that require no modifications in a call to `ensureNodeFactory` is a noop. #1", withTypeScriptVersions(">=4.2"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.is(factory, typescript.factory);
});

test(
	"Wrapping a NodeFactory that require modifications in a call to `ensureNodeFactory` returns an updated version of the NodeFactory that conforms to the latest API. #1",
	withTypeScriptVersions(">=4.0 && <4.2"),
	(t, {typescript}) => {
		const factory = ensureNodeFactory(typescript);
		t.is(factory.createSourceFile, typescript.factory.createSourceFile);
		t.is(factory.createVariableDeclaration, typescript.factory.createVariableDeclaration);
		t.not(factory.createImportEqualsDeclaration, typescript.factory.createImportEqualsDeclaration);
		t.not(factory.createMappedTypeNode, typescript.factory.createMappedTypeNode);
	}
);

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
