import {formatStatements} from "./util/format-statements.js";
import {formatCode} from "./util/format-code.js";
import {ensureNodeFactory} from "../src/index.js";
import {test} from "./util/test-runner.js";

test("Wrapping a NodeFactory that require no modifications in a call to `ensureNodeFactory` is a noop. #1", ">=5.1", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.true(factory === typescript.factory);
});

test(
	"Wrapping a NodeFactory that require modifications in a call to `ensureNodeFactory` returns an updated version of the NodeFactory that conforms to the latest API. #1",
	`>=4.0 <4.2`,
	(t, {typescript}) => {
		const factory = ensureNodeFactory(typescript);
		t.true(factory.createSourceFile === typescript.factory.createSourceFile);
		t.true(factory.createVariableDeclaration === typescript.factory.createVariableDeclaration);

		t.false(factory.createImportEqualsDeclaration === typescript.factory.createImportEqualsDeclaration);
		t.false(factory.createImportSpecifier === typescript.factory.createImportSpecifier);
		t.false(factory.createMappedTypeNode === typescript.factory.createMappedTypeNode);
	}
);

test(
	"Wrapping a NodeFactory that require modifications in a call to `ensureNodeFactory` returns an updated version of the NodeFactory that conforms to the latest API. #1",
	`>=5.0 <5.1`,
	(t, {typescript}) => {
		const factory = ensureNodeFactory(typescript);
		t.true(factory.createImportEqualsDeclaration === typescript.factory.createImportEqualsDeclaration);
		t.false(factory.createJsxNamespacedName === typescript.factory.createJsxNamespacedName);
	}
);

test("Wrapping a TypeScript object with no Node Factory returns an object that conforms with the Node Factory API. #1", "<4.0", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.false(factory === typescript.factory);
	t.false(factory === (typescript as never));
	t.true("createMethodDeclaration" in factory);
	t.true("createBitwiseAnd" in factory);
});

test("Calling ensureNodeFactory with an already wrapped TypeScript object performs no further wrapping. #1", "<4.0", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.false(factory === typescript.factory);
	t.false(factory === (typescript as never));
	const factory2 = ensureNodeFactory(factory);
	t.true(factory === factory2);
});

test("It is possible to construct VariableStatements via the Node Factory wrapper for legacy versions of TypeScript. #1", "<4.0", (t, {typescript}) => {
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

test("It is possible to construct JSDoc comments. #1", "<4.0", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.notThrows(() => factory.createJSDocComment("Hello, World!"));
	t.deepEqual(factory.createJSDocComment("Hello, World!").kind, typescript.SyntaxKind.JSDocComment);
});

test("It is possible to construct JSDoc comments. #2", "<4.0", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.notThrows(() => factory.createJSDocProtectedTag(undefined, undefined));
	t.notThrows(() => factory.createJSDocAuthorTag(undefined, undefined));
});

test("It is possible to construct JSDoc comments. #3", "<4.4", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.notThrows(() => factory.createJSDocMemberName(factory.createIdentifier("foo"), factory.createIdentifier("bar")));
});

test("It is possible to construct JSDoc comments. #4", "<4.4", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.notThrows(() => factory.createJSDocLinkCode(factory.createIdentifier("foo"), "Foo"));
});

test("It is possible to construct JSDoc comments. #5", "<4.4", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);
	t.notThrows(() => factory.createJSDocLinkPlain(factory.createIdentifier("foo"), "Foo"));
});

test("It is possible to construct PropertyAccessChains, even for older TypeScript versions. #1", "<3.6", (t, {typescript}) => {
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

test("It is possible to construct PropertyAccessChains. #1", ">= 3.7 <4.0", (t, {typescript}) => {
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

test("It is possible to construct ClassStaticBlockDeclarations, even for older TypeScript versions. #1", "<4.4", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(typescript, factory.createClassDeclaration(undefined, undefined, undefined, undefined, [factory.createClassStaticBlockDeclaration(factory.createBlock([]))])),
		formatCode(`\
		class {}`)
	);
});

test("It is possible to construct SatisfiesExpressions, even for older TypeScript versions. #1", "<4.9", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createExpressionStatement(
				factory.createSatisfiesExpression(
					factory.createObjectLiteralExpression([factory.createPropertyAssignment(factory.createIdentifier("foo"), factory.createStringLiteral("bar"))], true),
					factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
						factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword),
						factory.createLiteralTypeNode(factory.createStringLiteral("bar"))
					])
				)
			)
		),
		formatCode(`\
({
	foo: "bar",
});`)
	);
});

