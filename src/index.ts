/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars */
import type * as TS from "typescript";
import type * as TS4 from "typescript-4-9-4";
import type {Mutable, RequiredExcept} from "helpertypes";

type PartialNodeFactory = RequiredExcept<
	TS.NodeFactory,
	| "createClassStaticBlockDeclaration"
	| "updateClassStaticBlockDeclaration"
	| "createSatisfiesExpression"
	| "updateSatisfiesExpression"
	| "createUniquePrivateName"
	| "getGeneratedPrivateNameForNode"
>;
type NodeWithInternalFlags = TS.Node & {
	modifierFlagsCache?: number;
	transformFlags?: number;
	original?: TS.Node;
	emitNode?: TS.Node;
};

export function ensureNodeFactory(factoryLike: TS.NodeFactory | typeof TS): TS.NodeFactory {
	if ("factory" in factoryLike && factoryLike.factory != null) {
		return normalizeNodeFactory(factoryLike.factory);
	} else if (!("updateSourceFileNode" in factoryLike)) {
		return normalizeNodeFactory(factoryLike as PartialNodeFactory);
	}

	return createNodeFactory(factoryLike as typeof TS);
}

function splitDecoratorsAndModifiers(modifierLikes: readonly TS.ModifierLike[] | undefined): [readonly TS.Decorator[] | undefined, readonly TS.Modifier[] | undefined] {
	const decorators = (modifierLikes?.filter(modifier => "expression" in modifier) ?? []) as readonly TS.Decorator[];
	const modifiers = (modifierLikes?.filter(modifier => !("expression" in modifier)) ?? []) as readonly TS.Modifier[];
	return [decorators == null || decorators.length < 1 ? undefined : decorators, modifiers == null || modifiers.length < 1 ? undefined : modifiers];
}

