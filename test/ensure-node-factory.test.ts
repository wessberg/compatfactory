import test from "ava";
import {withTypeScriptVersions} from "./util/ts-macro";
import {ensureNodeFactory} from "../src/index";
import {formatStatements} from "./util/format-statements";
import {formatCode} from "./util/format-code";

test("Wrapping a NodeFactory that require no modifications in a call to `ensureNodeFactory` is a noop. #1", withTypeScriptVersions(">=4.2"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.true(factory === typescript.factory);
});

test(
	"Wrapping a NodeFactory that require modifications in a call to `ensureNodeFactory` returns an updated version of the NodeFactory that conforms to the latest API. #1",
	withTypeScriptVersions(">=4.0 && <4.2"),
	(t, {typescript}) => {
		const factory = ensureNodeFactory(typescript);
		t.true(factory.createSourceFile === typescript.factory.createSourceFile);
		t.true(factory.createVariableDeclaration === typescript.factory.createVariableDeclaration);

		t.false(factory.createImportEqualsDeclaration === typescript.factory.createImportEqualsDeclaration);
		t.false(factory.createMappedTypeNode === typescript.factory.createMappedTypeNode);
	}
);

test("Wrapping a TypeScript object with no Node Factory returns an object that conforms with the Node Factory API. #1", withTypeScriptVersions("<4.0"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.false(factory === typescript.factory);
	t.false(factory === (typescript as never));
	t.true("createMethodDeclaration" in factory);
	t.true("createBitwiseAnd" in factory);
});

test("Calling ensureNodeFactory with an already wrapped TypeScript object performs no further wrapping. #1", withTypeScriptVersions("<4.0"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.false(factory === typescript.factory);
	t.false(factory === (typescript as never));
	const factory2 = ensureNodeFactory(factory);
	t.true(factory === factory2);
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

test("It is possible to construct JSDoc comments. #1", withTypeScriptVersions("<4.0"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.notThrows(() => factory.createJSDocComment("Hello, World!"));
	t.deepEqual(factory.createJSDocComment("Hello, World!").kind, typescript.SyntaxKind.JSDocComment);
});

test("It is possible to construct JSDoc comments. #2", withTypeScriptVersions("<4.0"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.notThrows(() => factory.createJSDocProtectedTag(undefined, undefined));
	t.notThrows(() => factory.createJSDocAuthorTag(undefined, undefined));
});

test("It is possible to construct PropertyAccessChains, even for older TypeScript versions. #1", withTypeScriptVersions("<3.6"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	factory.createPropertyAccessChain(factory.createIdentifier("foo"), factory.createToken(typescript.SyntaxKind.QuestionDotToken), factory.createIdentifier("bar"));

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createExpressionStatement(
				factory.createPropertyAccessChain(factory.createIdentifier("foo"), factory.createToken(typescript.SyntaxKind.QuestionDotToken), factory.createIdentifier("bar"))
			)
		),
		formatCode(`foo.bar`)
	);
});

test("It is possible to construct PropertyAccessChains. #1", withTypeScriptVersions(">= 3.7 && < 4.0"), (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	factory.createPropertyAccessChain(factory.createIdentifier("foo"), factory.createToken(typescript.SyntaxKind.QuestionDotToken), factory.createIdentifier("bar"));

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createExpressionStatement(
				factory.createPropertyAccessChain(factory.createIdentifier("foo"), factory.createToken(typescript.SyntaxKind.QuestionDotToken), factory.createIdentifier("bar"))
			)
		),
		formatCode(`foo?.bar`)
	);
});