test("It is possible to construct AssertClauses, even for older TypeScript versions. #1", "<4.5", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createImportDeclaration(
				undefined,
				factory.createImportClause(false, factory.createIdentifier("obj"), undefined),
				factory.createStringLiteral("./something.json"),
				factory.createAssertClause(factory.createNodeArray(), false)
			)
		),
		formatCode(`import obj from "./something.json";`)
	);
});

test("It is possible to construct AssertEntries, even for older TypeScript versions. #1", "<4.5", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createImportDeclaration(
				undefined,
				factory.createImportClause(false, factory.createIdentifier("obj"), undefined),
				factory.createStringLiteral("./something.json"),
				factory.createAssertClause(factory.createNodeArray([factory.createAssertEntry(factory.createIdentifier("type"), factory.createStringLiteral("json"))]), false)
			)
		),
		formatCode(`import obj from "./something.json";`)
	);
});

test("It is possible to construct type-only ImportSpecifiers, even for older TypeScript versions. #1", "<4.5", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createImportDeclaration(
				undefined,
				factory.createImportClause(false, undefined, factory.createNamedImports([factory.createImportSpecifier(true, undefined, factory.createIdentifier("Foo"))])),
				factory.createStringLiteral("./bar"),
				undefined
			)
		),
		formatCode(`import {Foo} from "./bar";`)
	);
});

test("It is possible to construct type-only ExportSpecifiers, even for older TypeScript versions. #1", "<4.5", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createExportDeclaration(
				undefined,
				false,
				factory.createNamedExports([factory.createExportSpecifier(true, undefined, factory.createIdentifier("Foo"))]),
				factory.createStringLiteral("./bar"),
				undefined
			)
		),
		formatCode(`export {Foo} from "./bar";`)
	);
});

test("It is possible to pass a number as argument to factory.createNumericLiteral. #1", "*", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(formatStatements(typescript, factory.createExpressionStatement(factory.createNumericLiteral(0))), formatCode(`0`));
});

test("It is possible to have separate write types on properties, even for older TypeScript versions. #1", "<4.3", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createClassDeclaration(undefined, undefined, undefined, undefined, [
				factory.createGetAccessorDeclaration(
					undefined,
					"size",
					[],
					factory.createKeywordTypeNode(typescript.SyntaxKind.NumberKeyword),
					factory.createBlock([factory.createReturnStatement(factory.createNumericLiteral(0))])
				),
				factory.createSetAccessorDeclaration(
					undefined,
					"size",
					[factory.createParameterDeclaration(undefined, undefined, "value", undefined, factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword), undefined)],
					factory.createBlock([])
				)
			])
		),
		formatCode(`\
		class {
			get size(): number {
				return 0;
			}
			set size(value: string) {
			}
		}`)
	);
});

test("It is possible to pass assertions when creating ImportTypeNodes, even on older TypeScript versions. #1", "<4.7", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createTypeAliasDeclaration(
				undefined,
				"foo",
				undefined,
				factory.createImportTypeNode(
					factory.createLiteralTypeNode(factory.createStringLiteral("./foo")),
					factory.createImportTypeAssertionContainer(
						factory.createAssertClause(factory.createNodeArray([factory.createAssertEntry(factory.createIdentifier("type"), factory.createStringLiteral("json"))]), false)
					),
					undefined,
					undefined,
					false
				)
			)
		),
		formatCode(`type foo = import("./foo");\n`)
	);
});

test("It is possible to pass assertions when creating ImportTypeNodes, even on older TypeScript versions. #2", "4.7", (t, {typescript}) => {
	const factory = ensureNodeFactory(typescript);

	t.deepEqual(
		formatStatements(
			typescript,
			factory.createTypeAliasDeclaration(
				undefined,
				"foo",
				undefined,
				factory.createImportTypeNode(
					factory.createLiteralTypeNode(factory.createStringLiteral("./foo")),
					factory.createImportTypeAssertionContainer(
						factory.createAssertClause(factory.createNodeArray([factory.createAssertEntry(factory.createIdentifier("type"), factory.createStringLiteral("json"))]), false)
					),
					undefined,
					undefined,
					false
				)
			)
		),
		formatCode(`type foo = import("./foo", { assert: { type: "json" } });\n`)
	);
});