function normalizeNodeFactory(factory: PartialNodeFactory): TS.NodeFactory {
	// By casting the factory to TypeScript 4.9.4, we're assuming to be on the last possible version where the decorators argument can still be separate from modifiers in the type definitions
	const ts4CastFactory = factory as unknown as import("typescript-4-9-4").NodeFactory;

	if (Boolean((factory as {__compatUpgraded?: boolean}).__compatUpgraded)) {
		return factory;
	}

	// When this is true, this represents a TypeScript version where the the first argument to many of the factory functions is a list of decorators, which
	// has since been merged with modifiers
	let badDecoratorsAsFirstArgument = false;

	try {
		// This will throw on older TypeScript versions that always expect receiving decorators as the first argument
		badDecoratorsAsFirstArgument = ts4CastFactory.createImportEqualsDeclaration([], false, "", ts4CastFactory.createIdentifier("")).decorators != null;
	} catch {
		badDecoratorsAsFirstArgument = ts4CastFactory.createImportEqualsDeclaration([], [], false, "", ts4CastFactory.createIdentifier("")).decorators != null;
	}

	const badCreateImportEqualsDeclaration = badDecoratorsAsFirstArgument && factory.createImportEqualsDeclaration.length === 4;
	const badCreateImportSpecifier = badDecoratorsAsFirstArgument && factory.createImportSpecifier.length === 2;
	const badCreateExportSpecifier = badDecoratorsAsFirstArgument && factory.createExportSpecifier.length === 2;
	const badCreateImportTypeNode = badDecoratorsAsFirstArgument && factory.createImportTypeNode.length < 5;
	const badCreateMappedTypeNodeA = badDecoratorsAsFirstArgument && factory.createMappedTypeNode.length === 4;
	const badCreateMappedTypeNodeB = badDecoratorsAsFirstArgument && factory.createMappedTypeNode.length === 5;
	const badCreateTypeParameterDeclaration = badDecoratorsAsFirstArgument && factory.createTypeParameterDeclaration.length === 3;

	const missingCreateSatisfiesExpression = factory.createSatisfiesExpression == null;
	const missingCreateClassStaticBlockDeclaration = factory.createClassStaticBlockDeclaration == null;
	const missingCreateUniquePrivateName = factory.createUniquePrivateName == null;
	const missingGetGeneratedPrivateNameForNode = factory.getGeneratedPrivateNameForNode == null;
	const missingCreatePrivateIdentifier = factory.createPrivateIdentifier == null;
	const missingCreateAssertClause = factory.createAssertClause == null;
	const missingCreateAssertEntry = factory.createAssertEntry == null;
	const missingCreateImportTypeAssertionContainer = factory.createImportTypeAssertionContainer == null;
	const missingCreateJSDocMemberName = factory.createJSDocMemberName == null;
	const missingCreateJSDocLinkCode = factory.createJSDocLinkCode == null;
	const missingCreateJSDocLinkPlain = factory.createJSDocLinkPlain == null;
	const missingCreateJSDocOverloadTag = factory.createJSDocOverloadTag == null;
	const missingCreateJSDocThrowsTag = factory.createJSDocThrowsTag == null;
	const missingCreateJSDocSatisfiesTag = factory.createJSDocSatisfiesTag == null;
	const missingCreateJsxNamespacedName = factory.createJsxNamespacedName == null;

	const needsModifications =
		badCreateImportEqualsDeclaration ||
		badCreateImportSpecifier ||
		badCreateExportSpecifier ||
		badCreateImportTypeNode ||
		badCreateMappedTypeNodeA ||
		badCreateMappedTypeNodeB ||
		badCreateTypeParameterDeclaration ||
		missingCreateSatisfiesExpression ||
		missingCreateClassStaticBlockDeclaration ||
		missingCreateUniquePrivateName ||
		missingGetGeneratedPrivateNameForNode ||
		missingCreatePrivateIdentifier ||
		missingCreateAssertClause ||
		missingCreateAssertEntry ||
		missingCreateImportTypeAssertionContainer ||
		missingCreateJSDocMemberName ||
		missingCreateJSDocLinkCode ||
		missingCreateJSDocLinkPlain ||
		missingCreateJSDocOverloadTag ||
		missingCreateJSDocThrowsTag ||
		missingCreateJSDocSatisfiesTag ||
		missingCreateJsxNamespacedName ||
		badDecoratorsAsFirstArgument;

	if (needsModifications) {
		/**
		 * The following helpers are internal TypeScript helpers that have been inlined for reuse inside factory helpers when the full TypeScript namespace is not available
		 */

		const withOriginal = "original" in factory.updateBlock(factory.createBlock([]), []);

		const setOriginalNode = <T extends TS.Node>(node: T & NodeWithInternalFlags, original: T & NodeWithInternalFlags): T => {
			node.original = original;
			return node;
		};

		const setTextRangeEnd = <T extends TS.TextRange>(range: T, end: number): T => {
			range.end = end;
			return range;
		};

		const setTextRangePos = <T extends TS.TextRange>(range: T, pos: number): T => {
			range.pos = pos;
			return range;
		};

		const setTextRangePosEnd = <T extends TS.TextRange>(range: T, pos: number, end: number): T => setTextRangeEnd(setTextRangePos(range, pos), end);

		const setTextRange = <T extends TS.TextRange>(range: T, loc: TS.TextRange | undefined): T => (loc != null ? setTextRangePosEnd(range, loc.pos, loc.end) : range);

		const updateWithoutOriginal = <T extends TS.Node>(updated: T, original: T): T => {
			if (updated !== original) {
				setTextRange(updated, original);
			}
			return updated;
		};
		const updateWithOriginal = <T extends TS.Node>(updated: T, original: T): T => {
			if (updated !== original) {
				setOriginalNode(updated, original);
				setTextRange(updated, original);
			}
			return updated;
		};

		const update = withOriginal ? updateWithOriginal : updateWithoutOriginal;

		const createPrivateIdentifier = missingCreatePrivateIdentifier
			? (() =>
					function (text: string): TS.PrivateIdentifier {
						const node = factory.createIdentifier(text) as unknown as Mutable<TS.PrivateIdentifier>;
						return node;
					})()
			: factory.createPrivateIdentifier;

		return {
			["__compatUpgraded" as never]: true,
			...factory,
			createPrivateIdentifier,
			...(badCreateImportEqualsDeclaration
				? (() => {
						function createImportEqualsDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration;
						function createImportEqualsDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration;
						function createImportEqualsDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
							isTypeOnlyOrName: boolean | string | TS.Identifier,
							nameOrModuleReference: string | TS.Identifier | TS.ModuleReference,
							moduleReferenceOrUndefined?: TS.ModuleReference | undefined
						): TS.ImportEqualsDeclaration {
							const isShort = arguments.length <= 4;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);

							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
							const name = (isShort ? isTypeOnlyOrName : nameOrModuleReference) as string | TS.Identifier;
							const moduleReference = (isShort ? nameOrModuleReference : moduleReferenceOrUndefined) as TS.ModuleReference;
							return (factory as unknown as import("typescript-4-1-2").NodeFactory).createImportEqualsDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								moduleReference as never
							) as unknown as TS.ImportEqualsDeclaration;
						}

						function updateImportEqualsDeclaration(
							node: TS.ImportEqualsDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration;
						function updateImportEqualsDeclaration(
							node: TS.ImportEqualsDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration;
						function updateImportEqualsDeclaration(
							node: TS.ImportEqualsDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
							isTypeOnlyOrName: boolean | string | TS.Identifier,
							nameOrModuleReference: string | TS.Identifier | TS.ModuleReference,
							moduleReferenceOrUndefined?: TS.ModuleReference | undefined
						): TS.ImportEqualsDeclaration {
							const isShort = arguments.length <= 5;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);

							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
							const name = (isShort ? isTypeOnlyOrName : nameOrModuleReference) as string | TS.Identifier;
							const moduleReference = (isShort ? nameOrModuleReference : moduleReferenceOrUndefined) as TS.ModuleReference;
							return (factory as unknown as import("typescript-4-1-2").NodeFactory).updateImportEqualsDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								moduleReference as never
							) as unknown as TS.ImportEqualsDeclaration;
						}

						return {
							createImportEqualsDeclaration,
							updateImportEqualsDeclaration
						};
				  })()
				: {}),
			...(badCreateImportSpecifier
				? {
						createImportSpecifier(isTypeOnly: boolean, propertyName: TS.Identifier | undefined, name: TS.Identifier): TS.ImportSpecifier {
							return (factory as unknown as import("typescript-4-4-3").NodeFactory).createImportSpecifier(propertyName as never, name as never) as unknown as TS.ImportSpecifier;
						},

						updateImportSpecifier(node: TS.ImportSpecifier, isTypeOnly: boolean, propertyName: TS.Identifier | undefined, name: TS.Identifier): TS.ImportSpecifier {
							return (factory as unknown as import("typescript-4-4-3").NodeFactory).updateImportSpecifier(
								node as never,
								propertyName as never,
								name as never
							) as unknown as TS.ImportSpecifier;
						}
				  }
				: {}),
			...(badCreateExportSpecifier
				? {
						createExportSpecifier(isTypeOnly: boolean, propertyName: string | TS.Identifier | undefined, name: string | TS.Identifier): TS.ExportSpecifier {
							return (factory as unknown as import("typescript-4-4-3").NodeFactory).createExportSpecifier(propertyName as never, name as never) as unknown as TS.ExportSpecifier;
						},

						updateExportSpecifier(node: TS.ExportSpecifier, isTypeOnly: boolean, propertyName: TS.Identifier | undefined, name: TS.Identifier): TS.ExportSpecifier {
							return (factory as unknown as import("typescript-4-4-3").NodeFactory).updateExportSpecifier(
								node as never,
								propertyName as never,
								name as never
							) as unknown as TS.ExportSpecifier;
						}
				  }
				: {}),
			...(badCreateImportTypeNode
				? (() => {
						function createImportTypeNode(argument: TS.TypeNode, qualifier?: TS.EntityName, typeArguments?: readonly TS.TypeNode[], isTypeOf?: boolean): TS.ImportTypeNode;
						function createImportTypeNode(
							argument: TS.TypeNode,
							assertions?: TS.ImportTypeAssertionContainer,
							qualifier?: TS.EntityName,
							typeArguments?: readonly TS.TypeNode[],
							isTypeOf?: boolean
						): TS.ImportTypeNode;
						function createImportTypeNode(
							argument: TS.TypeNode,
							assertionsOrQualifier?: TS.ImportTypeAssertionContainer | TS.EntityName,
							qualifierOrTypeArguments?: TS.EntityName | readonly TS.TypeNode[],
							typeArgumentsOrIsTypeOf?: readonly TS.TypeNode[] | boolean,
							isTypeOfOrUndefined?: boolean | undefined
						): TS.ImportTypeNode {
							if (arguments.length < 5) {
								return (factory as unknown as import("typescript-4-6-4").NodeFactory).createImportTypeNode(
									argument as never,
									assertionsOrQualifier as never,
									qualifierOrTypeArguments as never,
									typeArgumentsOrIsTypeOf as never
								) as unknown as TS.ImportTypeNode;
							} else {
								return (factory as unknown as import("typescript-4-6-4").NodeFactory).createImportTypeNode(
									argument as never,
									qualifierOrTypeArguments as never,
									typeArgumentsOrIsTypeOf as never,
									isTypeOfOrUndefined as never
								) as unknown as TS.ImportTypeNode;
							}
						}

						function updateImportTypeNode(
							node: TS.ImportTypeNode,
							argument: TS.TypeNode,
							qualifier?: TS.EntityName,
							typeArguments?: readonly TS.TypeNode[],
							isTypeOf?: boolean
						): TS.ImportTypeNode;
						function updateImportTypeNode(
							node: TS.ImportTypeNode,
							argument: TS.TypeNode,
							assertions?: TS.ImportTypeAssertionContainer,
							qualifier?: TS.EntityName,
							typeArguments?: readonly TS.TypeNode[],
							isTypeOf?: boolean
						): TS.ImportTypeNode;
						function updateImportTypeNode(
							node: TS.ImportTypeNode,
							argument: TS.TypeNode,
							assertionsOrQualifier?: TS.ImportTypeAssertionContainer | TS.EntityName,
							qualifierOrTypeArguments?: TS.EntityName | readonly TS.TypeNode[],
							typeArgumentsOrIsTypeOf?: readonly TS.TypeNode[] | boolean,
							isTypeOfOrUndefined?: boolean | undefined
						): TS.ImportTypeNode {
							if (arguments.length < 6) {
								return (factory as unknown as import("typescript-4-6-4").NodeFactory).updateImportTypeNode(
									node as never,
									argument as never,
									assertionsOrQualifier as never,
									qualifierOrTypeArguments as never,
									typeArgumentsOrIsTypeOf as never
								) as unknown as TS.ImportTypeNode;
							} else {
								return (factory as unknown as import("typescript-4-6-4").NodeFactory).updateImportTypeNode(
									node as never,
									argument as never,
									qualifierOrTypeArguments as never,
									typeArgumentsOrIsTypeOf as never,
									isTypeOfOrUndefined as never
								) as unknown as TS.ImportTypeNode;
							}
						}

						return {createImportTypeNode, updateImportTypeNode};
				  })()
				: {}),
			...(badCreateMappedTypeNodeA
				? {
						createMappedTypeNode(
							readonlyToken: TS.ReadonlyKeyword | TS.PlusToken | TS.MinusToken | undefined,
							typeParameter: TS.TypeParameterDeclaration,
							nameType: TS.TypeNode | undefined,
							questionToken: TS.QuestionToken | TS.PlusToken | TS.MinusToken | undefined,
							type: TS.TypeNode | undefined
						): TS.MappedTypeNode {
							return (factory as unknown as import("typescript-4-0-3").NodeFactory).createMappedTypeNode(
								readonlyToken as never,
								typeParameter as never,
								questionToken as never,
								type as never
							) as unknown as TS.MappedTypeNode;
						},

						updateMappedTypeNode(
							node: TS.MappedTypeNode,
							readonlyToken: TS.ReadonlyKeyword | TS.PlusToken | TS.MinusToken | undefined,
							typeParameter: TS.TypeParameterDeclaration,
							nameType: TS.TypeNode | undefined,
							questionToken: TS.QuestionToken | TS.PlusToken | TS.MinusToken | undefined,
							type: TS.TypeNode | undefined
						): TS.MappedTypeNode {
							return (factory as unknown as import("typescript-4-0-3").NodeFactory).updateMappedTypeNode(
								node as never,
								readonlyToken as never,
								typeParameter as never,
								questionToken as never,
								type as never
							) as unknown as TS.MappedTypeNode;
						}
				  }
				: {}),
			...(badCreateMappedTypeNodeB
				? {
						createMappedTypeNode(
							readonlyToken: TS.ReadonlyKeyword | TS.PlusToken | TS.MinusToken | undefined,
							typeParameter: TS.TypeParameterDeclaration,
							nameType: TS.TypeNode | undefined,
							questionToken: TS.QuestionToken | TS.PlusToken | TS.MinusToken | undefined,
							type: TS.TypeNode | undefined,
							members?: TS.NodeArray<TS.TypeElement> | undefined
						): TS.MappedTypeNode {
							return (factory as unknown as import("typescript-4-4-3").NodeFactory).createMappedTypeNode(
								readonlyToken as never,
								typeParameter as never,
								nameType as never,
								questionToken as never,
								type as never
							) as unknown as TS.MappedTypeNode;
						},

						updateMappedTypeNode(
							node: TS.MappedTypeNode,
							readonlyToken: TS.ReadonlyKeyword | TS.PlusToken | TS.MinusToken | undefined,
							typeParameter: TS.TypeParameterDeclaration,
							nameType: TS.TypeNode | undefined,
							questionToken: TS.QuestionToken | TS.PlusToken | TS.MinusToken | undefined,
							type: TS.TypeNode | undefined,
							members?: TS.NodeArray<TS.TypeElement> | undefined
						): TS.MappedTypeNode {
							return (factory as unknown as import("typescript-4-4-3").NodeFactory).updateMappedTypeNode(
								node as never,
								readonlyToken as never,
								typeParameter as never,
								nameType as never,
								questionToken as never,
								type as never
							) as unknown as TS.MappedTypeNode;
						}
				  }
				: {}),
			...(badCreateTypeParameterDeclaration
				? (() => {
						function createTypeParameterDeclaration(name: string | TS.Identifier, constraint?: TS.TypeNode, defaultType?: TS.TypeNode): TS.TypeParameterDeclaration;
						function createTypeParameterDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							constraint?: TS.TypeNode,
							defaultType?: TS.TypeNode
						): TS.TypeParameterDeclaration;
						function createTypeParameterDeclaration(
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrConstraint?: string | TS.Identifier | TS.TypeNode,
							constraintOrDefaultType?: TS.TypeNode | TS.TypeNode,
							defaultTypeOrUndefined?: TS.TypeNode
						): TS.TypeParameterDeclaration {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const modifiers = (isShort ? undefined : modifiersOrName) as TS.Modifier[] | undefined;
							const name = (isShort ? modifiersOrName : nameOrConstraint) as string | TS.Identifier;
							const constraint = (isShort ? nameOrConstraint : constraintOrDefaultType) as TS.TypeNode | undefined;
							const defaultType = (isShort ? constraintOrDefaultType : defaultTypeOrUndefined) as TS.TypeNode | undefined;

							const typeParameterDeclaration = (factory as unknown as import("typescript-4-6-4").NodeFactory).createTypeParameterDeclaration(
								name as never,
								constraint as never,
								defaultType as never
							) as unknown as TS.TypeParameterDeclaration;
							if (modifiers != null) {
								(typeParameterDeclaration as unknown as Mutable<TS.TypeParameterDeclaration>).modifiers = factory.createNodeArray(modifiers);
							}

							return typeParameterDeclaration;
						}

						function updateTypeParameterDeclaration(
							node: TS.TypeParameterDeclaration,
							name: TS.Identifier,
							constraint?: TS.TypeNode,
							defaultType?: TS.TypeNode
						): TS.TypeParameterDeclaration;
						function updateTypeParameterDeclaration(
							node: TS.TypeParameterDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							name: TS.Identifier,
							constraint?: TS.TypeNode,
							defaultType?: TS.TypeNode
						): TS.TypeParameterDeclaration;
						function updateTypeParameterDeclaration(
							node: TS.TypeParameterDeclaration,
							modifiersOrName: readonly TS.Modifier[] | TS.Identifier | undefined,
							nameOrConstraint?: string | TS.Identifier | TS.TypeNode,
							constraintOrDefaultType?: TS.TypeNode | TS.TypeNode,
							defaultTypeOrUndefined?: TS.TypeNode
						): TS.TypeParameterDeclaration {
							const isShort = modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName; /* Identifier */
							const modifiers = (isShort ? undefined : modifiersOrName) as TS.Modifier[] | undefined;
							const name = (isShort ? modifiersOrName : nameOrConstraint) as TS.Identifier;
							const constraint = (isShort ? nameOrConstraint : constraintOrDefaultType) as TS.TypeNode | undefined;
							const defaultType = (isShort ? constraintOrDefaultType : defaultTypeOrUndefined) as TS.TypeNode | undefined;

							const typeParameterDeclaration = (factory as unknown as import("typescript-4-6-4").NodeFactory).updateTypeParameterDeclaration(
								node as never,
								name as never,
								constraint as never,
								defaultType as never
							) as unknown as TS.TypeParameterDeclaration;
							if (modifiers != null) {
								(typeParameterDeclaration as unknown as Mutable<TS.TypeParameterDeclaration>).modifiers = factory.createNodeArray(modifiers);
							}

							return typeParameterDeclaration;
						}

						return {
							createTypeParameterDeclaration,
							updateTypeParameterDeclaration
						};
				  })()
				: {}),
			...(missingCreateSatisfiesExpression
				? (() => {
						function createSatisfiesExpression(expression: TS.Expression, type: TS.TypeNode): TS.SatisfiesExpression {
							return {...expression} as TS.SatisfiesExpression;
						}

						function updateSatisfiesExpression(node: TS.SatisfiesExpression, expression: TS.Expression, type: TS.TypeNode): TS.SatisfiesExpression {
							return expression === node.expression && type === node.type ? node : update(createSatisfiesExpression(expression, type), node);
						}

						return {
							createSatisfiesExpression,
							updateSatisfiesExpression
						};
				  })()
				: {}),

			...(missingCreateUniquePrivateName
				? (() => {
						function createUniquePrivateName(text?: string): TS.PrivateIdentifier {
							if (text != null && !text.startsWith("#")) {
								throw new TypeError("First character of private identifier must be #: " + text);
							}

							const node = createPrivateIdentifier(text ?? "");
							return node;
						}

						return {
							createUniquePrivateName
						};
				  })()
				: {}),

			...(missingGetGeneratedPrivateNameForNode
				? (() => {
						function getGeneratedPrivateNameForNode(node: TS.Node): TS.PrivateIdentifier {
							return createPrivateIdentifier("");
						}

						return {
							getGeneratedPrivateNameForNode
						};
				  })()
				: {}),

			...(missingCreateClassStaticBlockDeclaration
				? (() => {
						function createClassStaticBlockDeclaration(body: TS.Block): TS.ClassStaticBlockDeclaration;
						function createClassStaticBlockDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							body: TS.Block
						): TS.ClassStaticBlockDeclaration;
						function createClassStaticBlockDeclaration(
							decoratorsOrBlock: readonly TS.Decorator[] | TS.Block | undefined,
							modifiersOrUndefined?: readonly TS.Modifier[] | undefined,
							bodyOrUndefined?: TS.Block
						): TS.ClassStaticBlockDeclaration {
							const body = arguments.length >= 3 ? (bodyOrUndefined as TS.Block) : (decoratorsOrBlock as TS.Block);

							const node = factory.createEmptyStatement() as unknown as Mutable<TS.ClassStaticBlockDeclaration>;
							node.body = body;
							(node as NodeWithInternalFlags).transformFlags = 8388608 /* ContainsClassFields */;
							return node;
						}

						function updateClassStaticBlockDeclaration(node: TS.ClassStaticBlockDeclaration, body: TS.Block): TS.ClassStaticBlockDeclaration;
						function updateClassStaticBlockDeclaration(
							node: TS.ClassStaticBlockDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							body: TS.Block
						): TS.ClassStaticBlockDeclaration;
						function updateClassStaticBlockDeclaration(
							node: TS.ClassStaticBlockDeclaration,
							decoratorsOrBlock: readonly TS.Decorator[] | TS.Block | undefined,
							modifiersOrUndefined?: readonly TS.Modifier[] | undefined,
							bodyOrUndefined?: TS.Block
						): TS.ClassStaticBlockDeclaration {
							const body = arguments.length >= 4 ? (bodyOrUndefined as TS.Block) : (decoratorsOrBlock as TS.Block);
							return body === node.body ? node : update(createClassStaticBlockDeclaration(body), node);
						}

						return {
							createClassStaticBlockDeclaration,
							updateClassStaticBlockDeclaration
						};
				  })()
				: {}),

			...(missingCreateAssertClause
				? (() => {
						function createAssertClause(elements: TS.NodeArray<TS.AssertEntry>, multiLine?: boolean): TS.AssertClause {
							const node = factory.createEmptyStatement() as unknown as Mutable<TS.AssertClause>;

							node.elements = elements;
							node.multiLine = multiLine;
							(node as NodeWithInternalFlags).transformFlags! |= 4 /* ContainsESNext */;
							return node;
						}

						function updateAssertClause(node: TS.AssertClause, elements: TS.NodeArray<TS.AssertEntry>, multiLine?: boolean): TS.AssertClause {
							return node.elements !== elements || node.multiLine !== multiLine ? update(createAssertClause(elements, multiLine), node) : node;
						}

						return {
							createAssertClause,
							updateAssertClause
						};
				  })()
				: {}),

			...(missingCreateAssertEntry
				? (() => {
						function createAssertEntry(name: TS.AssertionKey, value: TS.StringLiteral): TS.AssertEntry {
							const node = factory.createEmptyStatement() as unknown as Mutable<TS.AssertEntry>;

							node.name = name;
							node.value = value;
							(node as NodeWithInternalFlags).transformFlags! |= 4 /* ContainsESNext */;
							return node;
						}

						function updateAssertEntry(node: TS.AssertEntry, name: TS.AssertionKey, value: TS.StringLiteral): TS.AssertEntry {
							return node.name !== name || node.value !== value ? update(createAssertEntry(name, value), node) : node;
						}

						return {
							createAssertEntry,
							updateAssertEntry
						};
				  })()
				: {}),
			...(missingCreateImportTypeAssertionContainer
				? (() => {
						function createImportTypeAssertionContainer(clause: TS.AssertClause, multiLine?: boolean): TS.ImportTypeAssertionContainer {
							const node = factory.createEmptyStatement() as unknown as Mutable<TS.ImportTypeAssertionContainer>;
							node.assertClause = clause;
							node.multiLine = multiLine;
							return node;
						}

						function updateImportTypeAssertionContainer(node: TS.ImportTypeAssertionContainer, clause: TS.AssertClause, multiLine?: boolean): TS.ImportTypeAssertionContainer {
							return node.assertClause !== clause || node.multiLine !== multiLine ? update(createImportTypeAssertionContainer(clause, multiLine), node) : node;
						}

						return {
							createImportTypeAssertionContainer,
							updateImportTypeAssertionContainer
						};
				  })()
				: {}),

			...(missingCreateJSDocMemberName
				? (() => {
						function createJSDocMemberName(left: TS.EntityName | TS.JSDocMemberName, right: TS.Identifier): TS.JSDocMemberName {
							const base = factory.createJSDocComment(undefined, undefined) as unknown as Mutable<TS.JSDoc>;
							delete base.comment;
							delete base.tags;

							const node = base as unknown as Mutable<TS.JSDocMemberName>;

							node.left = left;
							node.right = right;

							return node;
						}

						function updateJSDocMemberName(node: TS.JSDocMemberName, left: TS.EntityName | TS.JSDocMemberName, right: TS.Identifier): TS.JSDocMemberName {
							return left === node.left && right === node.right ? node : update(createJSDocMemberName(left, right), node);
						}

						return {
							createJSDocMemberName,
							updateJSDocMemberName
						};
				  })()
				: {}),
			...(missingCreateJSDocLinkCode
				? (() => {
						function createJSDocLinkCode(name: TS.EntityName | TS.JSDocMemberName | undefined, text: string): TS.JSDocLinkCode {
							const base = factory.createJSDocComment(undefined, undefined) as unknown as Mutable<TS.JSDoc>;
							delete base.comment;
							delete base.tags;

							const node = base as unknown as Mutable<TS.JSDocLinkCode>;

							node.name = name;
							node.text = text;

							return node;
						}

						function updateJSDocLinkCode(node: TS.JSDocLinkCode, name: TS.EntityName | TS.JSDocMemberName | undefined, text: string): TS.JSDocLinkCode {
							return name === node.name && text === node.text ? node : update(createJSDocLinkCode(name, text), node);
						}

						return {
							createJSDocLinkCode,
							updateJSDocLinkCode
						};
				  })()
				: {}),
			...(missingCreateJSDocLinkPlain
				? (() => {
						function createJSDocLinkPlain(name: TS.EntityName | TS.JSDocMemberName | undefined, text: string): TS.JSDocLinkPlain {
							const base = factory.createJSDocComment(undefined, undefined) as unknown as Mutable<TS.JSDoc>;
							delete base.comment;
							delete base.tags;

							const node = base as unknown as Mutable<TS.JSDocLinkPlain>;

							node.name = name;
							node.text = text;

							return node;
						}

						function updateJSDocLinkPlain(node: TS.JSDocLinkPlain, name: TS.EntityName | TS.JSDocMemberName | undefined, text: string): TS.JSDocLinkPlain {
							return name === node.name && text === node.text ? node : update(createJSDocLinkPlain(name, text), node);
						}

						return {
							createJSDocLinkPlain,
							updateJSDocLinkPlain
						};
				  })()
				: {}),
			...(missingCreateJSDocOverloadTag
				? (() => {
						function createJSDocOverloadTag(
							tagName: TS.Identifier | undefined,
							typeExpression: TS.JSDocSignature,
							comment?: string | TS.NodeArray<TS.JSDocComment>
						): TS.JSDocOverloadTag {
							const base = factory.createJSDocComment(undefined, undefined) as unknown as Mutable<TS.JSDoc>;
							delete base.comment;
							delete base.tags;

							const node = base as unknown as Mutable<TS.JSDocOverloadTag>;

							if (tagName != null) node.tagName = tagName;
							node.typeExpression = typeExpression;
							node.comment = comment;

							return node;
						}

						function updateJSDocOverloadTag(
							node: TS.JSDocOverloadTag,
							tagName: TS.Identifier | undefined,
							typeExpression: TS.JSDocSignature,
							comment?: string | TS.NodeArray<TS.JSDocComment>
						): TS.JSDocOverloadTag {
							return tagName === node.tagName && typeExpression === node.typeExpression && comment === node.comment
								? node
								: update(createJSDocOverloadTag(tagName, typeExpression, comment), node);
						}

						return {
							createJSDocOverloadTag,
							updateJSDocOverloadTag
						};
				  })()
				: {}),
			...(missingCreateJSDocThrowsTag
				? (() => {
						function createJSDocThrowsTag(
							tagName: TS.Identifier,
							typeExpression: TS.JSDocTypeExpression | undefined,
							comment?: string | TS.NodeArray<TS.JSDocComment>
						): TS.JSDocThrowsTag {
							const base = factory.createJSDocComment(undefined, undefined) as unknown as Mutable<TS.JSDoc>;
							delete base.comment;
							delete base.tags;

							const node = base as unknown as Mutable<TS.JSDocThrowsTag>;

							if (tagName != null) node.tagName = tagName;
							node.typeExpression = typeExpression;
							node.comment = comment;

							return node;
						}

						function updateJSDocThrowsTag(
							node: TS.JSDocThrowsTag,
							tagName: TS.Identifier | undefined,
							typeExpression: TS.JSDocTypeExpression,
							comment?: string | TS.NodeArray<TS.JSDocComment>
						): TS.JSDocThrowsTag {
							return tagName === node.tagName && typeExpression === node.typeExpression && comment === node.comment
								? node
								: update(createJSDocThrowsTag(tagName ?? node.tagName, typeExpression, comment), node);
						}

						return {
							createJSDocThrowsTag,
							updateJSDocThrowsTag
						};
				  })()
				: {}),
			...(missingCreateJSDocSatisfiesTag
				? (() => {
						function createJSDocSatisfiesTag(
							tagName: TS.Identifier | undefined,
							typeExpression: TS.JSDocTypeExpression,
							comment?: string | TS.NodeArray<TS.JSDocComment>
						): TS.JSDocSatisfiesTag {
							const base = factory.createJSDocComment(undefined, undefined) as unknown as Mutable<TS.JSDoc>;
							delete base.comment;
							delete base.tags;

							const node = base as unknown as Mutable<TS.JSDocSatisfiesTag>;

							if (tagName != null) node.tagName = tagName;
							node.typeExpression = typeExpression;
							node.comment = comment;

							return node;
						}

						function updateJSDocSatisfiesTag(
							node: TS.JSDocSatisfiesTag,
							tagName: TS.Identifier | undefined,
							typeExpression: TS.JSDocTypeExpression,
							comment: string | TS.NodeArray<TS.JSDocComment> | undefined
						): TS.JSDocSatisfiesTag {
							return tagName === node.tagName && typeExpression === node.typeExpression && comment === node.comment
								? node
								: update(createJSDocSatisfiesTag(tagName, typeExpression, comment), node);
						}

						return {
							createJSDocSatisfiesTag,
							updateJSDocSatisfiesTag
						};
				  })()
				: {}),
			...(missingCreateJsxNamespacedName
				? (() => {
						function createJsxNamespacedName(namespace: TS.Identifier, name: TS.Identifier): TS.JsxNamespacedName {
							const node = factory.createEmptyStatement() as unknown as Mutable<TS.JsxNamespacedName>;
							node.namespace = namespace;
							node.name = name;

							return node;
						}

						function updateJsxNamespacedName(node: TS.JsxNamespacedName, namespace: TS.Identifier, name: TS.Identifier): TS.JsxNamespacedName {
							return node.namespace !== namespace || node.name !== name ? update(createJsxNamespacedName(namespace, name), node) : node;
						}

						return {
							createJsxNamespacedName,
							updateJsxNamespacedName
						};
				  })()
				: {}),
			...(badDecoratorsAsFirstArgument
				? (() => {
						function createParameterDeclaration(
							modifiers: readonly TS.ModifierLike[] | undefined,
							dotDotDotToken: TS.DotDotDotToken | undefined,
							name: string | TS.BindingName,
							questionToken?: TS.QuestionToken,
							type?: TS.TypeNode,
							initializer?: TS.Expression
						): TS.ParameterDeclaration;
						function createParameterDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							dotDotDotToken: TS.DotDotDotToken | undefined,
							name: string | TS.BindingName,
							questionToken?: TS.QuestionToken,
							type?: TS.TypeNode,
							initializer?: TS.Expression
						): TS.ParameterDeclaration;
						function createParameterDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrDotDotDotToken: readonly TS.Modifier[] | TS.DotDotDotToken | undefined,
							dotDotDotTokenOrName: TS.DotDotDotToken | string | TS.BindingName | undefined,
							nameOrQuestionToken?: string | TS.BindingName | TS.QuestionToken,
							questionTokenOrType?: TS.QuestionToken | TS.TypeNode,
							typeOrInitializer?: TS.TypeNode | TS.Expression,
							initializerOrUndefined?: TS.Expression
						): TS.ParameterDeclaration {
							const isShort = typeof dotDotDotTokenOrName === "string" || (dotDotDotTokenOrName != null && dotDotDotTokenOrName.kind !== (25 as number)); /* DotDotDotToken */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort
								? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1]
								: (modifiersOrDotDotDotToken as readonly TS.Modifier[]);
							const dotDotDotToken = (isShort ? modifiersOrDotDotDotToken : dotDotDotTokenOrName) as TS.DotDotDotToken | undefined;
							const name = (isShort ? dotDotDotTokenOrName : nameOrQuestionToken) as string | TS.BindingName;
							const questionToken = (isShort ? nameOrQuestionToken : questionTokenOrType) as TS.QuestionToken | undefined;
							const type = (isShort ? questionTokenOrType : typeOrInitializer) as TS.TypeNode | undefined;
							const initializer = (isShort ? typeOrInitializer : initializerOrUndefined) as TS.Expression | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createParameterDeclaration(
								decorators as never,
								modifiers as never,
								dotDotDotToken as never,
								name as never,
								questionToken as never,
								type as never,
								initializer as never
							) as unknown as TS.ParameterDeclaration;
						}

						function updateParameterDeclaration(
							node: TS.ParameterDeclaration,
							modifiers: readonly TS.ModifierLike[] | undefined,
							dotDotDotToken: TS.DotDotDotToken | undefined,
							name: string | TS.BindingName,
							questionToken?: TS.QuestionToken,
							type?: TS.TypeNode,
							initializer?: TS.Expression
						): TS.ParameterDeclaration;
						function updateParameterDeclaration(
							node: TS.ParameterDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							dotDotDotToken: TS.DotDotDotToken | undefined,
							name: string | TS.BindingName,
							questionToken?: TS.QuestionToken,
							type?: TS.TypeNode,
							initializer?: TS.Expression
						): TS.ParameterDeclaration;
						function updateParameterDeclaration(
							node: TS.ParameterDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrDotDotDotToken: readonly TS.Modifier[] | TS.DotDotDotToken | undefined,
							dotDotDotTokenOrName: TS.DotDotDotToken | string | TS.BindingName | undefined,
							nameOrQuestionToken?: string | TS.BindingName | TS.QuestionToken,
							questionTokenOrType?: TS.QuestionToken | TS.TypeNode,
							typeOrInitializer?: TS.TypeNode | TS.Expression,
							initializerOrUndefined?: TS.Expression
						): TS.ParameterDeclaration {
							const isShort = typeof dotDotDotTokenOrName === "string" || (dotDotDotTokenOrName != null && dotDotDotTokenOrName.kind !== (25 as number)); /* DotDotDotToken */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort
								? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1]
								: (modifiersOrDotDotDotToken as readonly TS.Modifier[]);
							const dotDotDotToken = (isShort ? modifiersOrDotDotDotToken : dotDotDotTokenOrName) as TS.DotDotDotToken | undefined;
							const name = (isShort ? dotDotDotTokenOrName : nameOrQuestionToken) as string | TS.BindingName;
							const questionToken = (isShort ? nameOrQuestionToken : questionTokenOrType) as TS.QuestionToken | undefined;
							const type = (isShort ? questionTokenOrType : typeOrInitializer) as TS.TypeNode | undefined;
							const initializer = (isShort ? typeOrInitializer : initializerOrUndefined) as TS.Expression | undefined;
							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateParameterDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								dotDotDotToken as never,
								name as never,
								questionToken as never,
								type as never,
								initializer as never
							) as unknown as TS.ParameterDeclaration;
						}

						function createPropertyDeclaration(
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.PropertyName,
							questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
							type: TS.TypeNode | undefined,
							initializer: TS.Expression | undefined
						): TS.PropertyDeclaration;
						function createPropertyDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.PropertyName,
							questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
							type: TS.TypeNode | undefined,
							initializer: TS.Expression | undefined
						): TS.PropertyDeclaration;
						function createPropertyDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.PropertyName | undefined,
							nameOrQuestionOrExclamationToken: string | TS.PropertyName | TS.QuestionToken | TS.ExclamationToken | undefined,
							questionOrExclamationTokenOrType: TS.QuestionToken | TS.ExclamationToken | TS.TypeNode | undefined,
							typeOrInitializer: TS.TypeNode | TS.Expression | undefined,
							initializerOrUndefined?: TS.Expression | undefined
						): TS.PropertyDeclaration {
							const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrQuestionOrExclamationToken) as string | TS.PropertyName;
							const questionOrExclamationToken = (isShort ? nameOrQuestionOrExclamationToken : questionOrExclamationTokenOrType) as
								| TS.QuestionToken
								| TS.ExclamationToken
								| undefined;
							const type = (isShort ? questionOrExclamationTokenOrType : typeOrInitializer) as TS.TypeNode | undefined;
							const initializer = (isShort ? typeOrInitializer : initializerOrUndefined) as TS.Expression | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createPropertyDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								questionOrExclamationToken as never,
								type as never,
								initializer as never
							) as unknown as TS.PropertyDeclaration;
						}

						function updatePropertyDeclaration(
							node: TS.PropertyDeclaration,
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.PropertyName,
							questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
							type: TS.TypeNode | undefined,
							initializer: TS.Expression | undefined
						): TS.PropertyDeclaration;
						function updatePropertyDeclaration(
							node: TS.PropertyDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.PropertyName,
							questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
							type: TS.TypeNode | undefined,
							initializer: TS.Expression | undefined
						): TS.PropertyDeclaration;
						function updatePropertyDeclaration(
							node: TS.PropertyDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.PropertyName | undefined,
							nameOrQuestionOrExclamationToken: string | TS.PropertyName | TS.QuestionToken | TS.ExclamationToken | undefined,
							questionOrExclamationTokenOrType: TS.QuestionToken | TS.ExclamationToken | TS.TypeNode | undefined,
							typeOrInitializer: TS.TypeNode | TS.Expression | undefined,
							initializerOrUndefined?: TS.Expression | undefined
						): TS.PropertyDeclaration {
							const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrQuestionOrExclamationToken) as string | TS.PropertyName;
							const questionOrExclamationToken = (isShort ? nameOrQuestionOrExclamationToken : questionOrExclamationTokenOrType) as
								| TS.QuestionToken
								| TS.ExclamationToken
								| undefined;
							const type = (isShort ? questionOrExclamationTokenOrType : typeOrInitializer) as TS.TypeNode | undefined;
							const initializer = (isShort ? typeOrInitializer : initializerOrUndefined) as TS.Expression | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updatePropertyDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								questionOrExclamationToken as never,
								type as never,
								initializer as never
							) as unknown as TS.PropertyDeclaration;
						}

						function createMethodDeclaration(
							modifiers: readonly TS.ModifierLike[] | undefined,
							asteriskToken: TS.AsteriskToken | undefined,
							name: string | TS.PropertyName | undefined,
							questionToken: TS.QuestionToken | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.MethodDeclaration;
						function createMethodDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							asteriskToken: TS.AsteriskToken | undefined,
							name: string | TS.PropertyName | undefined,
							questionToken: TS.QuestionToken | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.MethodDeclaration;
						function createMethodDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrAsteriskToken: TS.AsteriskToken | readonly TS.Modifier[] | undefined,
							asteriskTokenOrName: TS.AsteriskToken | string | TS.PropertyName | undefined,
							nameOrQuestionToken: string | TS.PropertyName | TS.QuestionToken | undefined,
							questionTokenOrTypeParameters: TS.QuestionToken | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
							parametersOrType: TS.TypeNode | readonly TS.ParameterDeclaration[] | undefined,
							typeOrBody: TS.TypeNode | TS.Block | undefined,
							bodyOrUndefined?: TS.Block
						): TS.MethodDeclaration {
							const isShort = typeof asteriskTokenOrName === "string" || (asteriskTokenOrName != null && asteriskTokenOrName.kind !== (41 as number)); /* AsteriskToken */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort
								? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1]
								: (modifiersOrAsteriskToken as readonly TS.Modifier[]);
							const asteriskToken = (isShort ? modifiersOrAsteriskToken : asteriskTokenOrName) as TS.AsteriskToken | undefined;
							const name = (isShort ? asteriskTokenOrName : nameOrQuestionToken) as string | TS.PropertyName;
							const questionToken = (isShort ? nameOrQuestionToken : questionTokenOrTypeParameters) as TS.QuestionToken | undefined;
							const typeParameters = (isShort ? questionTokenOrTypeParameters : typeParametersOrParameters) as readonly TS.TypeParameterDeclaration[] | undefined;
							const parameters = (isShort ? typeParametersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[] | undefined;
							const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode | undefined;
							const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createMethodDeclaration(
								decorators as never,
								modifiers as never,
								asteriskToken as never,
								name as never,
								questionToken as never,
								typeParameters as never,
								parameters as never,
								type as never,
								body as never
							) as unknown as TS.MethodDeclaration;
						}

						function updateMethodDeclaration(
							node: TS.MethodDeclaration,
							modifiers: readonly TS.ModifierLike[] | undefined,
							asteriskToken: TS.AsteriskToken | undefined,
							name: string | TS.PropertyName,
							questionToken: TS.QuestionToken | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.MethodDeclaration;
						function updateMethodDeclaration(
							node: TS.MethodDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							asteriskToken: TS.AsteriskToken | undefined,
							name: string | TS.PropertyName | undefined,
							questionToken: TS.QuestionToken | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.MethodDeclaration;
						function updateMethodDeclaration(
							node: TS.MethodDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrAsteriskToken: TS.AsteriskToken | readonly TS.Modifier[] | undefined,
							asteriskTokenOrName: TS.AsteriskToken | string | TS.PropertyName | undefined,
							nameOrQuestionToken: string | TS.PropertyName | TS.QuestionToken | undefined,
							questionTokenOrTypeParameters: TS.QuestionToken | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
							parametersOrType: TS.TypeNode | readonly TS.ParameterDeclaration[] | undefined,
							typeOrBody: TS.TypeNode | TS.Block | undefined,
							bodyOrUndefined?: TS.Block
						): TS.MethodDeclaration {
							const isShort = typeof asteriskTokenOrName === "string" || (asteriskTokenOrName != null && asteriskTokenOrName.kind !== (41 as number)); /* AsteriskToken */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort
								? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1]
								: (modifiersOrAsteriskToken as readonly TS.Modifier[]);
							const asteriskToken = (isShort ? modifiersOrAsteriskToken : asteriskTokenOrName) as TS.AsteriskToken | undefined;
							const name = (isShort ? asteriskTokenOrName : nameOrQuestionToken) as string | TS.PropertyName;
							const questionToken = (isShort ? nameOrQuestionToken : questionTokenOrTypeParameters) as TS.QuestionToken | undefined;
							const typeParameters = (isShort ? questionTokenOrTypeParameters : typeParametersOrParameters) as readonly TS.TypeParameterDeclaration[] | undefined;
							const parameters = (isShort ? typeParametersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[] | undefined;
							const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode | undefined;
							const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;
							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateMethodDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								asteriskToken as never,
								name as never,
								questionToken as never,
								typeParameters as never,
								parameters as never,
								type as never,
								body as never
							) as unknown as TS.MethodDeclaration;
						}

						function createConstructorDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							body: TS.Block | undefined
						): TS.ConstructorDeclaration;
						function createConstructorDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							body: TS.Block | undefined
						): TS.ConstructorDeclaration;
						function createConstructorDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrParameters: readonly TS.Modifier[] | readonly TS.ParameterDeclaration[] | undefined,
							parametersOrBody: readonly TS.ParameterDeclaration[] | TS.Block | undefined,
							bodyOrUndefined?: TS.Block | undefined
						): TS.ConstructorDeclaration {
							const isShort = arguments.length <= 3;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrParameters as readonly TS.Modifier[]);
							const parameters = (isShort ? modifiersOrParameters : parametersOrBody) as readonly TS.ParameterDeclaration[] | undefined;
							const body = (isShort ? parametersOrBody : bodyOrUndefined) as TS.Block | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createConstructorDeclaration(
								decorators as never,
								modifiers as never,
								parameters as never,
								body as never
							) as unknown as TS.ConstructorDeclaration;
						}

						function updateConstructorDeclaration(
							node: TS.ConstructorDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							body: TS.Block | undefined
						): TS.ConstructorDeclaration;
						function updateConstructorDeclaration(
							node: TS.ConstructorDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							body: TS.Block | undefined
						): TS.ConstructorDeclaration;
						function updateConstructorDeclaration(
							node: TS.ConstructorDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrParameters: readonly TS.Modifier[] | readonly TS.ParameterDeclaration[] | undefined,
							parametersOrBody: readonly TS.ParameterDeclaration[] | TS.Block | undefined,
							bodyOrUndefined?: TS.Block | undefined
						): TS.ConstructorDeclaration {
							const isShort = arguments.length <= 4;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrParameters as readonly TS.Modifier[]);
							const parameters = (isShort ? modifiersOrParameters : parametersOrBody) as readonly TS.ParameterDeclaration[] | undefined;
							const body = (isShort ? parametersOrBody : bodyOrUndefined) as TS.Block | undefined;
							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateConstructorDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								parameters as never,
								body as never
							) as unknown as TS.ConstructorDeclaration;
						}

						function createGetAccessorDeclaration(
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.PropertyName,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.GetAccessorDeclaration;
						function createGetAccessorDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.PropertyName,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.GetAccessorDeclaration;
						function createGetAccessorDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.ModifierLike[] | string | TS.PropertyName | undefined,
							nameOrParameters: string | TS.PropertyName | readonly TS.ParameterDeclaration[],
							parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
							typeOrBody: TS.TypeNode | TS.Block | undefined,
							bodyOrUndefined?: TS.Block
						): TS.GetAccessorDeclaration {
							const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrParameters) as string | TS.PropertyName;
							const parameters = (isShort ? nameOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[] | undefined;
							const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode | undefined;
							const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createGetAccessorDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								parameters as never,
								type as never,
								body as never
							) as unknown as TS.GetAccessorDeclaration;
						}

						function updateGetAccessorDeclaration(
							node: TS.GetAccessorDeclaration,
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.PropertyName,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.GetAccessorDeclaration;
						function updateGetAccessorDeclaration(
							node: TS.GetAccessorDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.PropertyName,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.GetAccessorDeclaration;
						function updateGetAccessorDeclaration(
							node: TS.GetAccessorDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.ModifierLike[] | string | TS.PropertyName | undefined,
							nameOrParameters: string | TS.PropertyName | readonly TS.ParameterDeclaration[],
							parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
							typeOrBody: TS.TypeNode | TS.Block | undefined,
							bodyOrUndefined?: TS.Block
						): TS.GetAccessorDeclaration {
							const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrParameters) as string | TS.PropertyName;
							const parameters = (isShort ? nameOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[] | undefined;
							const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode | undefined;
							const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;
							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateGetAccessorDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								parameters as never,
								type as never,
								body as never
							) as unknown as TS.GetAccessorDeclaration;
						}

						function createSetAccessorDeclaration(
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.PropertyName,
							parameters: readonly TS.ParameterDeclaration[],
							body: TS.Block | undefined
						): TS.SetAccessorDeclaration;
						function createSetAccessorDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.PropertyName,
							parameters: readonly TS.ParameterDeclaration[],
							body: TS.Block | undefined
						): TS.SetAccessorDeclaration;
						function createSetAccessorDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.ModifierLike[] | string | TS.PropertyName | undefined,
							nameOrParameters: string | TS.PropertyName | readonly TS.ParameterDeclaration[],
							parametersOrBody: readonly TS.ParameterDeclaration[] | TS.Block | undefined,
							bodyOrUndefined?: TS.Block | undefined
						): TS.SetAccessorDeclaration {
							const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrParameters) as string | TS.PropertyName;
							const parameters = (isShort ? nameOrParameters : parametersOrBody) as readonly TS.ParameterDeclaration[] | undefined;
							const body = (isShort ? parametersOrBody : bodyOrUndefined) as TS.Block | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createSetAccessorDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								parameters as never,
								body as never
							) as unknown as TS.SetAccessorDeclaration;
						}

						function updateSetAccessorDeclaration(
							node: TS.SetAccessorDeclaration,
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.PropertyName,
							parameters: readonly TS.ParameterDeclaration[],
							body: TS.Block | undefined
						): TS.SetAccessorDeclaration;
						function updateSetAccessorDeclaration(
							node: TS.SetAccessorDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.PropertyName,
							parameters: readonly TS.ParameterDeclaration[],
							body: TS.Block | undefined
						): TS.SetAccessorDeclaration;
						function updateSetAccessorDeclaration(
							node: TS.SetAccessorDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.ModifierLike[] | string | TS.PropertyName | undefined,
							nameOrParameters: string | TS.PropertyName | readonly TS.ParameterDeclaration[],
							parametersOrBody: readonly TS.ParameterDeclaration[] | TS.Block | undefined,
							bodyOrUndefined?: TS.Block | undefined
						): TS.SetAccessorDeclaration {
							const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrParameters) as string | TS.PropertyName;
							const parameters = (isShort ? nameOrParameters : parametersOrBody) as readonly TS.ParameterDeclaration[] | undefined;
							const body = (isShort ? parametersOrBody : bodyOrUndefined) as TS.Block | undefined;
							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateSetAccessorDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								parameters as never,
								body as never
							) as unknown as TS.SetAccessorDeclaration;
						}

						function createIndexSignature(
							modifiers: readonly TS.Modifier[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode
						): TS.IndexSignatureDeclaration;
						function createIndexSignature(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode
						): TS.IndexSignatureDeclaration;
						function createIndexSignature(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrParameters: readonly TS.Modifier[] | readonly TS.ParameterDeclaration[] | undefined,
							parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode,
							typeOrUndefined?: TS.TypeNode
						): TS.IndexSignatureDeclaration {
							const isShort = arguments.length <= 3;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrParameters as readonly TS.Modifier[]);
							const parameters = (isShort ? modifiersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[];
							const type = (isShort ? parametersOrType : typeOrUndefined) as TS.TypeNode;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createIndexSignature(
								decorators as never,
								modifiers as never,
								parameters as never,
								type as never
							) as unknown as TS.IndexSignatureDeclaration;
						}

						function updateIndexSignature(
							node: TS.IndexSignatureDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode
						): TS.IndexSignatureDeclaration;
						function updateIndexSignature(
							node: TS.IndexSignatureDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode
						): TS.IndexSignatureDeclaration;
						function updateIndexSignature(
							node: TS.IndexSignatureDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrParameters: readonly TS.Modifier[] | readonly TS.ParameterDeclaration[] | undefined,
							parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode,
							typeOrUndefined?: TS.TypeNode
						): TS.IndexSignatureDeclaration {
							const isShort = arguments.length <= 4;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrParameters as readonly TS.Modifier[]);
							const parameters = (isShort ? modifiersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[];
							const type = (isShort ? parametersOrType : typeOrUndefined) as TS.TypeNode;
							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateIndexSignature(
								node as never,
								decorators as never,
								modifiers as never,
								parameters as never,
								type as never
							) as unknown as TS.IndexSignatureDeclaration;
						}

						function createClassStaticBlockDeclaration(body: TS.Block): TS.ClassStaticBlockDeclaration;
						function createClassStaticBlockDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							body: TS.Block
						): TS.ClassStaticBlockDeclaration;
						function createClassStaticBlockDeclaration(
							decoratorsOrBody: readonly TS.Decorator[] | TS.Block | undefined,
							modifiersOrUndefined?: readonly TS.Modifier[] | undefined,
							bodyOrUndefined?: TS.Block
						): TS.ClassStaticBlockDeclaration {
							const isShort = arguments.length <= 1;
							const body = (isShort ? decoratorsOrBody : bodyOrUndefined) as TS.Block;

							if (missingCreateClassStaticBlockDeclaration) {
								const node = factory.createEmptyStatement() as unknown as Mutable<TS.ClassStaticBlockDeclaration>;
								node.body = body;
								(node as NodeWithInternalFlags).transformFlags = 8388608 /* ContainsClassFields */;
								return node;
							} else {
								return ts4CastFactory.createClassStaticBlockDeclaration(undefined, undefined, body as never) as never;
							}
						}

						function updateClassStaticBlockDeclaration(node: TS.ClassStaticBlockDeclaration, body: TS.Block): TS.ClassStaticBlockDeclaration;
						function updateClassStaticBlockDeclaration(
							node: TS.ClassStaticBlockDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							body: TS.Block
						): TS.ClassStaticBlockDeclaration;
						function updateClassStaticBlockDeclaration(
							node: TS.ClassStaticBlockDeclaration,
							decoratorsOrBody: readonly TS.Decorator[] | TS.Block | undefined,
							modifiersOrUndefined?: readonly TS.Modifier[] | undefined,
							bodyOrUndefined?: TS.Block
						): TS.ClassStaticBlockDeclaration {
							const isShort = arguments.length <= 2;
							const body = (isShort ? decoratorsOrBody : bodyOrUndefined) as TS.Block;

							if (missingCreateClassStaticBlockDeclaration) {
								return body === node.body ? node : update(createClassStaticBlockDeclaration(body), node);
							} else {
								return ts4CastFactory.updateClassStaticBlockDeclaration(node as never, undefined, undefined, body as never) as never;
							}
						}

						function createClassExpression(
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.ClassElement[]
						): TS.ClassExpression;
						function createClassExpression(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.ClassElement[]
						): TS.ClassExpression;
						function createClassExpression(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.ModifierLike[] | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
							heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.ClassElement[] | undefined,
							membersOrUndefined?: readonly TS.ClassElement[]
						): TS.ClassExpression {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
							const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
							const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.ClassElement[];

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createClassExpression(
								decorators as never,
								modifiers as never,
								name as never,
								typeParameters as never,
								heritageClauses as never,
								members as never
							) as unknown as TS.ClassExpression;
						}

						function updateClassExpression(
							node: TS.ClassExpression,
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.ClassElement[]
						): TS.ClassExpression;
						function updateClassExpression(
							node: TS.ClassExpression,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.ClassElement[]
						): TS.ClassExpression;
						function updateClassExpression(
							node: TS.ClassExpression,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.ModifierLike[] | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
							heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.ClassElement[] | undefined,
							membersOrUndefined?: readonly TS.ClassElement[]
						): TS.ClassExpression {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
							const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
							const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.ClassElement[];

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateClassExpression(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								typeParameters as never,
								heritageClauses as never,
								members as never
							) as unknown as TS.ClassExpression;
						}

						function createFunctionDeclaration(
							modifiers: readonly TS.ModifierLike[] | undefined,
							asteriskToken: TS.AsteriskToken | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.FunctionDeclaration;
						function createFunctionDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							asteriskToken: TS.AsteriskToken | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.FunctionDeclaration;
						function createFunctionDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrAsteriskToken: readonly TS.Modifier[] | TS.AsteriskToken | undefined,
							asteriskTokenOrName: TS.AsteriskToken | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
							parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
							typeOrBody: TS.TypeNode | TS.Block | undefined,
							bodyOrUndefined?: TS.Block | undefined
						): TS.FunctionDeclaration {
							const isShort = arguments.length <= 7;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort
								? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1]
								: (modifiersOrAsteriskToken as readonly TS.Modifier[]);
							const asteriskToken = (isShort ? modifiersOrAsteriskToken : asteriskTokenOrName) as TS.AsteriskToken | undefined;
							const name = (isShort ? asteriskTokenOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrParameters) as readonly TS.TypeParameterDeclaration[];
							const parameters = (isShort ? typeParametersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[] | undefined;
							const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode;
							const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createFunctionDeclaration(
								decorators as never,
								modifiers as never,
								asteriskToken as never,
								name as never,
								typeParameters as never,
								parameters as never,
								type as never,
								body as never
							) as unknown as TS.FunctionDeclaration;
						}

						function updateFunctionDeclaration(
							node: TS.FunctionDeclaration,
							modifiers: readonly TS.ModifierLike[] | undefined,
							asteriskToken: TS.AsteriskToken | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.FunctionDeclaration;
						function updateFunctionDeclaration(
							node: TS.FunctionDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							asteriskToken: TS.AsteriskToken | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							parameters: readonly TS.ParameterDeclaration[],
							type: TS.TypeNode | undefined,
							body: TS.Block | undefined
						): TS.FunctionDeclaration;
						function updateFunctionDeclaration(
							node: TS.FunctionDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrAsteriskToken: readonly TS.Modifier[] | TS.AsteriskToken | undefined,
							asteriskTokenOrName: TS.AsteriskToken | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
							parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
							typeOrBody: TS.TypeNode | TS.Block | undefined,
							bodyOrUndefined?: TS.Block | undefined
						): TS.FunctionDeclaration {
							const isShort = arguments.length <= 8;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort
								? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1]
								: (modifiersOrAsteriskToken as readonly TS.Modifier[]);
							const asteriskToken = (isShort ? modifiersOrAsteriskToken : asteriskTokenOrName) as TS.AsteriskToken | undefined;
							const name = (isShort ? asteriskTokenOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrParameters) as readonly TS.TypeParameterDeclaration[];
							const parameters = (isShort ? typeParametersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[] | undefined;
							const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode;
							const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateFunctionDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								asteriskToken as never,
								name as never,
								typeParameters as never,
								parameters as never,
								type as never,
								body as never
							) as unknown as TS.FunctionDeclaration;
						}

						function createClassDeclaration(
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.ClassElement[]
						): TS.ClassDeclaration;
						function createClassDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.ClassElement[]
						): TS.ClassDeclaration;
						function createClassDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
							heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.ClassElement[] | undefined,
							membersOrUndefined?: readonly TS.ClassElement[]
						): TS.ClassDeclaration {
							const isShort = arguments.length <= 5;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
							const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
							const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.ClassElement[];

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createClassDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								typeParameters as never,
								heritageClauses as never,
								members as never
							) as unknown as TS.ClassDeclaration;
						}

						function updateClassDeclaration(
							node: TS.ClassDeclaration,
							modifiers: readonly TS.ModifierLike[] | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.ClassElement[]
						): TS.ClassDeclaration;
						function updateClassDeclaration(
							node: TS.ClassDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier | undefined,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.ClassElement[]
						): TS.ClassDeclaration;
						function updateClassDeclaration(
							node: TS.ClassDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
							heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.ClassElement[] | undefined,
							membersOrUndefined?: readonly TS.ClassElement[]
						): TS.ClassDeclaration {
							const isShort = arguments.length <= 6;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
							const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
							const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.ClassElement[];

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateClassDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								typeParameters as never,
								heritageClauses as never,
								members as never
							) as unknown as TS.ClassDeclaration;
						}

						function createInterfaceDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.TypeElement[]
						): TS.InterfaceDeclaration;
						function createInterfaceDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.TypeElement[]
						): TS.InterfaceDeclaration;
						function createInterfaceDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
							heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.TypeElement[] | undefined,
							membersOrUndefined?: readonly TS.TypeElement[]
						): TS.InterfaceDeclaration {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
							const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
							const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.TypeElement[];

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createInterfaceDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								typeParameters as never,
								heritageClauses as never,
								members as never
							) as unknown as TS.InterfaceDeclaration;
						}

						function updateInterfaceDeclaration(
							node: TS.InterfaceDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.TypeElement[]
						): TS.InterfaceDeclaration;
						function updateInterfaceDeclaration(
							node: TS.InterfaceDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							heritageClauses: readonly TS.HeritageClause[] | undefined,
							members: readonly TS.TypeElement[]
						): TS.InterfaceDeclaration;
						function updateInterfaceDeclaration(
							node: TS.InterfaceDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
							heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.TypeElement[] | undefined,
							membersOrUndefined?: readonly TS.TypeElement[]
						): TS.InterfaceDeclaration {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
							const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
							const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.TypeElement[];

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateInterfaceDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								typeParameters as never,
								heritageClauses as never,
								members as never
							) as unknown as TS.InterfaceDeclaration;
						}

						function createTypeAliasDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							type: TS.TypeNode
						): TS.TypeAliasDeclaration;
						function createTypeAliasDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							type: TS.TypeNode
						): TS.TypeAliasDeclaration;
						function createTypeAliasDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrType: readonly TS.TypeParameterDeclaration[] | TS.TypeNode | undefined,
							typeOrUndefined?: TS.TypeNode
						): TS.TypeAliasDeclaration {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrType) as readonly TS.TypeParameterDeclaration[];
							const type = (isShort ? typeParametersOrType : typeOrUndefined) as TS.TypeNode[] | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createTypeAliasDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								typeParameters as never,
								type as never
							) as unknown as TS.TypeAliasDeclaration;
						}

						function updateTypeAliasDeclaration(
							node: TS.TypeAliasDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							type: TS.TypeNode
						): TS.TypeAliasDeclaration;
						function updateTypeAliasDeclaration(
							node: TS.TypeAliasDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
							type: TS.TypeNode
						): TS.TypeAliasDeclaration;
						function updateTypeAliasDeclaration(
							node: TS.TypeAliasDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
							typeParametersOrType: readonly TS.TypeParameterDeclaration[] | TS.TypeNode | undefined,
							typeOrUndefined?: TS.TypeNode
						): TS.TypeAliasDeclaration {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
							const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrType) as readonly TS.TypeParameterDeclaration[];
							const type = (isShort ? typeParametersOrType : typeOrUndefined) as TS.TypeNode[] | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateTypeAliasDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								typeParameters as never,
								type as never
							) as unknown as TS.TypeAliasDeclaration;
						}

						function createEnumDeclaration(modifiers: readonly TS.Modifier[] | undefined, name: string | TS.Identifier, members: readonly TS.EnumMember[]): TS.EnumDeclaration;
						function createEnumDeclaration(
							decorators: readonly TS.Decorator[],
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							members: readonly TS.EnumMember[]
						): TS.EnumDeclaration;
						function createEnumDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrMembers: string | TS.Identifier | readonly TS.EnumMember[],
							membersOrUndefined?: readonly TS.EnumMember[]
						): TS.EnumDeclaration {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrMembers) as string | TS.Identifier;
							const members = (isShort ? nameOrMembers : membersOrUndefined) as readonly TS.EnumMember[];

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createEnumDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								members as never
							) as unknown as TS.EnumDeclaration;
						}

						function updateEnumDeclaration(
							node: TS.EnumDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							members: readonly TS.EnumMember[]
						): TS.EnumDeclaration;
						function updateEnumDeclaration(
							node: TS.EnumDeclaration,
							decorators: readonly TS.Decorator[],
							modifiers: readonly TS.Modifier[] | undefined,
							name: string | TS.Identifier,
							members: readonly TS.EnumMember[]
						): TS.EnumDeclaration;
						function updateEnumDeclaration(
							node: TS.EnumDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
							nameOrMembers: string | TS.Identifier | readonly TS.EnumMember[],
							membersOrUndefined?: readonly TS.EnumMember[]
						): TS.EnumDeclaration {
							const isShort =
								typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrMembers) as string | TS.Identifier;
							const members = (isShort ? nameOrMembers : membersOrUndefined) as readonly TS.EnumMember[];

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateEnumDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								members as never
							) as unknown as TS.EnumDeclaration;
						}

						function createModuleDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							name: TS.ModuleName,
							body: TS.ModuleBody | undefined,
							flags?: TS.NodeFlags
						): TS.ModuleDeclaration;
						function createModuleDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: TS.ModuleName,
							body: TS.ModuleBody | undefined,
							flags?: TS.NodeFlags
						): TS.ModuleDeclaration;
						function createModuleDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | TS.ModuleName | undefined,
							nameOrBody: TS.ModuleName | TS.ModuleBody | undefined,
							bodyOrFlags: TS.ModuleBody | TS.NodeFlags | undefined,
							flagsOrUndefined?: TS.NodeFlags
						): TS.ModuleDeclaration {
							const isShort =
								typeof modifiersOrName === "string" ||
								(modifiersOrName != null &&
									!Array.isArray(modifiersOrName) &&
									("escapedText" in modifiersOrName /* Identifier */ || "_literalExpressionBrand" in modifiersOrName)); /* StringLiteral */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrBody) as TS.ModuleName;
							const body = (isShort ? nameOrBody : bodyOrFlags) as TS.ModuleBody | undefined;
							const flags = (isShort ? bodyOrFlags : flagsOrUndefined) as TS.NodeFlags | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createModuleDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								body as never,
								flags as never
							) as unknown as TS.ModuleDeclaration;
						}

						function updateModuleDeclaration(
							node: TS.ModuleDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							name: TS.ModuleName,
							body: TS.ModuleBody | undefined
						): TS.ModuleDeclaration;
						function updateModuleDeclaration(
							node: TS.ModuleDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							name: TS.ModuleName,
							body: TS.ModuleBody | undefined
						): TS.ModuleDeclaration;
						function updateModuleDeclaration(
							node: TS.ModuleDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrName: readonly TS.Modifier[] | TS.ModuleName | undefined,
							nameOrBody: TS.ModuleName | TS.ModuleBody | undefined,
							bodyOrUndefined?: TS.ModuleBody | undefined
						): TS.ModuleDeclaration {
							const isShort =
								typeof modifiersOrName === "string" ||
								(modifiersOrName != null &&
									!Array.isArray(modifiersOrName) &&
									("escapedText" in modifiersOrName /* Identifier */ || "_literalExpressionBrand" in modifiersOrName)); /* StringLiteral */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
							const name = (isShort ? modifiersOrName : nameOrBody) as TS.ModuleName;
							const body = (isShort ? nameOrBody : bodyOrUndefined) as TS.ModuleBody | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateModuleDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								name as never,
								body as never
							) as unknown as TS.ModuleDeclaration;
						}

						function createImportEqualsDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration;
						function createImportEqualsDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration;
						function createImportEqualsDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
							isTypeOnlyOrName: boolean | string | TS.Identifier,
							nameOrModuleReference: string | TS.Identifier | TS.ModuleReference,
							moduleReferenceOrUndefined?: TS.ModuleReference
						): TS.ImportEqualsDeclaration {
							const isShort = arguments.length <= 4;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
							const isTypeOnly = ((isShort ? modifiersOrIsTypeOnly : isTypeOnlyOrName) as boolean | undefined) ?? false;
							const name = (isShort ? isTypeOnlyOrName : nameOrModuleReference) as string | TS.Identifier;
							const moduleReference = (isShort ? nameOrModuleReference : moduleReferenceOrUndefined) as TS.ModuleReference;

							if (badCreateImportEqualsDeclaration) {
								return (factory as unknown as import("typescript-4-1-2").NodeFactory).createImportEqualsDeclaration(
									decorators as never,
									modifiers as never,
									name as never,
									moduleReference as never
								) as unknown as TS.ImportEqualsDeclaration;
							} else {
								return (factory as unknown as import("typescript-4-7-2").NodeFactory).createImportEqualsDeclaration(
									decorators as never,
									modifiers as never,
									isTypeOnly as never,
									name as never,
									moduleReference as never
								) as unknown as TS.ImportEqualsDeclaration;
							}
						}

						function updateImportEqualsDeclaration(
							node: TS.ImportEqualsDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration;
						function updateImportEqualsDeclaration(
							node: TS.ImportEqualsDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration;
						function updateImportEqualsDeclaration(
							node: TS.ImportEqualsDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
							isTypeOnlyOrName: boolean | string | TS.Identifier,
							nameOrModuleReference: string | TS.Identifier | TS.ModuleReference,
							moduleReferenceOrUndefined?: TS.ModuleReference
						): TS.ImportEqualsDeclaration {
							const isShort = arguments.length <= 5;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
							const isTypeOnly = (isShort ? modifiersOrIsTypeOnly : isTypeOnlyOrName) as boolean;
							const name = (isShort ? isTypeOnlyOrName : nameOrModuleReference) as string | TS.Identifier;
							const moduleReference = (isShort ? nameOrModuleReference : moduleReferenceOrUndefined) as TS.ModuleReference;

							if (badCreateImportEqualsDeclaration) {
								return (factory as unknown as import("typescript-4-1-2").NodeFactory).updateImportEqualsDeclaration(
									node as never,
									decorators as never,
									modifiers as never,
									name as never,
									moduleReference as never
								) as unknown as TS.ImportEqualsDeclaration;
							} else {
								return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateImportEqualsDeclaration(
									node as never,
									decorators as never,
									modifiers as never,
									isTypeOnly as never,
									name as never,
									moduleReference as never
								) as unknown as TS.ImportEqualsDeclaration;
							}
						}

						function createImportDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							importClause: TS.ImportClause | undefined,
							moduleSpecifier: TS.Expression,
							assertClause?: TS.AssertClause
						): TS.ImportDeclaration;
						function createImportDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							importClause: TS.ImportClause | undefined,
							moduleSpecifier: TS.Expression,
							assertClause?: TS.AssertClause
						): TS.ImportDeclaration;
						function createImportDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrImportClause: readonly TS.Modifier[] | TS.ImportClause | undefined,
							importClauseOrModuleSpecifier: TS.ImportClause | TS.Expression | undefined,
							moduleSpecifierOrAssertClause: TS.Expression | TS.AssertClause | undefined,
							assertClauseOrUndefined?: TS.AssertClause
						): TS.ImportDeclaration {
							const isShort = modifiersOrImportClause != null && !Array.isArray(modifiersOrImportClause);
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrImportClause as readonly TS.Modifier[]);
							const importClause = (isShort ? modifiersOrImportClause : importClauseOrModuleSpecifier) as TS.ImportClause | undefined;
							const moduleSpecifier = (isShort ? importClauseOrModuleSpecifier : moduleSpecifierOrAssertClause) as TS.Expression;
							const assertClause = (isShort ? moduleSpecifierOrAssertClause : assertClauseOrUndefined) as TS.AssertClause | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createImportDeclaration(
								decorators as never,
								modifiers as never,
								importClause as never,
								moduleSpecifier as never,
								assertClause as never
							) as unknown as TS.ImportDeclaration;
						}

						function updateImportDeclaration(
							node: TS.ImportDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							importClause: TS.ImportClause | undefined,
							moduleSpecifier: TS.Expression,
							assertClause?: TS.AssertClause
						): TS.ImportDeclaration;
						function updateImportDeclaration(
							node: TS.ImportDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							importClause: TS.ImportClause | undefined,
							moduleSpecifier: TS.Expression,
							assertClause?: TS.AssertClause
						): TS.ImportDeclaration;
						function updateImportDeclaration(
							node: TS.ImportDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrImportClause: readonly TS.Modifier[] | TS.ImportClause | undefined,
							importClauseOrModuleSpecifier: TS.ImportClause | TS.Expression | undefined,
							moduleSpecifierOrAssertClause: TS.Expression | TS.AssertClause | undefined,
							assertClauseOrUndefined?: TS.AssertClause
						): TS.ImportDeclaration {
							const isShort = importClauseOrModuleSpecifier != null && importClauseOrModuleSpecifier.kind !== 267; /* ImportClause */
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrImportClause as readonly TS.Modifier[]);
							const importClause = (isShort ? modifiersOrImportClause : importClauseOrModuleSpecifier) as TS.ImportClause | undefined;
							const moduleSpecifier = (isShort ? importClauseOrModuleSpecifier : moduleSpecifierOrAssertClause) as TS.Expression;
							const assertClause = (isShort ? moduleSpecifierOrAssertClause : assertClauseOrUndefined) as TS.AssertClause | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateImportDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								importClause as never,
								moduleSpecifier as never,
								assertClause as never
							) as unknown as TS.ImportDeclaration;
						}

						function createExportAssignment(modifiers: readonly TS.Modifier[] | undefined, isExportEquals: boolean | undefined, expression: TS.Expression): TS.ExportAssignment;
						function createExportAssignment(
							decorators: readonly TS.Decorator[],
							modifiers: readonly TS.Modifier[] | undefined,
							isExportEquals: boolean | undefined,
							expression: TS.Expression
						): TS.ExportAssignment;
						function createExportAssignment(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrIsExportEquals: readonly TS.Modifier[] | boolean | undefined,
							isExportEqualsOrExpression: boolean | TS.Expression | undefined,
							expressionOrUndefined?: TS.Expression | undefined
						): TS.ExportAssignment {
							const isShort = arguments.length <= 3;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort
								? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1]
								: (modifiersOrIsExportEquals as readonly TS.Modifier[]);
							const isExportEquals = (isShort ? modifiersOrIsExportEquals : isExportEqualsOrExpression) as boolean;
							const expression = (isShort ? isExportEqualsOrExpression : expressionOrUndefined) as TS.Expression;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createExportAssignment(
								decorators as never,
								modifiers as never,
								isExportEquals as never,
								expression as never
							) as unknown as TS.ExportAssignment;
						}

						function updateExportAssignment(node: TS.ExportAssignment, modifiers: readonly TS.Modifier[] | undefined, expression: TS.Expression): TS.ExportAssignment;
						function updateExportAssignment(
							node: TS.ExportAssignment,
							decorators: readonly TS.Decorator[],
							modifiers: readonly TS.Modifier[] | undefined,
							expression: TS.Expression
						): TS.ExportAssignment;
						function updateExportAssignment(
							node: TS.ExportAssignment,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrExpression: readonly TS.Modifier[] | TS.Expression | undefined,
							expressionOrUndefined?: TS.Expression | undefined
						): TS.ExportAssignment {
							const isShort = arguments.length <= 3;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrExpression as readonly TS.Modifier[]);
							const expression = (isShort ? modifiersOrExpression : expressionOrUndefined) as TS.Expression;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateExportAssignment(
								node as never,
								decorators as never,
								modifiers as never,
								expression as never
							) as unknown as TS.ExportAssignment;
						}

						function createExportDeclaration(
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							exportClause: TS.NamedExportBindings | undefined,
							moduleSpecifier?: TS.Expression,
							assertClause?: TS.AssertClause
						): TS.ExportDeclaration;
						function createExportDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							exportClause: TS.NamedExportBindings | undefined,
							moduleSpecifier?: TS.Expression,
							assertClause?: TS.AssertClause
						): TS.ExportDeclaration;
						function createExportDeclaration(
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
							isTypeOnlyOrExportClause: boolean | TS.NamedExportBindings | undefined,
							exportClauseOrModuleSpecifier: TS.NamedExportBindings | TS.Expression | undefined,
							moduleSpecifierOrAssertClause: TS.Expression | TS.AssertClause | undefined,
							assertClauseOrUndefined?: TS.AssertClause
						): TS.ExportDeclaration {
							const isLong = typeof modifiersOrIsTypeOnly !== "boolean" && (arguments.length >= 6 || Array.isArray(modifiersOrIsTypeOnly));
							const isShort = !isLong;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
							const isTypeOnly = (isShort ? modifiersOrIsTypeOnly : isTypeOnlyOrExportClause) as boolean;
							const exportClause = (isShort ? isTypeOnlyOrExportClause : exportClauseOrModuleSpecifier) as TS.NamedExportBindings | undefined;
							const moduleSpecifier = (isShort ? exportClauseOrModuleSpecifier : moduleSpecifierOrAssertClause) as TS.Expression | undefined;
							const assertClause = (isShort ? moduleSpecifierOrAssertClause : assertClauseOrUndefined) as TS.AssertClause | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).createExportDeclaration(
								decorators as never,
								modifiers as never,
								isTypeOnly as never,
								exportClause as never,
								moduleSpecifier as never,
								assertClause as never
							) as unknown as TS.ExportDeclaration;
						}

						function updateExportDeclaration(
							node: TS.ExportDeclaration,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							exportClause: TS.NamedExportBindings | undefined,
							moduleSpecifier?: TS.Expression,
							assertClause?: TS.AssertClause
						): TS.ExportDeclaration;
						function updateExportDeclaration(
							node: TS.ExportDeclaration,
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							exportClause: TS.NamedExportBindings | undefined,
							moduleSpecifier?: TS.Expression,
							assertClause?: TS.AssertClause
						): TS.ExportDeclaration;
						function updateExportDeclaration(
							node: TS.ExportDeclaration,
							decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
							modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
							isTypeOnlyOrExportClause: boolean | TS.NamedExportBindings | undefined,
							exportClauseOrModuleSpecifier: TS.NamedExportBindings | TS.Expression | undefined,
							moduleSpecifierOrAssertClause: TS.Expression | TS.AssertClause | undefined,
							assertClauseOrUndefined?: TS.AssertClause
						): TS.ExportDeclaration {
							const isLong = typeof modifiersOrIsTypeOnly !== "boolean" && (arguments.length >= 7 || Array.isArray(modifiersOrIsTypeOnly));
							const isShort = !isLong;
							const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
							const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
							const isTypeOnly = (isShort ? modifiersOrIsTypeOnly : isTypeOnlyOrExportClause) as boolean;
							const exportClause = (isShort ? isTypeOnlyOrExportClause : exportClauseOrModuleSpecifier) as TS.NamedExportBindings | undefined;
							const moduleSpecifier = (isShort ? exportClauseOrModuleSpecifier : moduleSpecifierOrAssertClause) as TS.Expression | undefined;
							const assertClause = (isShort ? moduleSpecifierOrAssertClause : assertClauseOrUndefined) as TS.AssertClause | undefined;

							return (factory as unknown as import("typescript-4-7-2").NodeFactory).updateExportDeclaration(
								node as never,
								decorators as never,
								modifiers as never,
								isTypeOnly as never,
								exportClause as never,
								moduleSpecifier as never,
								assertClause as never
							) as unknown as TS.ExportDeclaration;
						}

						return {
							createParameterDeclaration,
							updateParameterDeclaration,
							createPropertyDeclaration,
							updatePropertyDeclaration,
							createMethodDeclaration,
							updateMethodDeclaration,
							createConstructorDeclaration,
							updateConstructorDeclaration,
							createGetAccessorDeclaration,
							updateGetAccessorDeclaration,
							createSetAccessorDeclaration,
							updateSetAccessorDeclaration,
							createIndexSignature,
							updateIndexSignature,
							createClassStaticBlockDeclaration,
							updateClassStaticBlockDeclaration,
							createClassExpression,
							updateClassExpression,
							createFunctionDeclaration,
							updateFunctionDeclaration,
							createClassDeclaration,
							updateClassDeclaration,
							createInterfaceDeclaration,
							updateInterfaceDeclaration,
							createTypeAliasDeclaration,
							updateTypeAliasDeclaration,
							createEnumDeclaration,
							updateEnumDeclaration,
							createModuleDeclaration,
							updateModuleDeclaration,
							createImportEqualsDeclaration,
							updateImportEqualsDeclaration,
							createImportDeclaration,
							updateImportDeclaration,
							createExportAssignment,
							updateExportAssignment,
							createExportDeclaration,
							updateExportDeclaration
						};
				  })()
				: {})
		};
	}
	return factory;
}

function createNodeFactory(typescript: typeof TS): TS.NodeFactory {
	const typescript4Cast = typescript as unknown as typeof import("typescript-4-9-4");

	function createToken(token: TS.SyntaxKind.SuperKeyword): TS.SuperExpression;
	function createToken(token: TS.SyntaxKind.ThisKeyword): TS.ThisExpression;
	function createToken(token: TS.SyntaxKind.NullKeyword): TS.NullLiteral;
	function createToken(token: TS.SyntaxKind.TrueKeyword): TS.TrueLiteral;
	function createToken(token: TS.SyntaxKind.FalseKeyword): TS.FalseLiteral;
	function createToken<TKind extends TS.PunctuationSyntaxKind>(token: TKind): TS.PunctuationToken<TKind>;
	function createToken<TKind extends TS.KeywordTypeSyntaxKind>(token: TKind): TS.KeywordTypeNode<TKind>;
	function createToken<TKind extends TS.ModifierSyntaxKind>(token: TKind): TS.ModifierToken<TKind>;
	function createToken<TKind extends TS.KeywordSyntaxKind>(token: TKind): TS.KeywordToken<TKind>;
	function createToken<TKind extends TS.SyntaxKind.Unknown | TS.SyntaxKind.EndOfFileToken>(token: TKind): TS.Token<TKind> {
		return typescript4Cast.createToken(token as unknown as TS4.SyntaxKind.Unknown) as unknown as TS.Token<TKind>;
	}

	function createConstructorTypeNode(
		modifiers: readonly TS.Modifier[] | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode
	): TS.ConstructorTypeNode;
	function createConstructorTypeNode(
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode
	): TS.ConstructorTypeNode;
	function createConstructorTypeNode(
		modifiersOrTypeParameters: readonly TS.Modifier[] | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode,
		typeOrUndefined?: TS.TypeNode
	): TS.ConstructorTypeNode {
		if (arguments.length >= 4) {
			return typescript4Cast.createConstructorTypeNode(typeParametersOrParameters as never, parametersOrType as never, typeOrUndefined as never) as never;
		}

		return typescript4Cast.createConstructorTypeNode(modifiersOrTypeParameters as never, typeParametersOrParameters as never, parametersOrType as never) as never;
	}

	function updateConstructorTypeNode(
		node: TS.ConstructorTypeNode,
		modifiers: readonly TS.Modifier[] | undefined,
		typeParameters: TS.NodeArray<TS.TypeParameterDeclaration> | undefined,
		parameters: TS.NodeArray<TS.ParameterDeclaration>,
		type: TS.TypeNode
	): TS.ConstructorTypeNode;
	function updateConstructorTypeNode(
		node: TS.ConstructorTypeNode,
		typeParameters: TS.NodeArray<TS.TypeParameterDeclaration> | undefined,
		parameters: TS.NodeArray<TS.ParameterDeclaration>,
		type: TS.TypeNode
	): TS.ConstructorTypeNode;
	function updateConstructorTypeNode(
		node: TS.ConstructorTypeNode,
		modifiersOrTypeParameters: readonly TS.Modifier[] | TS.NodeArray<TS.TypeParameterDeclaration> | undefined,
		typeParametersOrParameters: TS.NodeArray<TS.TypeParameterDeclaration> | TS.NodeArray<TS.ParameterDeclaration> | undefined,
		parametersOrType: TS.NodeArray<TS.ParameterDeclaration> | TS.TypeNode,
		typeOrUndefined?: TS.TypeNode
	): TS.ConstructorTypeNode {
		if (arguments.length >= 5) {
			return typescript4Cast.updateConstructorTypeNode(node as never, typeParametersOrParameters as never, parametersOrType as never, typeOrUndefined as never) as never;
		}

		return typescript4Cast.updateConstructorTypeNode(node as never, modifiersOrTypeParameters as never, typeParametersOrParameters as never, parametersOrType as never) as never;
	}

	function createNamedTupleMember(
		dotDotDotToken: TS.DotDotDotToken | undefined,
		name: TS.Identifier,
		questionToken: TS.QuestionToken | undefined,
		type: TS.TypeNode
	): TS.NamedTupleMember {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.NamedTupleMember ?? typescript.SyntaxKind.TupleType) as never) as unknown as Mutable<TS.NamedTupleMember>;
		node.dotDotDotToken = dotDotDotToken;
		node.name = name;
		node.questionToken = questionToken;
		node.type = type;
		(node as NodeWithInternalFlags).transformFlags = 1 /* ContainsTypeScript */;
		return node;
	}

	function createJSDocComment(comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined, tags?: readonly TS.JSDocTag[] | undefined): TS.JSDoc {
		if ("createJSDocComment" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocComment(comment as never, tags as never) as never;
		}

		const node = typescript4Cast.createNode(typescript.SyntaxKind.JSDocComment as never) as unknown as Mutable<TS.JSDoc>;
		node.comment = comment;
		node.tags = typescript4Cast.createNodeArray(tags as never) as never;
		return node;
	}

	function createJSDocParameterTag(
		tagName: TS.Identifier | undefined,
		name: TS.EntityName,
		isBracketed: boolean,
		typeExpression?: TS.JSDocTypeExpression,
		isNameFirst?: boolean,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocParameterTag {
		if ("createJSDocParameterTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocParameterTag(tagName as never, name as never, isBracketed, typeExpression as never, isNameFirst, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocParameterTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocParameterTag>;
		if (tagName != null) node.tagName = tagName;
		node.name = name;
		node.isBracketed = isBracketed;
		node.typeExpression = typeExpression;
		if (isNameFirst != null) node.isNameFirst = isNameFirst;
		node.comment = comment;
		return node;
	}

	function createJSDocPrivateTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocPrivateTag {
		if ("createJSDocPrivateTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocPrivateTag(tagName as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocPrivateTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocPrivateTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocAugmentsTag(
		tagName: TS.Identifier | undefined,
		className: TS.JSDocAugmentsTag["class"],
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocAugmentsTag {
		if ("createJSDocAugmentsTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocAugmentsTag(tagName as never, className as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocAugmentsTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocAugmentsTag>;
		if (tagName != null) node.tagName = tagName;
		node.class = className;
		node.comment = comment;
		return node;
	}

	function createJSDocDeprecatedTag(tagName: TS.Identifier, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocDeprecatedTag {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocDeprecatedTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocDeprecatedTag>;
		node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocFunctionType(parameters: readonly TS.ParameterDeclaration[], type: TS.TypeNode | undefined): TS.JSDocFunctionType {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocFunctionType ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocFunctionType>;
		node.parameters = typescript4Cast.createNodeArray(parameters as never) as never;
		node.type = type;
		return node;
	}

	function createJSDocLink(name: TS.EntityName | undefined, text: string): TS.JSDocLink {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocLink ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocLink>;
		node.name = name;
		node.text = text;
		return node;
	}

	function createJSDocNameReference(name: TS.EntityName): TS.JSDocNameReference {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocNameReference ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocNameReference>;
		node.name = name;
		return node;
	}

	function createJSDocNamepathType(type: TS.TypeNode): TS.JSDocNamepathType {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocNamepathType ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocNamepathType>;
		node.type = type;
		return node;
	}

	function createJSDocNonNullableType(type: TS.TypeNode): TS.JSDocNonNullableType {
		const node = typescript4Cast.createNode(
			(typescript.SyntaxKind.JSDocNonNullableType ?? typescript.SyntaxKind.JSDocComment) as never
		) as unknown as Mutable<TS.JSDocNonNullableType>;
		node.type = type;
		return node;
	}

	function createJSDocNullableType(type: TS.TypeNode): TS.JSDocNullableType {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocNullableType ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocNullableType>;
		node.type = type;
		return node;
	}

	function createJSDocOptionalType(type: TS.TypeNode): TS.JSDocOptionalType {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocOptionalType ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocOptionalType>;
		node.type = type;
		return node;
	}

	function createJSDocOverrideTag(tagName: TS.Identifier, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocOverrideTag {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocOverrideTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocOverrideTag>;
		node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocSeeTag(
		tagName: TS.Identifier | undefined,
		nameExpression: TS.JSDocNameReference | undefined,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocSeeTag {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocSeeTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocSeeTag>;
		if (tagName != null) {
			node.tagName = tagName;
		}
		node.name = nameExpression;
		node.comment = comment;
		return node;
	}

	function createJSDocText(text: string): TS.JSDocText {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocText ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocText>;
		node.text = text;
		return node;
	}

	function createJSDocUnknownTag(tagName: TS.Identifier, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocUnknownTag {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocUnknownTag>;
		node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocUnknownType(): TS.JSDocUnknownType {
		return typescript4Cast.createNode((typescript.SyntaxKind.JSDocUnknownType ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocUnknownType>;
	}

	function createJSDocVariadicType(type: TS.TypeNode): TS.JSDocVariadicType {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocVariadicType ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocVariadicType>;
		node.type = type;
		return node;
	}

	function createJSDocAllType(): TS.JSDocAllType {
		return typescript4Cast.createNode((typescript.SyntaxKind.JSDocAllType ?? typescript.SyntaxKind.JSDocComment) as never) as never;
	}

	function createTemplateLiteralType(head: TS.TemplateHead, templateSpans: readonly TS.TemplateLiteralTypeSpan[]): TS.TemplateLiteralTypeNode {
		const node = typescript4Cast.createNode(
			(typescript.SyntaxKind.TemplateLiteralType ?? typescript.SyntaxKind.StringLiteral) as never
		) as unknown as Mutable<TS.TemplateLiteralTypeNode>;
		node.head = head;
		node.templateSpans = typescript4Cast.createNodeArray(templateSpans as never) as never;
		(node as NodeWithInternalFlags).transformFlags = 1 /* ContainsTypeScript */;
		return node;
	}

	function createTemplateLiteralTypeSpan(type: TS.TypeNode, literal: TS.TemplateMiddle | TS.TemplateTail): TS.TemplateLiteralTypeSpan {
		const node = typescript4Cast.createNode(
			(typescript.SyntaxKind.TemplateLiteralTypeSpan ?? typescript.SyntaxKind.StringLiteral) as never
		) as unknown as Mutable<TS.TemplateLiteralTypeSpan>;
		node.type = type;
		node.literal = literal;
		(node as NodeWithInternalFlags).transformFlags = 1 /* ContainsTypeScript */;
		return node;
	}

	function createJSDocAuthorTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocAuthorTag {
		if ("createJSDocAuthorTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocAuthorTag(tagName as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocAuthorTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocAuthorTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocCallbackTag(
		tagName: TS.Identifier | undefined,
		typeExpression: TS.JSDocSignature,
		fullName?: TS.Identifier | TS.JSDocNamespaceDeclaration,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocCallbackTag {
		if ("createJSDocCallbackTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocCallbackTag(tagName as never, typeExpression as never, fullName as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocCallbackTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocCallbackTag>;
		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.fullName = fullName;
		node.comment = comment;
		return node;
	}

	function createJSDocClassTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocClassTag {
		if ("createJSDocClassTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocClassTag(tagName as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocClassTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocClassTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocEnumTag(
		tagName: TS.Identifier | undefined,
		typeExpression: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocEnumTag {
		if ("createJSDocEnumTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocEnumTag(tagName as never, typeExpression as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocEnumTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocEnumTag>;
		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.comment = comment;
		return node;
	}

	function createJSDocImplementsTag(
		tagName: TS.Identifier | undefined,
		className: TS.JSDocImplementsTag["class"],
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocImplementsTag {
		if ("createJSDocImplementsTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocImplementsTag(tagName as never, className as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocImplementsTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocImplementsTag>;
		if (tagName != null) node.tagName = tagName;
		node.class = className;
		node.comment = comment;
		return node;
	}

	function createJSDocPropertyTag(
		tagName: TS.Identifier | undefined,
		name: TS.EntityName,
		isBracketed: boolean,
		typeExpression?: TS.JSDocTypeExpression,
		isNameFirst?: boolean,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocPropertyTag {
		if ("createJSDocPropertyTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocPropertyTag(tagName as never, name as never, isBracketed, typeExpression as never, isNameFirst, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocPropertyTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocPropertyTag>;
		if (tagName != null) node.tagName = tagName;
		node.name = name;
		node.isBracketed = isBracketed;
		node.typeExpression = typeExpression;
		if (isNameFirst != null) node.isNameFirst = isNameFirst;
		node.comment = comment;
		return node;
	}

	function createJSDocProtectedTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocProtectedTag {
		if ("createJSDocProtectedTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocProtectedTag(tagName as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocProtectedTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocProtectedTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocPublicTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocPublicTag {
		if ("createJSDocPublicTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocPublicTag(tagName as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocPublicTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocPublicTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocReadonlyTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocReadonlyTag {
		if ("createJSDocReadonlyTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocReadonlyTag(tagName as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocReadonlyTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocReadonlyTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocReturnTag(
		tagName: TS.Identifier | undefined,
		typeExpression?: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocReturnTag {
		if ("createJSDocReturnTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocReturnTag(tagName as never, typeExpression as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocReturnTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocReturnTag>;
		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.comment = comment;
		return node;
	}

	function createJSDocSignature(
		typeParameters: readonly TS.JSDocTemplateTag[] | undefined,
		parameters: readonly TS.JSDocParameterTag[],
		type?: TS.JSDocReturnTag
	): TS.JSDocSignature {
		if ("createJSDocSignature" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocSignature(typeParameters as never, parameters as never, type as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocSignature ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocSignature>;

		node.typeParameters = typeParameters;
		node.parameters = parameters;
		node.type = type;
		return node;
	}

	function createJSDocTemplateTag(
		tagName: TS.Identifier | undefined,
		constraint: TS.JSDocTypeExpression | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[],
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocTemplateTag {
		if ("createJSDocTemplateTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocTemplateTag(tagName as never, constraint as never, typeParameters as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocTemplateTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocTemplateTag>;

		if (tagName != null) node.tagName = tagName;
		node.constraint = constraint;
		node.typeParameters = typescript4Cast.createNodeArray(typeParameters as never) as never;
		node.comment = comment;
		return node;
	}

	function createJSDocThisTag(
		tagName: TS.Identifier | undefined,
		typeExpression: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocThisTag {
		if ("createJSDocThisTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocThisTag(tagName as never, typeExpression as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocThisTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocThisTag>;

		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.comment = comment;
		return node;
	}

	function createJSDocTypeExpression(type: TS.TypeNode): TS.JSDocTypeExpression {
		if ("createJSDocTypeExpression" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocTypeExpression(type as never) as never;
		}

		const node = typescript4Cast.createNode(
			(typescript.SyntaxKind.JSDocTypeExpression ?? typescript.SyntaxKind.JSDocComment) as never
		) as unknown as Mutable<TS.JSDocTypeExpression>;

		node.type = type;
		return node;
	}

	function createJSDocTypeLiteral(jsDocPropertyTags?: readonly TS.JSDocPropertyLikeTag[], isArrayType?: boolean): TS.JSDocTypeLiteral {
		if ("createJSDocTypeLiteral" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocTypeLiteral(jsDocPropertyTags as never, isArrayType) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocTypeLiteral ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocTypeLiteral>;

		node.jsDocPropertyTags = jsDocPropertyTags;
		if (isArrayType != null) node.isArrayType = isArrayType;
		return node;
	}

	function createJSDocTypeTag(
		tagName: TS.Identifier | undefined,
		typeExpression: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocTypeTag {
		if ("createJSDocTypeTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocTypeTag(tagName as never, typeExpression as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocTypeTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocTypeTag>;

		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.comment = comment;
		return node;
	}

	function createJSDocTypedefTag(
		tagName: TS.Identifier | undefined,
		typeExpression?: TS.JSDocTypeExpression | TS.JSDocTypeLiteral,
		fullName?: TS.Identifier | TS.JSDocNamespaceDeclaration,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocTypedefTag {
		if ("createJSDocTypedefTag" in (typescript as typeof TS)) {
			return typescript4Cast.createJSDocTypedefTag(tagName as never, typeExpression as never, fullName as never, comment as never) as never;
		}

		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocTypedefTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocTypedefTag>;

		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.fullName = fullName;
		node.comment = comment;
		return node;
	}

	function createJSDocMemberName(left: TS.EntityName | TS.JSDocMemberName, right: TS.Identifier): TS.JSDocMemberName {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocMemberName ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocMemberName>;

		node.left = left;
		node.right = right;

		return node;
	}

	function createJSDocLinkCode(name: TS.EntityName | TS.JSDocMemberName | undefined, text: string): TS.JSDocLinkCode {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocLinkCode ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocLinkCode>;

		node.name = name;
		node.text = text;

		return node;
	}

	function createJSDocLinkPlain(name: TS.EntityName | TS.JSDocMemberName | undefined, text: string): TS.JSDocLinkPlain {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocLinkPlain ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocLinkPlain>;

		node.name = name;
		node.text = text;

		return node;
	}

	function createJSDocOverloadTag(tagName: TS.Identifier | undefined, typeExpression: TS.JSDocSignature, comment?: string | TS.NodeArray<TS.JSDocComment>): TS.JSDocOverloadTag {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocOverloadTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocOverloadTag>;

		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.comment = comment;

		return node;
	}

	function createJSDocThrowsTag(tagName: TS.Identifier, typeExpression: TS.JSDocTypeExpression | undefined, comment?: string | TS.NodeArray<TS.JSDocComment>): TS.JSDocThrowsTag {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocThrowsTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocThrowsTag>;

		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.comment = comment;

		return node;
	}

	function createJSDocSatisfiesTag(
		tagName: TS.Identifier | undefined,
		typeExpression: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocComment>
	): TS.JSDocSatisfiesTag {
		const node = typescript4Cast.createNode((typescript.SyntaxKind.JSDocSatisfiesTag ?? typescript.SyntaxKind.JSDocComment) as never) as unknown as Mutable<TS.JSDocSatisfiesTag>;

		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.comment = comment;

		return node;
	}

	function createClassStaticBlockDeclaration(body: TS.Block): TS.ClassStaticBlockDeclaration;
	function createClassStaticBlockDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		body: TS.Block
	): TS.ClassStaticBlockDeclaration;
	function createClassStaticBlockDeclaration(
		decoratorsOrBody: readonly TS.Decorator[] | TS.Block | undefined,
		modifiersOrUndefined?: readonly TS.Modifier[] | undefined,
		bodyOrUndefined?: TS.Block
	): TS.ClassStaticBlockDeclaration {
		const isShort = arguments.length <= 1;
		const body = (isShort ? decoratorsOrBody : bodyOrUndefined) as TS.Block;

		const node = typescript4Cast.createEmptyStatement() as unknown as Mutable<TS.ClassStaticBlockDeclaration>;
		node.body = body;

		(node as NodeWithInternalFlags).transformFlags = 8388608 /* ContainsClassFields */;
		return node;
	}

	function updateClassStaticBlockDeclaration(node: TS.ClassStaticBlockDeclaration, body: TS.Block): TS.ClassStaticBlockDeclaration;
	function updateClassStaticBlockDeclaration(
		node: TS.ClassStaticBlockDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		body: TS.Block
	): TS.ClassStaticBlockDeclaration;
	function updateClassStaticBlockDeclaration(
		node: TS.ClassStaticBlockDeclaration,
		decoratorsOrBody: readonly TS.Decorator[] | TS.Block | undefined,
		modifiersOrUndefined?: readonly TS.Modifier[] | undefined,
		bodyOrUndefined?: TS.Block
	): TS.ClassStaticBlockDeclaration {
		const isShort = arguments.length <= 2;
		const body = (isShort ? decoratorsOrBody : bodyOrUndefined) as TS.Block;
		return body === node.body ? node : typescript.setTextRange(createClassStaticBlockDeclaration(body), node);
	}

	function createSatisfiesExpression(expression: TS.Expression, type: TS.TypeNode): TS.SatisfiesExpression {
		return {...expression} as TS.SatisfiesExpression;
	}

	function updateSatisfiesExpression(node: TS.SatisfiesExpression, expression: TS.Expression, type: TS.TypeNode): TS.SatisfiesExpression {
		return expression === node.expression && type === node.type ? node : typescript.setTextRange(createSatisfiesExpression(expression, type), node);
	}

	function createAssertClause(elements: TS.NodeArray<TS.AssertEntry>, multiLine?: boolean): TS.AssertClause {
		const node = typescript4Cast.createEmptyStatement() as unknown as Mutable<TS.AssertClause>;

		node.elements = elements;
		node.multiLine = multiLine;
		(node as NodeWithInternalFlags).transformFlags! |= 4 /* ContainsESNext */;
		return node;
	}

	function createAssertEntry(name: TS.AssertionKey, value: TS.StringLiteral): TS.AssertEntry {
		const node = typescript4Cast.createEmptyStatement() as unknown as Mutable<TS.AssertEntry>;

		node.name = name;
		node.value = value;
		(node as NodeWithInternalFlags).transformFlags! |= 4 /* ContainsESNext */;
		return node;
	}

	function createImportTypeAssertionContainer(clause: TS.AssertClause, multiLine?: boolean): TS.ImportTypeAssertionContainer {
		const node = typescript4Cast.createEmptyStatement() as unknown as Mutable<TS.ImportTypeAssertionContainer>;
		node.assertClause = clause;
		node.multiLine = multiLine;
		return node;
	}

	function createJsxNamespacedName(namespace: TS.Identifier, name: TS.Identifier): TS.JsxNamespacedName {
		const node = typescript4Cast.createEmptyStatement() as unknown as Mutable<TS.JsxNamespacedName>;
		node.namespace = namespace;
		node.name = name;
		return node;
	}

	function createImportTypeNode(argument: TS.TypeNode, qualifier?: TS.EntityName, typeArguments?: readonly TS.TypeNode[], isTypeOf?: boolean): TS.ImportTypeNode;
	function createImportTypeNode(
		argument: TS.TypeNode,
		assertions?: TS.ImportTypeAssertionContainer,
		qualifier?: TS.EntityName,
		typeArguments?: readonly TS.TypeNode[],
		isTypeOf?: boolean
	): TS.ImportTypeNode;
	function createImportTypeNode(
		argument: TS.TypeNode,
		assertionsOrQualifier?: TS.ImportTypeAssertionContainer | TS.EntityName,
		qualifierOrTypeArguments?: TS.EntityName | readonly TS.TypeNode[],
		typeArgumentsOrIsTypeOf?: readonly TS.TypeNode[] | boolean,
		isTypeOfOrUndefined?: boolean | undefined
	): TS.ImportTypeNode {
		if ("createImportTypeNode" in (typescript as typeof TS)) {
			if (arguments.length < 5) {
				return typescript4Cast.createImportTypeNode(
					argument as never,
					assertionsOrQualifier as never,
					qualifierOrTypeArguments as never,
					typeArgumentsOrIsTypeOf as never
				) as never;
			} else {
				return typescript4Cast.createImportTypeNode(argument as never, qualifierOrTypeArguments as never, typeArgumentsOrIsTypeOf as never, isTypeOfOrUndefined as never) as never;
			}
		} else {
			const assertion = assertionsOrQualifier && "assertClause" in assertionsOrQualifier ? assertionsOrQualifier : undefined;
			const qualifier = (
				assertionsOrQualifier && typescript.isEntityName(assertionsOrQualifier)
					? assertionsOrQualifier
					: qualifierOrTypeArguments && !Array.isArray(qualifierOrTypeArguments)
					? qualifierOrTypeArguments
					: undefined
			) as TS.EntityName | undefined;
			const typeArguments = (Array.isArray(qualifierOrTypeArguments) ? qualifierOrTypeArguments : Array.isArray(typeArgumentsOrIsTypeOf) ? typeArgumentsOrIsTypeOf : undefined) as
				| undefined
				| readonly TS.TypeNode[];
			isTypeOfOrUndefined = typeof typeArgumentsOrIsTypeOf === "boolean" ? typeArgumentsOrIsTypeOf : typeof isTypeOfOrUndefined === "boolean" ? isTypeOfOrUndefined : false;
			const node = typescript4Cast.createNode(200) as unknown as Mutable<TS.ImportTypeNode>;
			node.argument = argument;
			node.assertions = assertion;
			node.qualifier = qualifier;
			node.typeArguments = typeArguments == null ? undefined : (typescript4Cast.createNodeArray(typeArguments as never) as never);
			node.isTypeOf = isTypeOfOrUndefined;
			(node as NodeWithInternalFlags).transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
			return node;
		}
	}

	function updateImportTypeNode(
		node: TS.ImportTypeNode,
		argument: TS.TypeNode,
		qualifier?: TS.EntityName,
		typeArguments?: readonly TS.TypeNode[],
		isTypeOf?: boolean
	): TS.ImportTypeNode;
	function updateImportTypeNode(
		node: TS.ImportTypeNode,
		argument: TS.TypeNode,
		assertions?: TS.ImportTypeAssertionContainer,
		qualifier?: TS.EntityName,
		typeArguments?: readonly TS.TypeNode[],
		isTypeOf?: boolean
	): TS.ImportTypeNode;
	function updateImportTypeNode(
		node: TS.ImportTypeNode,
		argument: TS.TypeNode,
		assertionsOrQualifier?: TS.ImportTypeAssertionContainer | TS.EntityName,
		qualifierOrTypeArguments?: TS.EntityName | readonly TS.TypeNode[],
		typeArgumentsOrIsTypeOf?: readonly TS.TypeNode[] | boolean,
		isTypeOfOrUndefined?: boolean | undefined
	): TS.ImportTypeNode {
		if ("updateImportTypeNode" in (typescript as typeof TS)) {
			if (arguments.length < 6) {
				return typescript4Cast.updateImportTypeNode(
					node as never,
					argument as never,
					assertionsOrQualifier as never,
					qualifierOrTypeArguments as never,
					typeArgumentsOrIsTypeOf as never
				) as never;
			} else {
				return typescript4Cast.updateImportTypeNode(
					node as never,
					argument as never,
					qualifierOrTypeArguments as never,
					typeArgumentsOrIsTypeOf as never,
					isTypeOfOrUndefined as never
				) as never;
			}
		} else {
			const assertion = assertionsOrQualifier && "assertClause" in assertionsOrQualifier /* SyntaxKind.ImportTypeAssertionContainer */ ? assertionsOrQualifier : undefined;
			const qualifier =
				assertionsOrQualifier && typescript.isEntityName(assertionsOrQualifier)
					? assertionsOrQualifier
					: qualifierOrTypeArguments && !Array.isArray(qualifierOrTypeArguments)
					? qualifierOrTypeArguments
					: undefined;
			const typeArguments = Array.isArray(qualifierOrTypeArguments) ? qualifierOrTypeArguments : Array.isArray(typeArgumentsOrIsTypeOf) ? typeArgumentsOrIsTypeOf : undefined;
			isTypeOfOrUndefined = typeof typeArgumentsOrIsTypeOf === "boolean" ? typeArgumentsOrIsTypeOf : typeof isTypeOfOrUndefined === "boolean" ? isTypeOfOrUndefined : node.isTypeOf;
			return node.argument !== argument ||
				node.assertions !== assertion ||
				node.qualifier !== qualifier ||
				node.typeArguments !== typeArguments ||
				node.isTypeOf !== isTypeOfOrUndefined
				? typescript.setTextRange(
						createImportTypeNode(argument, assertionsOrQualifier as never, qualifierOrTypeArguments as never, typeArgumentsOrIsTypeOf as never, isTypeOfOrUndefined as never),
						node
				  )
				: node;
		}
	}

	function createClassExpression(
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.ClassElement[]
	): TS.ClassExpression;
	function createClassExpression(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.ClassElement[]
	): TS.ClassExpression;
	function createClassExpression(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.ModifierLike[] | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
		heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.ClassElement[] | undefined,
		membersOrUndefined?: readonly TS.ClassElement[]
	): TS.ClassExpression {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
		const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
		const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.ClassElement[];

		return typescript4Cast.createClassExpression(modifiers as never, name as never, typeParameters as never, heritageClauses as never, members as never) as never;
	}

	function updateClassExpression(
		node: TS.ClassExpression,
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.ClassElement[]
	): TS.ClassExpression;
	function updateClassExpression(
		node: TS.ClassExpression,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.ClassElement[]
	): TS.ClassExpression;
	function updateClassExpression(
		node: TS.ClassExpression,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.ModifierLike[] | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
		heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.ClassElement[] | undefined,
		membersOrUndefined?: readonly TS.ClassElement[]
	): TS.ClassExpression {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrTypeParameters) as TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
		const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
		const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.ClassElement[];

		return typescript4Cast.updateClassExpression(node as never, modifiers as never, name as never, typeParameters as never, heritageClauses as never, members as never) as never;
	}

	function createExportDeclaration(
		modifiers: readonly TS.Modifier[] | undefined,
		isTypeOnly: boolean,
		exportClause: TS.NamedExportBindings | undefined,
		moduleSpecifier?: TS.Expression
	): TS.ExportDeclaration;
	function createExportDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
		isTypeOnlyOrExportClause: boolean | TS.NamedExportBindings | undefined,
		exportClauseOrModuleSpecifier: TS.NamedExportBindings | TS.Expression | undefined,
		moduleSpecifierOrUndefined?: TS.Expression
	): TS.ExportDeclaration;
	function createExportDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
		isTypeOnlyOrExportClause: boolean | TS.NamedExportBindings | undefined,
		exportClauseOrModuleSpecifier: TS.NamedExportBindings | TS.Expression | undefined,
		moduleSpecifierOrUndefined?: TS.Expression
	): TS.ExportDeclaration {
		const isLong = typeof modifiersOrIsTypeOnly !== "boolean" && (arguments.length >= 6 || Array.isArray(modifiersOrIsTypeOnly));
		const isShort = !isLong;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
		const isTypeOnly = (isShort ? modifiersOrIsTypeOnly : isTypeOnlyOrExportClause) as boolean;
		const exportClause = (isShort ? isTypeOnlyOrExportClause : exportClauseOrModuleSpecifier) as TS.NamedExportBindings;
		const moduleSpecifier = (isShort ? exportClauseOrModuleSpecifier : moduleSpecifierOrUndefined) as TS.Expression | undefined;
		return typescript4Cast.createExportDeclaration(decorators as never, modifiers as never, exportClause as never, moduleSpecifier as never, isTypeOnly) as never;
	}

	function updateExportDeclaration(
		node: TS.ExportDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		isTypeOnly: boolean,
		exportClause: TS.NamedExportBindings | undefined,
		moduleSpecifier?: TS.Expression
	): TS.ExportDeclaration;
	function updateExportDeclaration(
		node: TS.ExportDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
		isTypeOnlyOrExportClause: boolean | TS.NamedExportBindings | undefined,
		exportClauseOrModuleSpecifier: TS.NamedExportBindings | TS.Expression | undefined,
		moduleSpecifierOrUndefined?: TS.Expression
	): TS.ExportDeclaration;
	function updateExportDeclaration(
		node: TS.ExportDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
		isTypeOnlyOrExportClause: boolean | TS.NamedExportBindings | undefined,
		exportClauseOrModuleSpecifier: TS.NamedExportBindings | TS.Expression | undefined,
		moduleSpecifierOrUndefined?: TS.Expression
	): TS.ExportDeclaration {
		const isLong = typeof modifiersOrIsTypeOnly !== "boolean" && (arguments.length >= 7 || Array.isArray(modifiersOrIsTypeOnly));
		const isShort = !isLong;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
		const isTypeOnly = (isShort ? modifiersOrIsTypeOnly : isTypeOnlyOrExportClause) as boolean;
		const exportClause = (isShort ? isTypeOnlyOrExportClause : exportClauseOrModuleSpecifier) as TS.NamedExportBindings;
		const moduleSpecifier = (isShort ? exportClauseOrModuleSpecifier : moduleSpecifierOrUndefined) as TS.Expression | undefined;
		return typescript4Cast.updateExportDeclaration(node as never, decorators as never, modifiers as never, exportClause as never, moduleSpecifier as never, isTypeOnly) as never;
	}

	function createConstructorDeclaration(
		modifiers: readonly TS.Modifier[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		body: TS.Block | undefined
	): TS.ConstructorDeclaration;
	function createConstructorDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		body: TS.Block | undefined
	): TS.ConstructorDeclaration;
	function createConstructorDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrParameters: readonly TS.Modifier[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrBody: readonly TS.ParameterDeclaration[] | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.ConstructorDeclaration {
		const isShort = arguments.length <= 3;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrParameters as readonly TS.Modifier[]);
		const parameters = (isShort ? modifiersOrParameters : parametersOrBody) as readonly TS.ParameterDeclaration[];
		const body = (isShort ? parametersOrBody : bodyOrUndefined) as TS.Block | undefined;
		return typescript4Cast.createConstructor(decorators as never, modifiers as never, parameters as never, body as never) as never;
	}

	function updateConstructorDeclaration(
		node: TS.ConstructorDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		body: TS.Block | undefined
	): TS.ConstructorDeclaration;
	function updateConstructorDeclaration(
		node: TS.ConstructorDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		body: TS.Block | undefined
	): TS.ConstructorDeclaration;
	function updateConstructorDeclaration(
		node: TS.ConstructorDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrParameters: readonly TS.Modifier[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrBody: readonly TS.ParameterDeclaration[] | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.ConstructorDeclaration {
		const isShort = arguments.length <= 4;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrParameters as readonly TS.Modifier[]);
		const parameters = (isShort ? modifiersOrParameters : parametersOrBody) as readonly TS.ParameterDeclaration[];
		const body = (isShort ? parametersOrBody : bodyOrUndefined) as TS.Block | undefined;
		return typescript4Cast.updateConstructor(node as never, decorators as never, modifiers as never, parameters as never, body as never) as never;
	}

	function createMethodDeclaration(
		modifiers: readonly TS.ModifierLike[] | undefined,
		asteriskToken: TS.AsteriskToken | undefined,
		name: string | TS.PropertyName,
		questionToken: TS.QuestionToken | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.MethodDeclaration;
	function createMethodDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		asteriskToken: TS.AsteriskToken | undefined,
		name: string | TS.PropertyName,
		questionToken: TS.QuestionToken | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.MethodDeclaration;
	function createMethodDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrAsteriskToken: readonly TS.Modifier[] | TS.AsteriskToken | undefined,
		asteriskTokenOrName: TS.AsteriskToken | string | TS.PropertyName | undefined,
		nameOrQuestionToken: string | TS.PropertyName | TS.QuestionToken | undefined,
		questionTokenOrTypeParameters: TS.QuestionToken | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
		typeOrBody: TS.TypeNode | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.MethodDeclaration {
		const isShort = typeof asteriskTokenOrName === "string" || (asteriskTokenOrName != null && asteriskTokenOrName.kind !== (41 as number)); /* AsteriskToken */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrAsteriskToken as readonly TS.Modifier[]);
		const asteriskToken = (isShort ? modifiersOrAsteriskToken : asteriskTokenOrName) as TS.AsteriskToken | undefined;
		const name = (isShort ? asteriskTokenOrName : nameOrQuestionToken) as string | TS.Identifier;
		const questionToken = (isShort ? nameOrQuestionToken : questionTokenOrTypeParameters) as TS.QuestionToken | undefined;
		const typeParameters = (isShort ? questionTokenOrTypeParameters : typeParametersOrParameters) as readonly TS.TypeParameterDeclaration[];
		const parameters = (isShort ? typeParametersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[];
		const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode;
		const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

		return typescript4Cast.createMethod(
			decorators as never,
			modifiers as never,
			asteriskToken as never,
			name as never,
			questionToken as never,
			typeParameters as never,
			parameters as never,
			type as never,
			body as never
		) as never;
	}

	function updateMethodDeclaration(
		node: TS.MethodDeclaration,
		modifiers: readonly TS.ModifierLike[] | undefined,
		asteriskToken: TS.AsteriskToken | undefined,
		name: TS.PropertyName,
		questionToken: TS.QuestionToken | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.MethodDeclaration;
	function updateMethodDeclaration(
		node: TS.MethodDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		asteriskToken: TS.AsteriskToken | undefined,
		name: TS.PropertyName,
		questionToken: TS.QuestionToken | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.MethodDeclaration;
	function updateMethodDeclaration(
		node: TS.MethodDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrAsteriskToken: readonly TS.Modifier[] | TS.AsteriskToken | undefined,
		asteriskTokenOrName: TS.AsteriskToken | TS.PropertyName | undefined,
		nameOrQuestionToken: TS.PropertyName | TS.QuestionToken | undefined,
		questionTokenOrTypeParameters: TS.QuestionToken | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
		typeOrBody: TS.TypeNode | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.MethodDeclaration {
		const isShort = asteriskTokenOrName?.kind !== (41 as number); /* AsteriskToken */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrAsteriskToken as readonly TS.Modifier[]);
		const asteriskToken = (isShort ? modifiersOrAsteriskToken : asteriskTokenOrName) as TS.AsteriskToken | undefined;
		const name = (isShort ? asteriskTokenOrName : nameOrQuestionToken) as TS.Identifier;
		const questionToken = (isShort ? nameOrQuestionToken : questionTokenOrTypeParameters) as TS.QuestionToken | undefined;
		const typeParameters = (isShort ? questionTokenOrTypeParameters : typeParametersOrParameters) as readonly TS.TypeParameterDeclaration[];
		const parameters = (isShort ? typeParametersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[];
		const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode;
		const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

		return typescript4Cast.updateMethod(
			node as never,
			decorators as never,
			modifiers as never,
			asteriskToken as never,
			name as never,
			questionToken as never,
			typeParameters as never,
			parameters as never,
			type as never,
			body as never
		) as never;
	}

	function createParameterDeclaration(
		modifiers: readonly TS.ModifierLike[] | undefined,
		dotDotDotToken: TS.DotDotDotToken | undefined,
		name: string | TS.BindingName,
		questionToken?: TS.QuestionToken,
		type?: TS.TypeNode,
		initializer?: TS.Expression
	): TS.ParameterDeclaration;
	function createParameterDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		dotDotDotToken: TS.DotDotDotToken | undefined,
		name: string | TS.BindingName,
		questionToken?: TS.QuestionToken,
		type?: TS.TypeNode,
		initializer?: TS.Expression
	): TS.ParameterDeclaration;
	function createParameterDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrDotDotDotToken: readonly TS.Modifier[] | TS.DotDotDotToken | undefined,
		dotDotDotTokenOrName: TS.DotDotDotToken | string | TS.BindingName | undefined,
		nameOrQuestionToken: string | TS.BindingName | TS.QuestionToken | undefined,
		questionTokenOrType?: TS.QuestionToken | TS.TypeNode,
		typeOrInitializer?: TS.TypeNode | TS.Expression,
		initializerOrUndefined?: TS.Expression
	): TS.ParameterDeclaration {
		const isShort = typeof dotDotDotTokenOrName === "string" || (dotDotDotTokenOrName != null && dotDotDotTokenOrName.kind !== (25 as number)); /* DotDotDotToken */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrDotDotDotToken as readonly TS.Modifier[]);
		const dotDotDotToken = (isShort ? modifiersOrDotDotDotToken : dotDotDotTokenOrName) as TS.DotDotDotToken | undefined;
		const name = (isShort ? dotDotDotTokenOrName : nameOrQuestionToken) as string | TS.BindingName;
		const questionToken = (isShort ? nameOrQuestionToken : questionTokenOrType) as TS.QuestionToken;
		const type = (isShort ? questionTokenOrType : typeOrInitializer) as TS.TypeNode | undefined;
		const initializer = (isShort ? typeOrInitializer : initializerOrUndefined) as TS.Expression | undefined;

		return typescript4Cast.createParameter(
			decorators as never,
			modifiers as never,
			dotDotDotToken as never,
			name as never,
			questionToken as never,
			type as never,
			initializer as never
		) as never;
	}

	function updateParameterDeclaration(
		node: TS.ParameterDeclaration,
		modifiers: readonly TS.ModifierLike[] | undefined,
		dotDotDotToken: TS.DotDotDotToken | undefined,
		name: string | TS.BindingName,
		questionToken?: TS.QuestionToken,
		type?: TS.TypeNode,
		initializer?: TS.Expression
	): TS.ParameterDeclaration;
	function updateParameterDeclaration(
		node: TS.ParameterDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		dotDotDotToken: TS.DotDotDotToken | undefined,
		name: string | TS.BindingName,
		questionToken?: TS.QuestionToken,
		type?: TS.TypeNode,
		initializer?: TS.Expression
	): TS.ParameterDeclaration;
	function updateParameterDeclaration(
		node: TS.ParameterDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrDotDotDotToken: readonly TS.Modifier[] | TS.DotDotDotToken | undefined,
		dotDotDotTokenOrName: TS.DotDotDotToken | string | TS.BindingName | undefined,
		nameOrQuestionToken: string | TS.BindingName | TS.QuestionToken | undefined,
		questionTokenOrType?: TS.QuestionToken | TS.TypeNode,
		typeOrInitializer?: TS.TypeNode | TS.Expression,
		initializerOrUndefined?: TS.Expression
	): TS.ParameterDeclaration {
		const isShort = typeof dotDotDotTokenOrName === "string" || (dotDotDotTokenOrName != null && dotDotDotTokenOrName.kind !== (25 as number)); /* DotDotDotToken */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrDotDotDotToken as readonly TS.Modifier[]);
		const dotDotDotToken = (isShort ? modifiersOrDotDotDotToken : dotDotDotTokenOrName) as TS.DotDotDotToken | undefined;
		const name = (isShort ? dotDotDotTokenOrName : nameOrQuestionToken) as string | TS.BindingName;
		const questionToken = (isShort ? nameOrQuestionToken : questionTokenOrType) as TS.QuestionToken;
		const type = (isShort ? questionTokenOrType : typeOrInitializer) as TS.TypeNode | undefined;
		const initializer = (isShort ? typeOrInitializer : initializerOrUndefined) as TS.Expression | undefined;

		return typescript4Cast.updateParameter(
			node as never,
			decorators as never,
			modifiers as never,
			dotDotDotToken as never,
			name as never,
			questionToken as never,
			type as never,
			initializer as never
		) as never;
	}

	function createPropertyDeclaration(
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: string | TS.PropertyName,
		questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
		type: TS.TypeNode | undefined,
		initializer: TS.Expression | undefined
	): TS.PropertyDeclaration;
	function createPropertyDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.PropertyName,
		questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
		type: TS.TypeNode | undefined,
		initializer: TS.Expression | undefined
	): TS.PropertyDeclaration;
	function createPropertyDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.PropertyName | undefined,
		nameOrQuestionOrExclamationToken: string | TS.PropertyName | TS.QuestionToken | TS.ExclamationToken | undefined,
		questionOrExclamationTokenOrType: TS.QuestionToken | TS.ExclamationToken | TS.TypeNode | undefined,
		typeOrInitializer: TS.TypeNode | TS.Expression | undefined,
		initializerOrUndefined?: TS.Expression | undefined
	): TS.PropertyDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrQuestionOrExclamationToken) as string | TS.PropertyName;
		const questionOrExclamationToken = (isShort ? nameOrQuestionOrExclamationToken : questionOrExclamationTokenOrType) as TS.QuestionToken | TS.ExclamationToken | undefined;
		const type = (isShort ? questionOrExclamationTokenOrType : typeOrInitializer) as TS.TypeNode | undefined;
		const initializer = (isShort ? typeOrInitializer : initializerOrUndefined) as TS.Expression | undefined;

		return typescript4Cast.createProperty(
			decorators as never,
			modifiers as never,
			name as never,
			questionOrExclamationToken as never,
			type as never,
			initializer as never
		) as never;
	}

	function updatePropertyDeclaration(
		node: TS.PropertyDeclaration,
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: string | TS.PropertyName,
		questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
		type: TS.TypeNode | undefined,
		initializer: TS.Expression | undefined
	): TS.PropertyDeclaration;
	function updatePropertyDeclaration(
		node: TS.PropertyDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.PropertyName,
		questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
		type: TS.TypeNode | undefined,
		initializer: TS.Expression | undefined
	): TS.PropertyDeclaration;
	function updatePropertyDeclaration(
		node: TS.PropertyDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.PropertyName | undefined,
		nameOrQuestionOrExclamationToken: string | TS.PropertyName | TS.QuestionToken | TS.ExclamationToken | undefined,
		questionOrExclamationTokenOrType: TS.QuestionToken | TS.ExclamationToken | TS.TypeNode | undefined,
		typeOrInitializer: TS.TypeNode | TS.Expression | undefined,
		initializerOrUndefined?: TS.Expression | undefined
	): TS.PropertyDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrQuestionOrExclamationToken) as string | TS.PropertyName;
		const questionOrExclamationToken = (isShort ? nameOrQuestionOrExclamationToken : questionOrExclamationTokenOrType) as TS.QuestionToken | TS.ExclamationToken | undefined;
		const type = (isShort ? questionOrExclamationTokenOrType : typeOrInitializer) as TS.TypeNode | undefined;
		const initializer = (isShort ? typeOrInitializer : initializerOrUndefined) as TS.Expression | undefined;

		return typescript4Cast.updateProperty(
			node as never,
			decorators as never,
			modifiers as never,
			name as never,
			questionOrExclamationToken as never,
			type as never,
			initializer as never
		) as never;
	}

	function createSetAccessorDeclaration(
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: string | TS.PropertyName,
		parameters: readonly TS.ParameterDeclaration[],
		body: TS.Block | undefined
	): TS.SetAccessorDeclaration;
	function createSetAccessorDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.PropertyName,
		parameters: readonly TS.ParameterDeclaration[],
		body: TS.Block | undefined
	): TS.SetAccessorDeclaration;
	function createSetAccessorDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.PropertyName | undefined,
		nameOrParameters: string | TS.PropertyName | readonly TS.ParameterDeclaration[],
		parametersOrBody: readonly TS.ParameterDeclaration[] | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.SetAccessorDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrParameters) as string | TS.PropertyName;
		const parameters = (isShort ? nameOrParameters : parametersOrBody) as readonly TS.ParameterDeclaration[];
		const body = (isShort ? parametersOrBody : bodyOrUndefined) as TS.Block | undefined;

		return typescript4Cast.createSetAccessor(decorators as never, modifiers as never, name as never, parameters as never, body as never) as never;
	}

	function updateSetAccessorDeclaration(
		node: TS.SetAccessorDeclaration,
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: TS.PropertyName,
		parameters: readonly TS.ParameterDeclaration[],
		body: TS.Block | undefined
	): TS.SetAccessorDeclaration;
	function updateSetAccessorDeclaration(
		node: TS.SetAccessorDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: TS.PropertyName,
		parameters: readonly TS.ParameterDeclaration[],
		body: TS.Block | undefined
	): TS.SetAccessorDeclaration;
	function updateSetAccessorDeclaration(
		node: TS.SetAccessorDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.PropertyName | undefined,
		nameOrParameters: TS.PropertyName | readonly TS.ParameterDeclaration[],
		parametersOrBody: readonly TS.ParameterDeclaration[] | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.SetAccessorDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrParameters) as TS.PropertyName;
		const parameters = (isShort ? nameOrParameters : parametersOrBody) as readonly TS.ParameterDeclaration[];
		const body = (isShort ? parametersOrBody : bodyOrUndefined) as TS.Block | undefined;

		return typescript4Cast.updateSetAccessor(node as never, decorators as never, modifiers as never, name as never, parameters as never, body as never) as never;
	}

	function createGetAccessorDeclaration(
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: string | TS.PropertyName,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.GetAccessorDeclaration;
	function createGetAccessorDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.PropertyName,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.GetAccessorDeclaration;
	function createGetAccessorDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.PropertyName | undefined,
		nameOrParameters: string | TS.PropertyName | readonly TS.ParameterDeclaration[],
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
		typeOrBody: TS.TypeNode | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.GetAccessorDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrParameters) as TS.PropertyName;
		const parameters = (isShort ? nameOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[];
		const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode | undefined;
		const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

		return typescript4Cast.createGetAccessor(decorators as never, modifiers as never, name as never, parameters as never, type as never, body as never) as never;
	}

	function updateGetAccessorDeclaration(
		node: TS.GetAccessorDeclaration,
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: string | TS.PropertyName,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.GetAccessorDeclaration;
	function updateGetAccessorDeclaration(
		node: TS.GetAccessorDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.PropertyName,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.GetAccessorDeclaration;
	function updateGetAccessorDeclaration(
		node: TS.GetAccessorDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.PropertyName | undefined,
		nameOrParameters: string | TS.PropertyName | readonly TS.ParameterDeclaration[],
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
		typeOrBody: TS.TypeNode | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.GetAccessorDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName));
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrParameters) as TS.PropertyName;
		const parameters = (isShort ? nameOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[];
		const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode | undefined;
		const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

		return typescript4Cast.updateGetAccessor(node as never, decorators as never, modifiers as never, name as never, parameters as never, type as never, body as never) as never;
	}

	function createImportEqualsDeclaration(
		modifiers: readonly TS.Modifier[] | undefined,
		isTypeOnly: boolean,
		name: string | TS.Identifier,
		moduleReference: TS.ModuleReference
	): TS.ImportEqualsDeclaration;
	function createImportEqualsDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		isTypeOnly: boolean,
		name: string | TS.Identifier,
		moduleReference: TS.ModuleReference
	): TS.ImportEqualsDeclaration;
	function createImportEqualsDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
		isTypeOnlyOrName: boolean | string | TS.Identifier,
		nameOrModuleReference: string | TS.Identifier | TS.ModuleReference,
		moduleReferenceOrUndefined?: TS.ModuleReference
	): TS.ImportEqualsDeclaration {
		const isShort = arguments.length <= 4;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
		const isTypeOnly = (isShort ? modifiersOrIsTypeOnly : isTypeOnlyOrName) as boolean;
		const name = (isShort ? isTypeOnlyOrName : nameOrModuleReference) as string | TS.Identifier;
		const moduleReference = (isShort ? nameOrModuleReference : moduleReferenceOrUndefined) as TS.ModuleReference;

		if (typescript4Cast.createImportEqualsDeclaration.length === 4) {
			return (typescript as unknown as typeof import("typescript-3-9-2")).createImportEqualsDeclaration(
				decorators as never,
				modifiers as never,
				name as never,
				moduleReference as never
			) as unknown as TS.ImportEqualsDeclaration;
		} else {
			const normalizedName = typeof name === "string" ? (typescript4Cast.createIdentifier(name as never) as never) : name;
			return typescript4Cast.createImportEqualsDeclaration(
				decorators as never,
				modifiers as never,
				isTypeOnly,
				normalizedName as never,
				moduleReference as never
			) as unknown as TS.ImportEqualsDeclaration;
		}
	}

	function updateImportEqualsDeclaration(
		node: TS.ImportEqualsDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		isTypeOnly: boolean,
		name: string | TS.Identifier,
		moduleReference: TS.ModuleReference
	): TS.ImportEqualsDeclaration;
	function updateImportEqualsDeclaration(
		node: TS.ImportEqualsDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		isTypeOnly: boolean,
		name: string | TS.Identifier,
		moduleReference: TS.ModuleReference
	): TS.ImportEqualsDeclaration;
	function updateImportEqualsDeclaration(
		node: TS.ImportEqualsDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrIsTypeOnly: readonly TS.Modifier[] | boolean | undefined,
		isTypeOnlyOrName: boolean | string | TS.Identifier,
		nameOrModuleReference: string | TS.Identifier | TS.ModuleReference,
		moduleReferenceOrUndefined?: TS.ModuleReference
	): TS.ImportEqualsDeclaration {
		const isShort = arguments.length <= 5;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.Modifier[])[1] : (modifiersOrIsTypeOnly as readonly TS.Modifier[]);
		const isTypeOnly = (isShort ? modifiersOrIsTypeOnly : isTypeOnlyOrName) as boolean;
		const name = (isShort ? isTypeOnlyOrName : nameOrModuleReference) as string | TS.Identifier;
		const moduleReference = (isShort ? nameOrModuleReference : moduleReferenceOrUndefined) as TS.ModuleReference;
		const normalizedName = typeof name === "string" ? (typescript4Cast.createIdentifier(name) as never) : name;

		if (typescript4Cast.updateImportEqualsDeclaration.length === 5) {
			return (typescript as unknown as typeof import("typescript-3-9-2")).updateImportEqualsDeclaration(
				node as never,
				decorators as never,
				modifiers as never,
				normalizedName as never,
				moduleReference as never
			) as unknown as TS.ImportEqualsDeclaration;
		} else {
			return typescript4Cast.updateImportEqualsDeclaration(
				node as never,
				decorators as never,
				modifiers as never,
				isTypeOnly,
				normalizedName as never,
				moduleReference as never
			) as unknown as TS.ImportEqualsDeclaration;
		}
	}

	function createIndexSignature(modifiers: readonly TS.Modifier[] | undefined, parameters: readonly TS.ParameterDeclaration[], type: TS.TypeNode): TS.IndexSignatureDeclaration;
	function createIndexSignature(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode
	): TS.IndexSignatureDeclaration;
	function createIndexSignature(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrParameters: readonly TS.Modifier[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode,
		typeOrUndefined?: TS.TypeNode
	): TS.IndexSignatureDeclaration {
		const isShort = arguments.length <= 3;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrParameters as readonly TS.Modifier[]);
		const parameters = (isShort ? modifiersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[];
		const type = (isShort ? parametersOrType : typeOrUndefined) as TS.TypeNode;

		return typescript4Cast.createIndexSignature(decorators as never, modifiers as never, parameters as never, type as never) as never;
	}

	function updateIndexSignature(
		node: TS.IndexSignatureDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode
	): TS.IndexSignatureDeclaration;
	function updateIndexSignature(
		node: TS.IndexSignatureDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode
	): TS.IndexSignatureDeclaration;
	function updateIndexSignature(
		node: TS.IndexSignatureDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrParameters: readonly TS.Modifier[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode,
		typeOrUndefined?: TS.TypeNode
	): TS.IndexSignatureDeclaration {
		const isShort = arguments.length <= 4;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrParameters as readonly TS.Modifier[]);
		const parameters = (isShort ? modifiersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[];
		const type = (isShort ? parametersOrType : typeOrUndefined) as TS.TypeNode;

		return typescript4Cast.updateIndexSignature(node as never, decorators as never, modifiers as never, parameters as never, type as never) as never;
	}

	function createImportDeclaration(
		modifiers: readonly TS.Modifier[] | undefined,
		importClause: TS.ImportClause | undefined,
		moduleSpecifier: TS.Expression,
		assertClause?: TS.AssertClause
	): TS.ImportDeclaration;
	function createImportDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		importClause: TS.ImportClause | undefined,
		moduleSpecifier: TS.Expression,
		assertClause?: TS.AssertClause
	): TS.ImportDeclaration;
	function createImportDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrImportClause: readonly TS.Modifier[] | TS.ImportClause | undefined,
		importClauseOrModuleSpecifier: TS.ImportClause | TS.Expression | undefined,
		moduleSpecifierOrAssertClause: TS.Expression | TS.AssertClause | undefined,
		assertClauseOrUndefined?: TS.AssertClause
	): TS.ImportDeclaration {
		const isShort = modifiersOrImportClause != null && !Array.isArray(modifiersOrImportClause);
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrImportClause as readonly TS.Modifier[]);
		const importClause = (isShort ? modifiersOrImportClause : importClauseOrModuleSpecifier) as TS.ImportClause | undefined;
		const moduleSpecifier = (isShort ? importClauseOrModuleSpecifier : moduleSpecifierOrAssertClause) as TS.Expression;
		const assertClause = (isShort ? moduleSpecifierOrAssertClause : assertClauseOrUndefined) as TS.AssertClause | undefined;

		return typescript4Cast.createImportDeclaration(
			decorators as never,
			modifiers as never,
			importClause as never,
			moduleSpecifier as never,
			assertClause as never
		) as unknown as TS.ImportDeclaration;
	}

	function updateImportDeclaration(
		node: TS.ImportDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		importClause: TS.ImportClause | undefined,
		moduleSpecifier: TS.Expression,
		assertClause?: TS.AssertClause
	): TS.ImportDeclaration;
	function updateImportDeclaration(
		node: TS.ImportDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		importClause: TS.ImportClause | undefined,
		moduleSpecifier: TS.Expression,
		assertClause?: TS.AssertClause
	): TS.ImportDeclaration;
	function updateImportDeclaration(
		node: TS.ImportDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrImportClause: readonly TS.Modifier[] | TS.ImportClause | undefined,
		importClauseOrModuleSpecifier: TS.ImportClause | TS.Expression | undefined,
		moduleSpecifierOrAssertClause: TS.Expression | TS.AssertClause | undefined,
		assertClauseOrUndefined?: TS.AssertClause
	): TS.ImportDeclaration {
		const isShort = importClauseOrModuleSpecifier != null && importClauseOrModuleSpecifier.kind !== 267; /* ImportClause */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrImportClause as readonly TS.Modifier[]);
		const importClause = (isShort ? modifiersOrImportClause : importClauseOrModuleSpecifier) as TS.ImportClause | undefined;
		const moduleSpecifier = (isShort ? importClauseOrModuleSpecifier : moduleSpecifierOrAssertClause) as TS.Expression;
		const assertClause = (isShort ? moduleSpecifierOrAssertClause : assertClauseOrUndefined) as TS.AssertClause | undefined;

		return typescript4Cast.updateImportDeclaration(
			node as never,
			decorators as never,
			modifiers as never,
			importClause as never,
			moduleSpecifier as never,
			assertClause as never
		) as unknown as TS.ImportDeclaration;
	}

	const createPrivateIdentifier =
		(typescript4Cast.createPrivateIdentifier as unknown as TS.NodeFactory["createPrivateIdentifier"]) ??
		(() =>
			function (text: string): TS.PrivateIdentifier {
				const node = typescript4Cast.createIdentifier(text as never) as unknown as Mutable<TS.PrivateIdentifier>;
				return node;
			})();

	function createUniquePrivateName(text?: string): TS.PrivateIdentifier {
		if (text != null && !text.startsWith("#")) {
			throw new TypeError("First character of private identifier must be #: " + text);
		}

		const node = createPrivateIdentifier(text ?? "");
		return node;
	}

	function getGeneratedPrivateNameForNode(node: TS.Node): TS.PrivateIdentifier {
		return createPrivateIdentifier("") as never;
	}

	function createTypeAliasDeclaration(
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		type: TS.TypeNode
	): TS.TypeAliasDeclaration;
	function createTypeAliasDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		type: TS.TypeNode
	): TS.TypeAliasDeclaration;
	function createTypeAliasDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrType: readonly TS.TypeParameterDeclaration[] | TS.TypeNode | undefined,
		typeOrUndefined?: TS.TypeNode
	): TS.TypeAliasDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrType) as readonly TS.TypeParameterDeclaration[];
		const type = (isShort ? typeParametersOrType : typeOrUndefined) as TS.TypeNode[] | undefined;

		return typescript4Cast.createTypeAliasDeclaration(decorators as never, modifiers as never, name as never, typeParameters as never, type as never) as never;
	}

	function updateTypeAliasDeclaration(
		node: TS.TypeAliasDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		type: TS.TypeNode
	): TS.TypeAliasDeclaration;
	function updateTypeAliasDeclaration(
		node: TS.TypeAliasDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		type: TS.TypeNode
	): TS.TypeAliasDeclaration;
	function updateTypeAliasDeclaration(
		node: TS.TypeAliasDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrType: readonly TS.TypeParameterDeclaration[] | TS.TypeNode | undefined,
		typeOrUndefined?: TS.TypeNode
	): TS.TypeAliasDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrType) as readonly TS.TypeParameterDeclaration[];
		const type = (isShort ? typeParametersOrType : typeOrUndefined) as TS.TypeNode[] | undefined;

		return typescript4Cast.updateTypeAliasDeclaration(node as never, decorators as never, modifiers as never, name as never, typeParameters as never, type as never) as never;
	}

	function createFunctionDeclaration(
		modifiers: readonly TS.ModifierLike[] | undefined,
		asteriskToken: TS.AsteriskToken | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.FunctionDeclaration;
	function createFunctionDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		asteriskToken: TS.AsteriskToken | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.FunctionDeclaration;
	function createFunctionDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrAsteriskToken: readonly TS.Modifier[] | TS.AsteriskToken | undefined,
		asteriskTokenOrName: TS.AsteriskToken | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
		typeOrBody: TS.TypeNode | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.FunctionDeclaration {
		const isShort = arguments.length <= 7;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrAsteriskToken as readonly TS.Modifier[]);
		const asteriskToken = (isShort ? modifiersOrAsteriskToken : asteriskTokenOrName) as TS.AsteriskToken | undefined;
		const name = (isShort ? asteriskTokenOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrParameters) as readonly TS.TypeParameterDeclaration[];
		const parameters = (isShort ? typeParametersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[] | undefined;
		const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode;
		const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

		return typescript4Cast.createFunctionDeclaration(
			decorators as never,
			modifiers as never,
			asteriskToken as never,
			name as never,
			typeParameters as never,
			parameters as never,
			type as never,
			body as never
		) as unknown as TS.FunctionDeclaration;
	}

	function updateFunctionDeclaration(
		node: TS.FunctionDeclaration,
		modifiers: readonly TS.ModifierLike[] | undefined,
		asteriskToken: TS.AsteriskToken | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.FunctionDeclaration;
	function updateFunctionDeclaration(
		node: TS.FunctionDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		asteriskToken: TS.AsteriskToken | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		parameters: readonly TS.ParameterDeclaration[],
		type: TS.TypeNode | undefined,
		body: TS.Block | undefined
	): TS.FunctionDeclaration;
	function updateFunctionDeclaration(
		node: TS.FunctionDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrAsteriskToken: readonly TS.Modifier[] | TS.AsteriskToken | undefined,
		asteriskTokenOrName: TS.AsteriskToken | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrParameters: readonly TS.TypeParameterDeclaration[] | readonly TS.ParameterDeclaration[] | undefined,
		parametersOrType: readonly TS.ParameterDeclaration[] | TS.TypeNode | undefined,
		typeOrBody: TS.TypeNode | TS.Block | undefined,
		bodyOrUndefined?: TS.Block | undefined
	): TS.FunctionDeclaration {
		const isShort = arguments.length <= 8;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrAsteriskToken as readonly TS.Modifier[]);
		const asteriskToken = (isShort ? modifiersOrAsteriskToken : asteriskTokenOrName) as TS.AsteriskToken | undefined;
		const name = (isShort ? asteriskTokenOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrParameters) as readonly TS.TypeParameterDeclaration[];
		const parameters = (isShort ? typeParametersOrParameters : parametersOrType) as readonly TS.ParameterDeclaration[] | undefined;
		const type = (isShort ? parametersOrType : typeOrBody) as TS.TypeNode;
		const body = (isShort ? typeOrBody : bodyOrUndefined) as TS.Block | undefined;

		return typescript4Cast.updateFunctionDeclaration(
			node as never,
			decorators as never,
			modifiers as never,
			asteriskToken as never,
			name as never,
			typeParameters as never,
			parameters as never,
			type as never,
			body as never
		) as unknown as TS.FunctionDeclaration;
	}

	function createClassDeclaration(
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.ClassElement[]
	): TS.ClassDeclaration;
	function createClassDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.ClassElement[]
	): TS.ClassDeclaration;
	function createClassDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
		heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.ClassElement[] | undefined,
		membersOrUndefined?: readonly TS.ClassElement[]
	): TS.ClassDeclaration {
		const isShort = arguments.length <= 5;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
		const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
		const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.ClassElement[];

		return typescript4Cast.createClassDeclaration(
			decorators as never,
			modifiers as never,
			name as never,
			typeParameters as never,
			heritageClauses as never,
			members as never
		) as unknown as TS.ClassDeclaration;
	}

	function updateClassDeclaration(
		node: TS.ClassDeclaration,
		modifiers: readonly TS.ModifierLike[] | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.ClassElement[]
	): TS.ClassDeclaration;
	function updateClassDeclaration(
		node: TS.ClassDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier | undefined,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.ClassElement[]
	): TS.ClassDeclaration;
	function updateClassDeclaration(
		node: TS.ClassDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.ModifierLike[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
		heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.ClassElement[] | undefined,
		membersOrUndefined?: readonly TS.ClassElement[]
	): TS.ClassDeclaration {
		const isShort = arguments.length <= 6;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
		const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
		const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.ClassElement[];

		return typescript4Cast.updateClassDeclaration(
			node as never,
			decorators as never,
			modifiers as never,
			name as never,
			typeParameters as never,
			heritageClauses as never,
			members as never
		) as unknown as TS.ClassDeclaration;
	}

	function createInterfaceDeclaration(
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.TypeElement[]
	): TS.InterfaceDeclaration;
	function createInterfaceDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.TypeElement[]
	): TS.InterfaceDeclaration;
	function createInterfaceDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
		heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.TypeElement[] | undefined,
		membersOrUndefined?: readonly TS.TypeElement[]
	): TS.InterfaceDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
		const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
		const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.TypeElement[];

		return typescript4Cast.createInterfaceDeclaration(
			decorators as never,
			modifiers as never,
			name as never,
			typeParameters as never,
			heritageClauses as never,
			members as never
		) as unknown as TS.InterfaceDeclaration;
	}

	function updateInterfaceDeclaration(
		node: TS.InterfaceDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.TypeElement[]
	): TS.InterfaceDeclaration;
	function updateInterfaceDeclaration(
		node: TS.InterfaceDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
		heritageClauses: readonly TS.HeritageClause[] | undefined,
		members: readonly TS.TypeElement[]
	): TS.InterfaceDeclaration;
	function updateInterfaceDeclaration(
		node: TS.InterfaceDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrTypeParameters: string | TS.Identifier | readonly TS.TypeParameterDeclaration[] | undefined,
		typeParametersOrHeritageClauses: readonly TS.TypeParameterDeclaration[] | readonly TS.HeritageClause[] | undefined,
		heritageClausesOrMembers: readonly TS.HeritageClause[] | readonly TS.TypeElement[] | undefined,
		membersOrUndefined?: readonly TS.TypeElement[]
	): TS.InterfaceDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrTypeParameters) as string | TS.Identifier;
		const typeParameters = (isShort ? nameOrTypeParameters : typeParametersOrHeritageClauses) as readonly TS.TypeParameterDeclaration[];
		const heritageClauses = (isShort ? typeParametersOrHeritageClauses : heritageClausesOrMembers) as readonly TS.HeritageClause[] | undefined;
		const members = (isShort ? heritageClausesOrMembers : membersOrUndefined) as TS.TypeElement[];

		return typescript4Cast.updateInterfaceDeclaration(
			node as never,
			decorators as never,
			modifiers as never,
			name as never,
			typeParameters as never,
			heritageClauses as never,
			members as never
		) as unknown as TS.InterfaceDeclaration;
	}

	function createEnumDeclaration(modifiers: readonly TS.Modifier[] | undefined, name: string | TS.Identifier, members: readonly TS.EnumMember[]): TS.EnumDeclaration;
	function createEnumDeclaration(
		decorators: readonly TS.Decorator[],
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		members: readonly TS.EnumMember[]
	): TS.EnumDeclaration;
	function createEnumDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrMembers: string | TS.Identifier | readonly TS.EnumMember[],
		membersOrUndefined?: readonly TS.EnumMember[]
	): TS.EnumDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrMembers) as string | TS.Identifier;
		const members = (isShort ? nameOrMembers : membersOrUndefined) as readonly TS.EnumMember[];

		return typescript4Cast.createEnumDeclaration(decorators as never, modifiers as never, name as never, members as never) as unknown as TS.EnumDeclaration;
	}

	function updateEnumDeclaration(
		node: TS.EnumDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		members: readonly TS.EnumMember[]
	): TS.EnumDeclaration;
	function updateEnumDeclaration(
		node: TS.EnumDeclaration,
		decorators: readonly TS.Decorator[],
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		members: readonly TS.EnumMember[]
	): TS.EnumDeclaration;
	function updateEnumDeclaration(
		node: TS.EnumDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrMembers: string | TS.Identifier | readonly TS.EnumMember[],
		membersOrUndefined?: readonly TS.EnumMember[]
	): TS.EnumDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrMembers) as string | TS.Identifier;
		const members = (isShort ? nameOrMembers : membersOrUndefined) as readonly TS.EnumMember[];

		return typescript4Cast.updateEnumDeclaration(node as never, decorators as never, modifiers as never, name as never, members as never) as unknown as TS.EnumDeclaration;
	}

	function createModuleDeclaration(modifiers: readonly TS.Modifier[] | undefined, name: TS.ModuleName, body: TS.ModuleBody | undefined, flags?: TS.NodeFlags): TS.ModuleDeclaration;
	function createModuleDeclaration(
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: TS.ModuleName,
		body: TS.ModuleBody | undefined,
		flags?: TS.NodeFlags
	): TS.ModuleDeclaration;
	function createModuleDeclaration(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | TS.ModuleName | undefined,
		nameOrBody: TS.ModuleName | TS.ModuleBody | undefined,
		bodyOrFlags: TS.ModuleBody | TS.NodeFlags | undefined,
		flagsOrUndefined?: TS.NodeFlags
	): TS.ModuleDeclaration {
		const isShort =
			typeof modifiersOrName === "string" ||
			(modifiersOrName != null &&
				!Array.isArray(modifiersOrName) &&
				("escapedText" in modifiersOrName /* Identifier */ || "_literalExpressionBrand" in modifiersOrName)); /* StringLiteral */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrBody) as TS.ModuleName;
		const body = (isShort ? nameOrBody : bodyOrFlags) as TS.ModuleBody | undefined;
		const flags = (isShort ? bodyOrFlags : flagsOrUndefined) as TS.NodeFlags | undefined;

		return typescript4Cast.createModuleDeclaration(decorators as never, modifiers as never, name as never, body as never, flags as never) as unknown as TS.ModuleDeclaration;
	}

	function updateModuleDeclaration(
		node: TS.ModuleDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		name: TS.ModuleName,
		body: TS.ModuleBody | undefined
	): TS.ModuleDeclaration;
	function updateModuleDeclaration(
		node: TS.ModuleDeclaration,
		decorators: readonly TS.Decorator[] | undefined,
		modifiers: readonly TS.Modifier[] | undefined,
		name: TS.ModuleName,
		body: TS.ModuleBody | undefined
	): TS.ModuleDeclaration;
	function updateModuleDeclaration(
		node: TS.ModuleDeclaration,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrName: readonly TS.Modifier[] | TS.ModuleName | undefined,
		nameOrBody: TS.ModuleName | TS.ModuleBody | undefined,
		bodyOrUndefined?: TS.ModuleBody | undefined
	): TS.ModuleDeclaration {
		const isShort =
			typeof modifiersOrName === "string" ||
			(modifiersOrName != null &&
				!Array.isArray(modifiersOrName) &&
				("escapedText" in modifiersOrName /* Identifier */ || "_literalExpressionBrand" in modifiersOrName)); /* StringLiteral */
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrName as readonly TS.Modifier[]);
		const name = (isShort ? modifiersOrName : nameOrBody) as TS.ModuleName;
		const body = (isShort ? nameOrBody : bodyOrUndefined) as TS.ModuleBody | undefined;

		return typescript4Cast.updateModuleDeclaration(node as never, decorators as never, modifiers as never, name as never, body as never) as unknown as TS.ModuleDeclaration;
	}

	function createExportAssignment(modifiers: readonly TS.Modifier[] | undefined, isExportEquals: boolean | undefined, expression: TS.Expression): TS.ExportAssignment;
	function createExportAssignment(
		decorators: readonly TS.Decorator[],
		modifiers: readonly TS.Modifier[] | undefined,
		isExportEquals: boolean | undefined,
		expression: TS.Expression
	): TS.ExportAssignment;
	function createExportAssignment(
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrIsExportEquals: readonly TS.Modifier[] | boolean | undefined,
		isExportEqualsOrExpression: boolean | TS.Expression | undefined,
		expressionOrUndefined?: TS.Expression | undefined
	): TS.ExportAssignment {
		const isShort = arguments.length <= 3;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrIsExportEquals as readonly TS.Modifier[]);
		const isExportEquals = (isShort ? modifiersOrIsExportEquals : isExportEqualsOrExpression) as boolean;
		const expression = (isShort ? isExportEqualsOrExpression : expressionOrUndefined) as TS.Expression;

		return typescript4Cast.createExportAssignment(decorators as never, modifiers as never, isExportEquals as never, expression as never) as unknown as TS.ExportAssignment;
	}

	function updateExportAssignment(node: TS.ExportAssignment, modifiers: readonly TS.Modifier[] | undefined, expression: TS.Expression): TS.ExportAssignment;
	function updateExportAssignment(
		node: TS.ExportAssignment,
		decorators: readonly TS.Decorator[],
		modifiers: readonly TS.Modifier[] | undefined,
		expression: TS.Expression
	): TS.ExportAssignment;
	function updateExportAssignment(
		node: TS.ExportAssignment,
		decoratorsOrModifiers: readonly TS.Decorator[] | readonly TS.Modifier[] | undefined,
		modifiersOrExpression: readonly TS.Modifier[] | TS.Expression | undefined,
		expressionOrUndefined?: TS.Expression | undefined
	): TS.ExportAssignment {
		const isShort = arguments.length <= 3;
		const decorators = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[0] : (decoratorsOrModifiers as readonly TS.Decorator[]);
		const modifiers = isShort ? splitDecoratorsAndModifiers(decoratorsOrModifiers as readonly TS.ModifierLike[])[1] : (modifiersOrExpression as readonly TS.Modifier[]);
		const expression = (isShort ? modifiersOrExpression : expressionOrUndefined) as TS.Expression;

		return typescript4Cast.updateExportAssignment(node as never, decorators as never, modifiers as never, expression as never) as unknown as TS.ExportAssignment;
	}

	function createTypeParameterDeclaration(name: string | TS.Identifier, constraint?: TS.TypeNode, defaultType?: TS.TypeNode): TS.TypeParameterDeclaration;
	function createTypeParameterDeclaration(
		modifiers: readonly TS.Modifier[] | undefined,
		name: string | TS.Identifier,
		constraint?: TS.TypeNode,
		defaultType?: TS.TypeNode
	): TS.TypeParameterDeclaration;
	function createTypeParameterDeclaration(
		modifiersOrName: readonly TS.Modifier[] | string | TS.Identifier | undefined,
		nameOrConstraint?: string | TS.Identifier | TS.TypeNode,
		constraintOrDefaultType?: TS.TypeNode | TS.TypeNode,
		defaultTypeOrUndefined?: TS.TypeNode
	): TS.TypeParameterDeclaration {
		const isShort = typeof modifiersOrName === "string" || (modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName); /* Identifier */
		const modifiers = (isShort ? undefined : modifiersOrName) as TS.Modifier[] | undefined;
		const name = (isShort ? modifiersOrName : nameOrConstraint) as string | TS.Identifier;
		const constraint = (isShort ? nameOrConstraint : constraintOrDefaultType) as TS.TypeNode | undefined;
		const defaultType = (isShort ? constraintOrDefaultType : defaultTypeOrUndefined) as TS.TypeNode | undefined;

		const typeParameterDeclaration = typescript4Cast.createTypeParameterDeclaration(
			name as never,
			constraint as never,
			defaultType as never
		) as unknown as TS.TypeParameterDeclaration;
		if (modifiers != null) {
			(typeParameterDeclaration as unknown as Mutable<TS.TypeParameterDeclaration>).modifiers = typescript4Cast.createNodeArray(modifiers as never) as never;
		}

		return typeParameterDeclaration;
	}

	function updateTypeParameterDeclaration(node: TS.TypeParameterDeclaration, name: TS.Identifier, constraint?: TS.TypeNode, defaultType?: TS.TypeNode): TS.TypeParameterDeclaration;
	function updateTypeParameterDeclaration(
		node: TS.TypeParameterDeclaration,
		modifiers: readonly TS.Modifier[] | undefined,
		name: TS.Identifier,
		constraint?: TS.TypeNode,
		defaultType?: TS.TypeNode
	): TS.TypeParameterDeclaration;
	function updateTypeParameterDeclaration(
		node: TS.TypeParameterDeclaration,
		modifiersOrName: readonly TS.Modifier[] | TS.Identifier | undefined,
		nameOrConstraint?: TS.Identifier | TS.TypeNode,
		constraintOrDefaultType?: TS.TypeNode | TS.TypeNode,
		defaultTypeOrUndefined?: TS.TypeNode
	): TS.TypeParameterDeclaration {
		const isShort = modifiersOrName != null && !Array.isArray(modifiersOrName) && "escapedText" in modifiersOrName; /* Identifier */
		const modifiers = (isShort ? undefined : modifiersOrName) as TS.Modifier[] | undefined;
		const name = (isShort ? modifiersOrName : nameOrConstraint) as TS.Identifier;
		const constraint = (isShort ? nameOrConstraint : constraintOrDefaultType) as TS.TypeNode | undefined;
		const defaultType = (isShort ? constraintOrDefaultType : defaultTypeOrUndefined) as TS.TypeNode | undefined;

		const typeParameterDeclaration = typescript4Cast.updateTypeParameterDeclaration(
			node as never,
			name as never,
			constraint as never,
			defaultType as never
		) as unknown as TS.TypeParameterDeclaration;
		if (modifiers != null) {
			(typeParameterDeclaration as unknown as Mutable<TS.TypeParameterDeclaration>).modifiers = typescript4Cast.createNodeArray(modifiers as never) as never;
		}

		return typeParameterDeclaration;
	}

	const {updateSourceFileNode, ...common} = typescript as typeof typescript & Record<keyof Omit<typeof typescript4Cast, keyof typeof typescript>, never>;

	return {
		["__compatUpgraded" as never]: true,
		...common,

		createToken: createToken as never,
		createConstructorTypeNode,
		updateConstructorTypeNode,
		createImportTypeNode,
		updateImportTypeNode,
		createJSDocComment,
		createJSDocParameterTag,
		createJSDocPrivateTag,
		createJSDocAugmentsTag,
		createJSDocAuthorTag,
		createJSDocCallbackTag,
		createJSDocClassTag,
		createJSDocEnumTag,
		createJSDocImplementsTag,
		createJSDocPropertyTag,
		createJSDocProtectedTag,
		createJSDocPublicTag,
		createJSDocReadonlyTag,
		createJSDocReturnTag,
		createJSDocSignature,
		createJSDocTemplateTag,
		createJSDocThisTag,
		createJSDocTypeExpression,
		createJSDocTypeLiteral,
		createJSDocTypeTag,
		createJSDocTypedefTag,
		createJSDocAllType,
		createJSDocDeprecatedTag,
		createJSDocFunctionType,
		createJSDocLink,
		createJSDocNameReference,
		createJSDocNamepathType,
		createJSDocNonNullableType,
		createJSDocNullableType,
		createJSDocOptionalType,
		createJSDocOverrideTag,
		createJSDocSeeTag,
		createJSDocText,
		createJSDocUnknownTag,
		createJSDocUnknownType,
		createJSDocVariadicType,
		createJSDocMemberName,
		createJSDocLinkCode,
		createJSDocLinkPlain,
		createJSDocOverloadTag,
		createJSDocThrowsTag,
		createJSDocSatisfiesTag,
		createTemplateLiteralType,
		createTemplateLiteralTypeSpan,
		createClassStaticBlockDeclaration,
		createAssertClause,
		createAssertEntry,
		createImportTypeAssertionContainer,
		createJsxNamespacedName,
		createIndexSignature,
		updateIndexSignature,
		createSatisfiesExpression,
		updateSatisfiesExpression,
		createImportDeclaration,
		updateImportDeclaration,
		createUniquePrivateName,
		createPrivateIdentifier,
		getGeneratedPrivateNameForNode,
		createTypeAliasDeclaration,
		updateTypeAliasDeclaration,
		createFunctionDeclaration,
		updateFunctionDeclaration,
		createClassDeclaration,
		updateClassDeclaration,
		createInterfaceDeclaration,
		updateInterfaceDeclaration,
		createEnumDeclaration,
		updateEnumDeclaration,
		createModuleDeclaration,
		updateModuleDeclaration,
		createExportAssignment,
		updateExportAssignment,
		createTypeParameterDeclaration,
		updateTypeParameterDeclaration,

		createComma(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createComma(left as never, right as never) as unknown as TS.BinaryExpression;
		},
		createAssignment(left: TS.ObjectLiteralExpression | TS.ArrayLiteralExpression, right: TS.Expression): TS.DestructuringAssignment {
			return typescript4Cast.createAssignment(left as never, right as never) as unknown as TS.DestructuringAssignment;
		},
		createLessThan(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createLessThan(left as never, right as never) as unknown as TS.BinaryExpression;
		},
		createSourceFile(statements: readonly TS.Statement[], endOfFileToken: TS.EndOfFileToken, flags: TS.NodeFlags): TS.SourceFile {
			const sourceFile = typescript.createSourceFile("", "", 0, undefined, 0) as unknown as Mutable<TS.SourceFile>;
			sourceFile.endOfFileToken = endOfFileToken;
			sourceFile.flags |= flags;
			sourceFile.statements = typescript4Cast.createNodeArray(statements as never) as never;
			return sourceFile;
		},
		createClassExpression,
		createExpressionWithTypeArguments(expression: TS.Expression, typeArguments: readonly TS.TypeNode[] | undefined): TS.ExpressionWithTypeArguments {
			return typescript4Cast.createExpressionWithTypeArguments(typeArguments as never, expression as never) as never;
		},
		updateExpressionWithTypeArguments(
			node: TS.ExpressionWithTypeArguments,
			expression: TS.Expression,
			typeArguments: readonly TS.TypeNode[] | undefined
		): TS.ExpressionWithTypeArguments {
			return typescript4Cast.updateExpressionWithTypeArguments(node as never, typeArguments as never, expression as never) as never;
		},
		updateImportClause(node: TS.ImportClause, isTypeOnly: boolean, name: TS.Identifier | undefined, namedBindings: TS.NamedImportBindings | undefined): TS.ImportClause {
			return typescript4Cast.updateImportClause(node as never, name as never, namedBindings as never, isTypeOnly as never) as never;
		},
		updateExportDeclaration,
		createTypePredicateNode(
			assertsModifier: TS.AssertsKeyword | undefined,
			parameterName: TS.Identifier | TS.ThisTypeNode | string,
			type: TS.TypeNode | undefined
		): TS.TypePredicateNode {
			return typescript4Cast.createTypePredicateNode(parameterName as never, type as never) as never;
		},
		updateTypePredicateNode(
			node: TS.TypePredicateNode,
			assertsModifier: TS.AssertsKeyword | undefined,
			parameterName: TS.Identifier | TS.ThisTypeNode,
			type: TS.TypeNode | undefined
		): TS.TypePredicateNode {
			return typescript4Cast.updateTypePredicateNode(node as never, parameterName as never, type as never) as never;
		},
		createMethodSignature(
			modifiers: readonly TS.Modifier[] | undefined,
			name: string | TS.PropertyName,
			questionToken: TS.QuestionToken | undefined,
			typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
			parameters: readonly TS.ParameterDeclaration[],
			type: TS.TypeNode | undefined
		): TS.MethodSignature {
			const methodSignature = typescript4Cast.createMethodSignature(
				typeParameters as never,
				parameters as never,
				type as never,
				name as never,
				questionToken as never
			) as unknown as Mutable<TS.MethodSignature>;

			// Also set the modifiers
			// Workaround for: https://github.com/microsoft/TypeScript/issues/35959
			if (modifiers != null) {
				methodSignature.modifiers = typescript4Cast.createNodeArray(modifiers as never) as never;
			}
			return methodSignature;
		},
		updateMethodSignature(
			node: TS.MethodSignature,
			modifiers: readonly TS.Modifier[] | undefined,
			name: TS.PropertyName,
			questionToken: TS.QuestionToken | undefined,
			typeParameters: TS.NodeArray<TS.TypeParameterDeclaration> | undefined,
			parameters: TS.NodeArray<TS.ParameterDeclaration>,
			type: TS.TypeNode | undefined
		): TS.MethodSignature {
			const methodSignature = typescript4Cast.updateMethodSignature(
				node as never,
				typeParameters as never,
				parameters as never,
				type as never,
				name as never,
				questionToken as never
			) as unknown as Mutable<TS.MethodSignature>;

			// Also set the modifiers
			// Workaround for: https://github.com/microsoft/TypeScript/issues/35959
			if (modifiers !== methodSignature.modifiers) {
				methodSignature.modifiers = modifiers == null ? modifiers : (typescript4Cast.createNodeArray(modifiers as never) as never);
			}
			return methodSignature;
		},
		updatePropertySignature(
			node: TS.PropertySignature,
			modifiers: readonly TS.Modifier[] | undefined,
			name: TS.PropertyName,
			questionToken: TS.QuestionToken | undefined,
			type: TS.TypeNode | undefined
		): TS.PropertySignature {
			return typescript4Cast.updatePropertySignature(node as never, modifiers as never, name as never, questionToken as never, type as never, undefined as never) as never;
		},
		createAwaitExpression(expression: TS.Expression): TS.AwaitExpression {
			return typescript4Cast.createAwait(expression as never) as never;
		},
		createBinaryExpression(left: TS.Expression, operator: TS.BinaryOperator | TS.BinaryOperatorToken, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, operator as never, right as never) as never;
		},
		createBitwiseAnd(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.AmpersandToken as never, right as never) as never;
		},
		createBitwiseNot(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript4Cast.createPrefix(typescript.SyntaxKind.TildeToken as never, operand as never) as never;
		},
		createBitwiseOr(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.BarToken as never, right as never) as never;
		},
		createBitwiseXor(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.CaretToken as never, right as never) as never;
		},
		createBreakStatement(label?: string | TS.Identifier): TS.BreakStatement {
			return typescript4Cast.createBreak(label as never) as never;
		},
		createCommaListExpression(elements: readonly TS.Expression[]): TS.CommaListExpression {
			return typescript4Cast.createCommaList(elements as never) as never;
		},
		createConditionalExpression(
			condition: TS.Expression,
			questionToken: TS.QuestionToken | undefined,
			whenTrue: TS.Expression,
			colonToken: TS.ColonToken | undefined,
			whenFalse: TS.Expression
		): TS.ConditionalExpression {
			if (questionToken == null || colonToken == null) {
				return typescript4Cast.createConditional(condition as never, whenTrue as never, whenFalse as never) as never;
			}
			return typescript4Cast.createConditional(condition as never, questionToken as never, whenTrue as never, colonToken as never, whenFalse as never) as never;
		},
		createConstructorDeclaration,
		createContinueStatement(label?: string | TS.Identifier): TS.ContinueStatement {
			return typescript4Cast.createContinue(label as never) as never;
		},
		createDeleteExpression(expression: TS.Expression): TS.DeleteExpression {
			return typescript4Cast.createDelete(expression as never) as never;
		},
		createDivide(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.SlashToken as never, right as never) as never;
		},
		createDoStatement(statement: TS.Statement, expression: TS.Expression): TS.DoStatement {
			return typescript4Cast.createDo(statement as never, expression as never) as never;
		},
		createElementAccessExpression(expression: TS.Expression, index: number | TS.Expression): TS.ElementAccessExpression {
			return typescript4Cast.createElementAccess(expression as never, index as never) as never;
		},
		createEquality(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.EqualsEqualsToken as never, right as never) as never;
		},
		createExponent(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.AsteriskAsteriskToken as never, right as never) as never;
		},
		createForInStatement(initializer: TS.ForInitializer, expression: TS.Expression, statement: TS.Statement): TS.ForInStatement {
			return typescript4Cast.createForIn(initializer as never, expression as never, statement as never) as never;
		},
		createForOfStatement(awaitModifier: TS.AwaitKeyword | undefined, initializer: TS.ForInitializer, expression: TS.Expression, statement: TS.Statement): TS.ForOfStatement {
			return typescript4Cast.createForOf(awaitModifier as never, initializer as never, expression as never, statement as never) as never;
		},
		createForStatement(
			initializer: TS.ForInitializer | undefined,
			condition: TS.Expression | undefined,
			incrementor: TS.Expression | undefined,
			statement: TS.Statement
		): TS.ForStatement {
			return typescript4Cast.createFor(initializer as never, condition as never, incrementor as never, statement as never) as never;
		},
		createGreaterThan(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.GreaterThanToken as never, right as never) as never;
		},
		createGreaterThanEquals(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.GreaterThanEqualsToken as never, right as never) as never;
		},
		createIfStatement(expression: TS.Expression, thenStatement: TS.Statement, elseStatement?: TS.Statement): TS.IfStatement {
			return typescript4Cast.createIf(expression as never, thenStatement as never, elseStatement as never) as never;
		},
		createInequality(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.ExclamationEqualsToken as never, right as never) as never;
		},
		createLabeledStatement(label: string | TS.Identifier, statement: TS.Statement): TS.LabeledStatement {
			return typescript4Cast.createLabel(label as never, statement as never) as never;
			createParameterDeclaration;
		},
		createLeftShift(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.LessThanLessThanToken as never, right as never) as never;
		},
		createLessThanEquals(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.LessThanEqualsToken as never, right as never) as never;
		},
		createMethodDeclaration,
		createModulo(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.PercentToken as never, right as never) as never;
		},
		createMultiply(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.AsteriskToken as never, right as never) as never;
		},
		createNamedTupleMember,
		createNewExpression(expression: TS.Expression, typeArguments: readonly TS.TypeNode[] | undefined, argumentsArray: readonly TS.Expression[] | undefined): TS.NewExpression {
			return typescript4Cast.createNew(expression as never, typeArguments as never, argumentsArray as never) as never;
		},
		createParameterDeclaration,
		createParenthesizedExpression(expression: TS.Expression): TS.ParenthesizedExpression {
			return typescript4Cast.createParen(expression as never) as never;
		},
		createPostfixDecrement(operand: TS.Expression): TS.PostfixUnaryExpression {
			return typescript4Cast.createPostfix(operand as never, typescript.SyntaxKind.MinusMinusToken as never) as never;
		},
		createPostfixUnaryExpression(operand: TS.Expression, operator: TS.PostfixUnaryOperator): TS.PostfixUnaryExpression {
			return typescript4Cast.createPostfix(operand as never, operator as never) as never;
		},
		createPrefixDecrement(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript4Cast.createPrefix(typescript.SyntaxKind.MinusMinusToken as never, operand as never) as never;
		},
		createPrefixIncrement(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript4Cast.createPrefix(typescript.SyntaxKind.PlusPlusToken as never, operand as never) as never;
		},
		createPrefixMinus(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript4Cast.createPrefix(typescript.SyntaxKind.MinusToken as never, operand as never) as never;
		},
		createPrefixPlus(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript4Cast.createPrefix(typescript.SyntaxKind.PlusToken as never, operand as never) as never;
		},
		createPrefixUnaryExpression(operator: TS.PrefixUnaryOperator, operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript4Cast.createPrefix(operator as never, operand as never) as never;
		},
		createPropertyDeclaration,
		createRightShift(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.GreaterThanGreaterThanToken as never, right as never) as never;
		},
		createSetAccessorDeclaration,
		createSpreadElement(expression: TS.Expression): TS.SpreadElement {
			return typescript4Cast.createSpread(expression as never) as never;
		},
		createSwitchStatement(expression: TS.Expression, caseBlock: TS.CaseBlock): TS.SwitchStatement {
			return typescript4Cast.createSwitch(expression as never, caseBlock as never) as never;
		},
		createTaggedTemplateExpression(tag: TS.Expression, typeArguments: readonly TS.TypeNode[] | undefined, template: TS.TemplateLiteral): TS.TaggedTemplateExpression {
			return typescript4Cast.createTaggedTemplate(tag as never, typeArguments as never, template as never) as never;
		},
		createThrowStatement(expression: TS.Expression): TS.ThrowStatement {
			return typescript4Cast.createThrow(expression as never) as never;
		},
		createTryStatement(tryBlock: TS.Block, catchClause: TS.CatchClause | undefined, finallyBlock: TS.Block | undefined): TS.TryStatement {
			return typescript4Cast.createTry(tryBlock as never, catchClause as never, finallyBlock as never) as never;
		},
		createTypeOfExpression(expression: TS.Expression): TS.TypeOfExpression {
			return typescript4Cast.createTypeOf(expression as never) as never;
		},
		createUnsignedRightShift(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.createBinary(left as never, typescript.SyntaxKind.GreaterThanGreaterThanGreaterThanToken as never, right as never) as never;
		},
		createVoidExpression(expression: TS.Expression): TS.VoidExpression {
			return typescript4Cast.createVoid(expression as never) as never;
		},
		createWhileStatement(expression: TS.Expression, statement: TS.Statement): TS.WhileStatement {
			return typescript4Cast.createWhile(expression as never, statement as never) as never;
		},
		createWithStatement(expression: TS.Expression, statement: TS.Statement): TS.WithStatement {
			return typescript4Cast.createWith(expression as never, statement as never) as never;
		},
		createYieldExpression(asteriskToken: TS.AsteriskToken | undefined, expression: TS.Expression | undefined): TS.YieldExpression {
			return typescript4Cast.createYield(asteriskToken as never, expression as never) as never;
		},
		restoreOuterExpressions(outerExpression: TS.Expression | undefined, innerExpression: TS.Expression, kinds?: TS.OuterExpressionKinds): TS.Expression {
			return innerExpression;
		},
		updateAwaitExpression(node: TS.AwaitExpression, expression: TS.Expression): TS.AwaitExpression {
			return typescript4Cast.updateAwait(node as never, expression as never) as never;
		},
		updateBinaryExpression(node: TS.BinaryExpression, left: TS.Expression, operator: TS.BinaryOperator | TS.BinaryOperatorToken, right: TS.Expression): TS.BinaryExpression {
			return typescript4Cast.updateBinary(node as never, left as never, right as never, operator as never) as never;
		},
		updateBreakStatement(node: TS.BreakStatement, label: TS.Identifier | undefined): TS.BreakStatement {
			return typescript4Cast.updateBreak(node as never, label as never) as never;
		},
		updateCommaListExpression(node: TS.CommaListExpression, elements: readonly TS.Expression[]): TS.CommaListExpression {
			return typescript4Cast.updateCommaList(node as never, elements as never) as never;
		},
		updateConditionalExpression(
			node: TS.ConditionalExpression,
			condition: TS.Expression,
			questionToken: TS.QuestionToken,
			whenTrue: TS.Expression,
			colonToken: TS.ColonToken,
			whenFalse: TS.Expression
		): TS.ConditionalExpression {
			return typescript4Cast.updateConditional(node as never, condition as never, questionToken as never, whenTrue as never, colonToken as never, whenFalse as never) as never;
		},
		updateContinueStatement(node: TS.ContinueStatement, label: TS.Identifier | undefined): TS.ContinueStatement {
			return typescript4Cast.updateContinue(node as never, label as never) as never;
		},
		updateDeleteExpression(node: TS.DeleteExpression, expression: TS.Expression): TS.DeleteExpression {
			return typescript4Cast.updateDelete(node as never, expression as never) as never;
		},
		updateDoStatement(node: TS.DoStatement, statement: TS.Statement, expression: TS.Expression): TS.DoStatement {
			return typescript4Cast.updateDo(node as never, statement as never, expression as never) as never;
		},
		updateElementAccessExpression(node: TS.ElementAccessExpression, expression: TS.Expression, argumentExpression: TS.Expression): TS.ElementAccessExpression {
			return typescript4Cast.updateElementAccess(node as never, expression as never, argumentExpression as never) as never;
		},
		updateForInStatement(node: TS.ForInStatement, initializer: TS.ForInitializer, expression: TS.Expression, statement: TS.Statement): TS.ForInStatement {
			return typescript4Cast.updateForIn(node as never, initializer as never, expression as never, statement as never) as never;
		},
		updateForOfStatement(
			node: TS.ForOfStatement,
			awaitModifier: TS.AwaitKeyword | undefined,
			initializer: TS.ForInitializer,
			expression: TS.Expression,
			statement: TS.Statement
		): TS.ForOfStatement {
			return typescript4Cast.updateForOf(node as never, awaitModifier as never, initializer as never, expression as never, statement as never) as never;
		},
		updateForStatement(
			node: TS.ForStatement,
			initializer: TS.ForInitializer | undefined,
			condition: TS.Expression | undefined,
			incrementor: TS.Expression | undefined,
			statement: TS.Statement
		): TS.ForStatement {
			return typescript4Cast.updateFor(node as never, initializer as never, condition as never, incrementor as never, statement as never) as never;
		},
		updateIfStatement(node: TS.IfStatement, expression: TS.Expression, thenStatement: TS.Statement, elseStatement: TS.Statement | undefined): TS.IfStatement {
			return typescript4Cast.updateIf(node as never, expression as never, thenStatement as never, elseStatement as never) as never;
		},
		updateJSDocAugmentsTag(
			node: TS.JSDocAugmentsTag,
			tagName: TS.Identifier | undefined,
			className: TS.JSDocAugmentsTag["class"],
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocAugmentsTag {
			return tagName === node.tagName && className === node.class && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocAugmentsTag(tagName, className, comment), node);
		},
		updateJSDocAuthorTag(node: TS.JSDocAuthorTag, tagName: TS.Identifier | undefined, comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined): TS.JSDocAuthorTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocAuthorTag(tagName, comment), node);
		},
		updateJSDocCallbackTag(
			node: TS.JSDocCallbackTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocSignature,
			fullName: TS.Identifier | TS.JSDocNamespaceDeclaration | undefined,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocCallbackTag {
			return tagName === node.tagName && typeExpression === node.typeExpression && fullName === node.fullName && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocCallbackTag(tagName, typeExpression, fullName, comment), node);
		},
		updateJSDocClassTag(node: TS.JSDocClassTag, tagName: TS.Identifier | undefined, comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined): TS.JSDocClassTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocClassTag(tagName, comment), node);
		},
		updateJSDocComment(node: TS.JSDoc, comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined, tags: readonly TS.JSDocTag[] | undefined): TS.JSDoc {
			return comment === node.comment && tags === node.tags ? node : typescript.setTextRange(createJSDocComment(comment, tags), node);
		},
		updateJSDocDeprecatedTag(node: TS.JSDocDeprecatedTag, tagName: TS.Identifier, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocDeprecatedTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocDeprecatedTag(tagName, comment), node);
		},
		updateJSDocEnumTag(
			node: TS.JSDocEnumTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocTypeExpression,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocEnumTag {
			return tagName === node.tagName && typeExpression === node.typeExpression ? node : typescript.setTextRange(createJSDocEnumTag(tagName, typeExpression, comment), node);
		},
		updateJSDocFunctionType(node: TS.JSDocFunctionType, parameters: readonly TS.ParameterDeclaration[], type: TS.TypeNode | undefined): TS.JSDocFunctionType {
			return parameters === node.parameters && type === node.type ? node : typescript.setTextRange(createJSDocFunctionType(parameters, type), node);
		},
		updateJSDocImplementsTag(
			node: TS.JSDocImplementsTag,
			tagName: TS.Identifier | undefined,
			className: TS.JSDocImplementsTag["class"],
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocImplementsTag {
			return tagName === node.tagName && className === node.class && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocImplementsTag(tagName, className, comment), node);
		},
		updateJSDocLink(node: TS.JSDocLink, name: TS.EntityName | undefined, text: string): TS.JSDocLink {
			return name === node.name && text === node.text ? node : typescript.setTextRange(createJSDocLink(name, text), node);
		},
		updateJSDocNameReference(node: TS.JSDocNameReference, name: TS.EntityName): TS.JSDocNameReference {
			return name === node.name ? node : typescript.setTextRange(createJSDocNameReference(name), node);
		},
		updateJSDocNamepathType(node: TS.JSDocNamepathType, type: TS.TypeNode): TS.JSDocNamepathType {
			return type === node.type ? node : typescript.setTextRange(createJSDocNamepathType(type), node);
		},
		updateJSDocNonNullableType(node: TS.JSDocNonNullableType, type: TS.TypeNode): TS.JSDocNonNullableType {
			return type === node.type ? node : typescript.setTextRange(createJSDocNonNullableType(type), node);
		},
		updateJSDocNullableType(node: TS.JSDocNullableType, type: TS.TypeNode): TS.JSDocNullableType {
			return type === node.type ? node : typescript.setTextRange(createJSDocNullableType(type), node);
		},
		updateJSDocOptionalType(node: TS.JSDocOptionalType, type: TS.TypeNode): TS.JSDocOptionalType {
			return type === node.type ? node : typescript.setTextRange(createJSDocOptionalType(type), node);
		},
		updateJSDocOverrideTag(node: TS.JSDocOverrideTag, tagName: TS.Identifier, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocOverrideTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocOverrideTag(tagName, comment), node);
		},
		updateJSDocParameterTag(
			node: TS.JSDocParameterTag,
			tagName: TS.Identifier | undefined,
			name: TS.EntityName,
			isBracketed: boolean,
			typeExpression: TS.JSDocTypeExpression | undefined,
			isNameFirst: boolean,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocParameterTag {
			return tagName === node.tagName &&
				name === node.name &&
				isBracketed === node.isBracketed &&
				typeExpression === node.typeExpression &&
				isNameFirst === node.isNameFirst &&
				comment === node.comment
				? node
				: typescript.setTextRange(createJSDocParameterTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment), node);
		},
		updateJSDocPrivateTag(
			node: TS.JSDocPrivateTag,
			tagName: TS.Identifier | undefined,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocPrivateTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocPrivateTag(tagName, comment), node);
		},
		updateJSDocPropertyTag(
			node: TS.JSDocPropertyTag,
			tagName: TS.Identifier | undefined,
			name: TS.EntityName,
			isBracketed: boolean,
			typeExpression: TS.JSDocTypeExpression | undefined,
			isNameFirst: boolean,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocPropertyTag {
			return tagName === node.tagName &&
				name === node.name &&
				isBracketed === node.isBracketed &&
				typeExpression === node.typeExpression &&
				isNameFirst === node.isNameFirst &&
				comment === node.comment
				? node
				: typescript.setTextRange(createJSDocPropertyTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment), node);
		},
		updateJSDocProtectedTag(
			node: TS.JSDocProtectedTag,
			tagName: TS.Identifier | undefined,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocProtectedTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocProtectedTag(tagName, comment), node);
		},
		updateJSDocPublicTag(node: TS.JSDocPublicTag, tagName: TS.Identifier | undefined, comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined): TS.JSDocPublicTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocPublicTag(tagName, comment), node);
		},
		updateJSDocReadonlyTag(
			node: TS.JSDocReadonlyTag,
			tagName: TS.Identifier | undefined,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocReadonlyTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocReadonlyTag(tagName, comment), node);
		},
		updateJSDocReturnTag(
			node: TS.JSDocReturnTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocTypeExpression | undefined,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocReturnTag {
			return tagName === node.tagName && comment === node.comment && typeExpression === node.typeExpression
				? node
				: typescript.setTextRange(createJSDocReturnTag(tagName, typeExpression, comment), node);
		},
		updateJSDocSeeTag(
			node: TS.JSDocSeeTag,
			tagName: TS.Identifier | undefined,
			nameExpression: TS.JSDocNameReference | undefined,
			comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
		): TS.JSDocSeeTag {
			return tagName === node.tagName && nameExpression === node.name && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocSeeTag(tagName, nameExpression, comment), node);
		},
		updateJSDocSignature(
			node: TS.JSDocSignature,
			typeParameters: readonly TS.JSDocTemplateTag[] | undefined,
			parameters: readonly TS.JSDocParameterTag[],
			type: TS.JSDocReturnTag | undefined
		): TS.JSDocSignature {
			return typeParameters === node.typeParameters && parameters === node.parameters && type === node.type
				? node
				: typescript.setTextRange(createJSDocSignature(typeParameters, parameters, type), node);
		},
		updateJSDocTemplateTag(
			node: TS.JSDocTemplateTag,
			tagName: TS.Identifier | undefined,
			constraint: TS.JSDocTypeExpression | undefined,
			typeParameters: readonly TS.TypeParameterDeclaration[],
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocTemplateTag {
			return tagName === node.tagName && constraint === node.constraint && typeParameters === node.typeParameters && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocTemplateTag(tagName, constraint, typeParameters, comment), node);
		},
		updateJSDocText(node: TS.JSDocText, text: string): TS.JSDocText {
			return text === node.text ? node : typescript.setTextRange(createJSDocText(text), node);
		},
		updateJSDocThisTag(
			node: TS.JSDocThisTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocTypeExpression | undefined,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocThisTag {
			return tagName === node.tagName && typeExpression === node.typeExpression && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocThisTag(tagName, typeExpression!, comment), node);
		},
		updateJSDocTypeExpression(node: TS.JSDocTypeExpression, type: TS.TypeNode): TS.JSDocTypeExpression {
			return type === node.type ? node : typescript.setTextRange(createJSDocTypeExpression(type), node);
		},
		updateJSDocTypeLiteral(node: TS.JSDocTypeLiteral, jsDocPropertyTags: readonly TS.JSDocPropertyLikeTag[] | undefined, isArrayType: boolean | undefined): TS.JSDocTypeLiteral {
			return jsDocPropertyTags === node.jsDocPropertyTags && isArrayType === node.isArrayType
				? node
				: typescript.setTextRange(createJSDocTypeLiteral(jsDocPropertyTags, isArrayType), node);
		},
		updateJSDocTypeTag(
			node: TS.JSDocTypeTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocTypeExpression,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocTypeTag {
			return tagName === node.tagName && typeExpression === node.typeExpression && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocTypeTag(tagName, typeExpression, comment), node);
		},
		updateJSDocTypedefTag(
			node: TS.JSDocTypedefTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocTypeExpression | TS.JSDocTypeLiteral | undefined,
			fullName: TS.Identifier | TS.JSDocNamespaceDeclaration | undefined,
			comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined
		): TS.JSDocTypedefTag {
			return tagName === node.tagName && typeExpression === node.typeExpression && fullName === node.fullName && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocTypedefTag(tagName, typeExpression, fullName, comment), node);
		},
		updateJSDocUnknownTag(node: TS.JSDocUnknownTag, tagName: TS.Identifier, comment: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined): TS.JSDocUnknownTag {
			return tagName === node.tagName && comment === node.comment ? node : typescript.setTextRange(createJSDocUnknownTag(tagName, comment), node);
		},
		updateJSDocVariadicType(node: TS.JSDocVariadicType, type: TS.TypeNode): TS.JSDocVariadicType {
			return type === node.type ? node : typescript.setTextRange(createJSDocVariadicType(type), node);
		},
		updateJSDocMemberName(node: TS.JSDocMemberName, left: TS.EntityName | TS.JSDocMemberName, right: TS.Identifier): TS.JSDocMemberName {
			return left === node.left && right === node.right ? node : typescript.setTextRange(createJSDocMemberName(left, right), node);
		},
		updateJSDocLinkCode(node: TS.JSDocLinkCode, name: TS.EntityName | TS.JSDocMemberName | undefined, text: string): TS.JSDocLinkCode {
			return name === node.name && text === node.text ? node : typescript.setTextRange(createJSDocLinkCode(name, text), node);
		},
		updateJSDocLinkPlain(node: TS.JSDocLinkPlain, name: TS.EntityName | TS.JSDocMemberName | undefined, text: string): TS.JSDocLinkPlain {
			return name === node.name && text === node.text ? node : typescript.setTextRange(createJSDocLinkPlain(name, text), node);
		},
		updateJSDocOverloadTag(
			node: TS.JSDocOverloadTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocSignature,
			comment: string | TS.NodeArray<TS.JSDocComment> | undefined
		): TS.JSDocOverloadTag {
			return tagName === node.tagName && typeExpression === node.typeExpression && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocOverloadTag(tagName, typeExpression, comment), node);
		},
		updateJSDocThrowsTag(
			node: TS.JSDocThrowsTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocTypeExpression | undefined,
			comment?: string | TS.NodeArray<TS.JSDocComment> | undefined
		): TS.JSDocThrowsTag {
			return tagName === node.tagName && typeExpression === node.typeExpression && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocThrowsTag(tagName ?? node.tagName, typeExpression, comment), node);
		},
		updateJSDocSatisfiesTag(
			node: TS.JSDocSatisfiesTag,
			tagName: TS.Identifier | undefined,
			typeExpression: TS.JSDocTypeExpression,
			comment: string | TS.NodeArray<TS.JSDocComment> | undefined
		): TS.JSDocSatisfiesTag {
			return tagName === node.tagName && typeExpression === node.typeExpression && comment === node.comment
				? node
				: typescript.setTextRange(createJSDocSatisfiesTag(tagName, typeExpression, comment), node);
		},
		updateLabeledStatement(node: TS.LabeledStatement, label: TS.Identifier, statement: TS.Statement): TS.LabeledStatement {
			return typescript4Cast.updateLabel(node as never, label as never, statement as never) as never;
		},
		updateMethodDeclaration,
		updateNamedTupleMember(
			node: TS.NamedTupleMember,
			dotDotDotToken: TS.DotDotDotToken | undefined,
			name: TS.Identifier,
			questionToken: TS.QuestionToken | undefined,
			type: TS.TypeNode
		): TS.NamedTupleMember {
			return dotDotDotToken === node.dotDotDotToken && name === node.name && questionToken === node.questionToken && type === node.type
				? node
				: typescript.setTextRange(createNamedTupleMember(dotDotDotToken, name, questionToken, type), node);
		},
		updateNewExpression(
			node: TS.NewExpression,
			expression: TS.Expression,
			typeArguments: readonly TS.TypeNode[] | undefined,
			argumentsArray: readonly TS.Expression[] | undefined
		): TS.NewExpression {
			return typescript4Cast.updateNew(node as never, expression as never, typeArguments as never, argumentsArray as never) as never;
		},
		updateObjectLiteralExpression(node: TS.ObjectLiteralExpression, properties: readonly TS.ObjectLiteralElementLike[]): TS.ObjectLiteralExpression {
			return typescript4Cast.updateObjectLiteral(node as never, properties as never) as never;
		},
		updateParameterDeclaration,
		updateParenthesizedExpression(node: TS.ParenthesizedExpression, expression: TS.Expression): TS.ParenthesizedExpression {
			return typescript4Cast.updateParen(node as never, expression as never) as never;
		},
		updatePostfixUnaryExpression(node: TS.PostfixUnaryExpression, operand: TS.Expression): TS.PostfixUnaryExpression {
			return typescript4Cast.updatePostfix(node as never, operand as never) as never;
		},
		updatePrefixUnaryExpression(node: TS.PrefixUnaryExpression, operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript4Cast.updatePrefix(node as never, operand as never) as never;
		},
		updatePropertyAccessExpression(node: TS.PropertyAccessExpression, expression: TS.Expression, name: TS.MemberName): TS.PropertyAccessExpression {
			return typescript4Cast.updatePropertyAccess(node as never, expression as never, name as never) as never;
		},
		updatePropertyDeclaration,
		updateReturnStatement(node: TS.ReturnStatement, expression: TS.Expression | undefined): TS.ReturnStatement {
			return typescript4Cast.updateReturn(node as never, expression as never) as never;
		},
		updateSetAccessorDeclaration,
		updateSpreadElement(node: TS.SpreadElement, expression: TS.Expression): TS.SpreadElement {
			return typescript4Cast.updateSpread(node as never, expression as never) as never;
		},
		updateSwitchStatement(node: TS.SwitchStatement, expression: TS.Expression, caseBlock: TS.CaseBlock): TS.SwitchStatement {
			return typescript4Cast.updateSwitch(node as never, expression as never, caseBlock as never) as never;
		},
		updateTaggedTemplateExpression(
			node: TS.TaggedTemplateExpression,
			tag: TS.Expression,
			typeArguments: readonly TS.TypeNode[] | undefined,
			template: TS.TemplateLiteral
		): TS.TaggedTemplateExpression {
			return typescript4Cast.updateTaggedTemplate(node as never, tag as never, typeArguments as never, template as never) as never;
		},
		updateTemplateLiteralType(node: TS.TemplateLiteralTypeNode, head: TS.TemplateHead, templateSpans: readonly TS.TemplateLiteralTypeSpan[]): TS.TemplateLiteralTypeNode {
			return head === node.head && templateSpans === node.templateSpans ? node : typescript.setTextRange(createTemplateLiteralType(head, templateSpans), node);
		},
		updateTemplateLiteralTypeSpan(node: TS.TemplateLiteralTypeSpan, type: TS.TypeNode, literal: TS.TemplateMiddle | TS.TemplateTail): TS.TemplateLiteralTypeSpan {
			return type === node.type && literal === node.literal ? node : typescript.setTextRange(createTemplateLiteralTypeSpan(type, literal), node);
		},
		updateClassStaticBlockDeclaration,
		updateAssertClause(node: TS.AssertClause, elements: TS.NodeArray<TS.AssertEntry>, multiLine?: boolean): TS.AssertClause {
			return node.elements !== elements || node.multiLine !== multiLine ? typescript.setTextRange(createAssertClause(elements, multiLine), node) : node;
		},
		updateAssertEntry(node: TS.AssertEntry, name: TS.AssertionKey, value: TS.StringLiteral): TS.AssertEntry {
			return node.name !== name || node.value !== value ? typescript.setTextRange(createAssertEntry(name, value), node) : node;
		},
		updateImportTypeAssertionContainer(node: TS.ImportTypeAssertionContainer, clause: TS.AssertClause, multiLine?: boolean): TS.ImportTypeAssertionContainer {
			return node.assertClause !== clause || node.multiLine !== multiLine ? typescript.setTextRange(createImportTypeAssertionContainer(clause, multiLine), node) : node;
		},
		updateJsxNamespacedName(node: TS.JsxNamespacedName, namespace: TS.Identifier, name: TS.Identifier): TS.JsxNamespacedName {
			return node.namespace !== namespace || node.name !== name ? typescript.setTextRange(createJsxNamespacedName(namespace, name), node) : node;
		},
		updateThrowStatement(node: TS.ThrowStatement, expression: TS.Expression): TS.ThrowStatement {
			return typescript4Cast.updateThrow(node as never, expression as never) as never;
		},
		updateTryStatement(node: TS.TryStatement, tryBlock: TS.Block, catchClause: TS.CatchClause | undefined, finallyBlock: TS.Block | undefined): TS.TryStatement {
			return typescript4Cast.updateTry(node as never, tryBlock as never, catchClause as never, finallyBlock as never) as never;
		},
		updateTypeOfExpression(node: TS.TypeOfExpression, expression: TS.Expression): TS.TypeOfExpression {
			return typescript4Cast.updateTypeOf(node as never, expression as never) as never;
		},
		updateVoidExpression(node: TS.VoidExpression, expression: TS.Expression): TS.VoidExpression {
			return typescript4Cast.updateVoid(node as never, expression as never) as never;
		},
		updateWhileStatement(node: TS.WhileStatement, expression: TS.Expression, statement: TS.Statement): TS.WhileStatement {
			return typescript4Cast.updateWhile(node as never, expression as never, statement as never) as never;
		},
		updateWithStatement(node: TS.WithStatement, expression: TS.Expression, statement: TS.Statement): TS.WithStatement {
			return typescript4Cast.updateWith(node as never, expression as never, statement as never) as never;
		},
		updateYieldExpression(node: TS.YieldExpression, asteriskToken: TS.AsteriskToken | undefined, expression: TS.Expression | undefined): TS.YieldExpression {
			return typescript4Cast.updateYield(node as never, asteriskToken as never, expression as never) as never;
		},
		createImportClause(isTypeOnly: boolean, name: TS.Identifier | undefined, namedBindings: TS.NamedImportBindings | undefined): TS.ImportClause {
			return typescript4Cast.createImportClause(name as never, namedBindings as never, isTypeOnly as never) as never;
		},
		createCallExpression(expression: TS.Expression, typeArguments: readonly TS.TypeNode[] | undefined, argumentsArray: readonly TS.Expression[] | undefined): TS.CallExpression {
			return typescript4Cast.createCall(expression as never, typeArguments as never, argumentsArray as never) as never;
		},
		updateCallExpression(
			node: TS.CallExpression,
			expression: TS.Expression,
			typeArguments: readonly TS.TypeNode[] | undefined,
			argumentsArray: readonly TS.Expression[]
		): TS.CallExpression {
			return typescript4Cast.updateCall(node as never, expression as never, typeArguments as never, argumentsArray as never) as never;
		},
		createArrayLiteralExpression(elements?: readonly TS.Expression[], multiLine?: boolean): TS.ArrayLiteralExpression {
			return typescript4Cast.createArrayLiteral(elements as never, multiLine as never) as never;
		},
		updateArrayLiteralExpression(node: TS.ArrayLiteralExpression, elements: readonly TS.Expression[]): TS.ArrayLiteralExpression {
			return typescript4Cast.updateArrayLiteral(node as never, elements as never) as never;
		},
		updateSourceFile(
			node: TS.SourceFile,
			statements: readonly TS.Statement[],
			isDeclarationFile?: boolean,
			referencedFiles?: readonly TS.FileReference[],
			typeReferences?: readonly TS.FileReference[],
			hasNoDefaultLib?: boolean,
			libReferences?: readonly TS.FileReference[]
		): TS.SourceFile {
			return typescript4Cast.updateSourceFileNode(
				node as never,
				statements as never,
				isDeclarationFile as never,
				referencedFiles as never,
				typeReferences as never,
				hasNoDefaultLib as never,
				libReferences as never
			) as never;
		},
		updateClassExpression,
		createPropertyAccessExpression(expression: TS.Expression, name: string | TS.MemberName): TS.PropertyAccessExpression {
			return typescript4Cast.createPropertyAccess(expression as never, name as never) as never;
		},
		createGetAccessorDeclaration,
		updateGetAccessorDeclaration,
		createReturnStatement(expression?: TS.Expression): TS.ReturnStatement {
			return typescript4Cast.createReturn(expression as never) as never;
		},
		createObjectLiteralExpression(properties?: readonly TS.ObjectLiteralElementLike[], multiLine?: boolean): TS.ObjectLiteralExpression {
			return typescript4Cast.createObjectLiteral(properties as never, multiLine as never) as never;
		},
		createVariableDeclaration(name: string | TS.BindingName, exclamationToken?: TS.ExclamationToken, type?: TS.TypeNode, initializer?: TS.Expression): TS.VariableDeclaration {
			if (typescript4Cast.createVariableDeclaration.length === 4) {
				return typescript4Cast.createVariableDeclaration(name as never, exclamationToken as never, type as never, initializer as never) as never;
			}
			return typescript4Cast.createVariableDeclaration(name as never, type as never, initializer as never) as never;
		},
		updateVariableDeclaration(
			node: TS.VariableDeclaration,
			name: TS.BindingName,
			exclamationToken: TS.ExclamationToken | undefined,
			type: TS.TypeNode | undefined,
			initializer: TS.Expression | undefined
		): TS.VariableDeclaration {
			if (typescript4Cast.updateVariableDeclaration.length === 4) {
				return typescript4Cast.updateVariableDeclaration(node as never, name as never, type as never, initializer as never) as never;
			}

			return typescript4Cast.updateVariableDeclaration(node as never, name as never, exclamationToken as never, type as never, initializer as never) as never;
		},
		createPropertyAccessChain(expression: TS.Expression, questionDotToken: TS.QuestionDotToken | undefined, name: string | TS.MemberName): TS.PropertyAccessChain {
			if ("createPropertyAccessChain" in (typescript as typeof TS)) {
				return typescript4Cast.createPropertyAccessChain(expression as never, questionDotToken as never, name as never) as never;
			}

			const node = typescript4Cast.createPropertyAccess(expression as never, name as never) as unknown as Mutable<TS.PropertyAccessChain>;
			node.questionDotToken = questionDotToken;
			return node;
		},
		updatePropertyAccessChain(
			node: TS.PropertyAccessChain,
			expression: TS.Expression,
			questionDotToken: TS.QuestionDotToken | undefined,
			name: TS.MemberName
		): TS.PropertyAccessChain {
			if ("updatePropertyAccessChain" in (typescript as typeof TS)) {
				return typescript4Cast.updatePropertyAccessChain(node as never, expression as never, questionDotToken as never, name as never) as never;
			}

			const newNode = typescript4Cast.updatePropertyAccess(node as never, expression as never, name as never) as unknown as Mutable<TS.PropertyAccessChain>;
			newNode.questionDotToken = questionDotToken;
			return newNode;
		},
		createImportEqualsDeclaration,
		updateImportEqualsDeclaration,
		createMappedTypeNode(
			readonlyToken: TS.ReadonlyKeyword | TS.PlusToken | TS.MinusToken | undefined,
			typeParameter: TS.TypeParameterDeclaration,
			nameType: TS.TypeNode | undefined,
			questionToken: TS.QuestionToken | TS.PlusToken | TS.MinusToken | undefined,
			type: TS.TypeNode | undefined,
			members?: TS.NodeArray<TS.TypeElement> | undefined
		): TS.MappedTypeNode {
			return (typescript as unknown as typeof import("typescript-3-9-2")).createMappedTypeNode(
				readonlyToken as never,
				typeParameter as never,
				questionToken as never,
				type as never
			) as unknown as TS.MappedTypeNode;
		},
		updateMappedTypeNode(
			node: TS.MappedTypeNode,
			readonlyToken: TS.ReadonlyKeyword | TS.PlusToken | TS.MinusToken | undefined,
			typeParameter: TS.TypeParameterDeclaration,
			nameType: TS.TypeNode | undefined,
			questionToken: TS.QuestionToken | TS.PlusToken | TS.MinusToken | undefined,
			type: TS.TypeNode | undefined,
			members?: TS.NodeArray<TS.TypeElement> | undefined
		): TS.MappedTypeNode {
			return (typescript as unknown as typeof import("typescript-3-9-2")).updateMappedTypeNode(
				node as never,
				readonlyToken as never,
				typeParameter as never,
				questionToken as never,
				type as never
			) as unknown as TS.MappedTypeNode;
		},
		createImportSpecifier(isTypeOnly: boolean, propertyName: TS.Identifier | undefined, name: TS.Identifier): TS.ImportSpecifier {
			return (typescript as unknown as typeof import("typescript-3-9-2")).createImportSpecifier(propertyName as never, name as never) as unknown as TS.ImportSpecifier;
		},

		updateImportSpecifier(node: TS.ImportSpecifier, isTypeOnly: boolean, propertyName: TS.Identifier | undefined, name: TS.Identifier): TS.ImportSpecifier {
			return (typescript as unknown as typeof import("typescript-3-9-2")).updateImportSpecifier(
				node as never,
				propertyName as never,
				name as never
			) as unknown as TS.ImportSpecifier;
		},
		createExportSpecifier(isTypeOnly: boolean, propertyName: string | TS.Identifier | undefined, name: string | TS.Identifier): TS.ExportSpecifier {
			return (typescript as unknown as typeof import("typescript-3-9-2")).createExportSpecifier(propertyName as never, name as never) as unknown as TS.ExportSpecifier;
		},

		updateExportSpecifier(node: TS.ExportSpecifier, isTypeOnly: boolean, propertyName: TS.Identifier | undefined, name: TS.Identifier): TS.ExportSpecifier {
			return (typescript as unknown as typeof import("typescript-3-9-2")).updateExportSpecifier(
				node as never,
				propertyName as never,
				name as never
			) as unknown as TS.ExportSpecifier;
		},
		createExportDeclaration,
		updateConstructorDeclaration,

		/**
		 * Some TypeScript versions require that the value is a string argument
		 */
		createNumericLiteral(value: string | number, numericLiteralFlags?: TS.TokenFlags): TS.NumericLiteral {
			return typescript4Cast.createNumericLiteral(String(value), numericLiteralFlags) as never;
		}
	};
}
