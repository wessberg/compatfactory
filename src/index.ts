/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars */
import * as TS from "typescript";
import {Mutable} from "helpertypes";

export function ensureNodeFactory(factoryLike: TS.NodeFactory | typeof TS): TS.NodeFactory {
	if ("factory" in factoryLike && factoryLike.factory != null) {
		return normalizeNodeFactory(factoryLike.factory);
	} else if (!("updateSourceFileNode" in factoryLike)) {
		return normalizeNodeFactory(factoryLike);
	}

	return createNodeFactory(factoryLike);
}

function normalizeNodeFactory(factory: TS.NodeFactory): TS.NodeFactory {
	const needsModifications = factory.createImportEqualsDeclaration.length === 4 || factory.createMappedTypeNode.length === 4;

	if (needsModifications) {
		return {
			...factory,
			...(factory.createImportEqualsDeclaration.length === 4
				? {
						createImportEqualsDeclaration(
							decorators: readonly TS.Decorator[] | undefined,
							modifiers: readonly TS.Modifier[] | undefined,
							isTypeOnly: boolean,
							name: string | TS.Identifier,
							moduleReference: TS.ModuleReference
						): TS.ImportEqualsDeclaration {
							return (factory as unknown as import("typescript-4-1-2").NodeFactory).createImportEqualsDeclaration(
								decorators as never,
								modifiers as never,
								name as never,
								moduleReference as never
							) as unknown as TS.ImportEqualsDeclaration;
						}
				  }
				: {}),
			...(factory.createMappedTypeNode.length === 4
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
						}
				  }
				: {})
		};
	}
	return factory;
}

function createNodeFactory(typescript: typeof TS): TS.NodeFactory {
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
		return typescript.createToken(token);
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
			return typescript.createConstructorTypeNode(
				typeParametersOrParameters as readonly TS.TypeParameterDeclaration[],
				parametersOrType as readonly TS.ParameterDeclaration[],
				typeOrUndefined as TS.TypeNode
			);
		}

		return typescript.createConstructorTypeNode(
			modifiersOrTypeParameters as readonly TS.TypeParameterDeclaration[],
			typeParametersOrParameters as readonly TS.ParameterDeclaration[],
			parametersOrType as TS.TypeNode
		);
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
			return typescript.updateConstructorTypeNode(
				node,
				typeParametersOrParameters as TS.NodeArray<TS.TypeParameterDeclaration> | undefined,
				parametersOrType as TS.NodeArray<TS.ParameterDeclaration>,
				typeOrUndefined as TS.TypeNode
			);
		}

		return typescript.updateConstructorTypeNode(
			node,
			modifiersOrTypeParameters as TS.NodeArray<TS.TypeParameterDeclaration> | undefined,
			typeParametersOrParameters as TS.NodeArray<TS.ParameterDeclaration>,
			parametersOrType as TS.TypeNode
		);
	}

	function createNamedTupleMember(
		dotDotDotToken: TS.DotDotDotToken | undefined,
		name: TS.Identifier,
		questionToken: TS.QuestionToken | undefined,
		type: TS.TypeNode
	): TS.NamedTupleMember {
		const node = typescript.createNode(typescript.SyntaxKind.NamedTupleMember ?? 193) as Mutable<TS.NamedTupleMember>;
		node.dotDotDotToken = dotDotDotToken;
		node.name = name;
		node.questionToken = questionToken;
		node.type = type;
		(node as {transformFlags?: number}).transformFlags = 1 /* ContainsTypeScript */;
		return node;
	}

	function createJSDocComment(comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink> | undefined, tags?: readonly TS.JSDocTag[] | undefined): TS.JSDoc {
		if ("createJSDocComment" in typescript) {
			return typescript.createJSDocComment(comment, tags);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocComment ?? 312) as Mutable<TS.JSDoc>;
		node.comment = comment;
		node.tags = typescript.createNodeArray(tags);
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
		if ("createJSDocParameterTag" in typescript) {
			return typescript.createJSDocParameterTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocParameterTag ?? 330) as Mutable<TS.JSDocParameterTag>;
		if (tagName != null) node.tagName = tagName;
		node.name = name;
		node.isBracketed = isBracketed;
		node.typeExpression = typeExpression;
		if (isNameFirst != null) node.isNameFirst = isNameFirst;
		node.comment = comment;
		return node;
	}

	function createJSDocPrivateTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocPrivateTag {
		if ("createJSDocPrivateTag" in typescript) {
			return typescript.createJSDocPrivateTag(tagName, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocPrivateTag ?? 324) as Mutable<TS.JSDocPrivateTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocAugmentsTag(
		tagName: TS.Identifier | undefined,
		className: TS.JSDocAugmentsTag["class"],
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocAugmentsTag {
		if ("createJSDocAugmentsTag" in typescript) {
			return typescript.createJSDocAugmentsTag(tagName, className, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocAugmentsTag ?? 318) as Mutable<TS.JSDocAugmentsTag>;
		if (tagName != null) node.tagName = tagName;
		node.class = className;
		node.comment = comment;
		return node;
	}

	function createJSDocDeprecatedTag(tagName: TS.Identifier, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocDeprecatedTag {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocDeprecatedTag ?? 321) as Mutable<TS.JSDocDeprecatedTag>;
		node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocFunctionType(parameters: readonly TS.ParameterDeclaration[], type: TS.TypeNode | undefined): TS.JSDocFunctionType {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocFunctionType ?? 309) as Mutable<TS.JSDocFunctionType>;
		node.parameters = typescript.createNodeArray(parameters);
		node.type = type;
		return node;
	}

	function createJSDocLink(name: TS.EntityName | undefined, text: string): TS.JSDocLink {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocLink ?? 316) as Mutable<TS.JSDocLink>;
		node.name = name;
		node.text = text;
		return node;
	}

	function createJSDocNameReference(name: TS.EntityName): TS.JSDocNameReference {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocNameReference ?? 303) as Mutable<TS.JSDocNameReference>;
		node.name = name;
		return node;
	}

	function createJSDocNamepathType(type: TS.TypeNode): TS.JSDocNamepathType {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocNamepathType ?? 311) as Mutable<TS.JSDocNamepathType>;
		node.type = type;
		return node;
	}

	function createJSDocNonNullableType(type: TS.TypeNode): TS.JSDocNonNullableType {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocNonNullableType ?? 307) as Mutable<TS.JSDocNonNullableType>;
		node.type = type;
		return node;
	}

	function createJSDocNullableType(type: TS.TypeNode): TS.JSDocNullableType {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocNullableType ?? 306) as Mutable<TS.JSDocNullableType>;
		node.type = type;
		return node;
	}

	function createJSDocOptionalType(type: TS.TypeNode): TS.JSDocOptionalType {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocOptionalType ?? 308) as Mutable<TS.JSDocOptionalType>;
		node.type = type;
		return node;
	}

	function createJSDocOverrideTag(tagName: TS.Identifier, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocOverrideTag {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocOverrideTag ?? 327) as Mutable<TS.JSDocOverrideTag>;
		node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocSeeTag(
		tagName: TS.Identifier | undefined,
		nameExpression: TS.JSDocNameReference | undefined,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocSeeTag {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocSeeTag ?? 336) as Mutable<TS.JSDocSeeTag>;
		if (tagName != null) {
			node.tagName = tagName;
		}
		node.name = nameExpression;
		node.comment = comment;
		return node;
	}

	function createJSDocText(text: string): TS.JSDocText {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocText ?? 313) as Mutable<TS.JSDocText>;
		node.text = text;
		return node;
	}

	function createJSDocUnknownTag(tagName: TS.Identifier, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocUnknownTag {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocTag ?? 317) as Mutable<TS.JSDocUnknownTag>;
		node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocUnknownType(): TS.JSDocUnknownType {
		return typescript.createNode(typescript.SyntaxKind.JSDocUnknownType ?? 305) as Mutable<TS.JSDocUnknownType>;
	}

	function createJSDocVariadicType(type: TS.TypeNode): TS.JSDocVariadicType {
		const node = typescript.createNode(typescript.SyntaxKind.JSDocVariadicType ?? 310) as Mutable<TS.JSDocVariadicType>;
		node.type = type;
		return node;
	}

	function createJSDocAllType(): TS.JSDocAllType {
		return typescript.createNode(typescript.SyntaxKind.JSDocAllType ?? 304) as TS.JSDocAllType;
	}

	function createTemplateLiteralType(head: TS.TemplateHead, templateSpans: readonly TS.TemplateLiteralTypeSpan[]): TS.TemplateLiteralTypeNode {
		const node = typescript.createNode(typescript.SyntaxKind.TemplateLiteralType ?? 194) as Mutable<TS.TemplateLiteralTypeNode>;
		node.head = head;
		node.templateSpans = typescript.createNodeArray(templateSpans);
		(node as {transformFlags?: number}).transformFlags = 1 /* ContainsTypeScript */;
		return node;
	}

	function createTemplateLiteralTypeSpan(type: TS.TypeNode, literal: TS.TemplateMiddle | TS.TemplateTail): TS.TemplateLiteralTypeSpan {
		const node = typescript.createNode(typescript.SyntaxKind.TemplateLiteralTypeSpan ?? 195) as Mutable<TS.TemplateLiteralTypeSpan>;
		node.type = type;
		node.literal = literal;
		(node as {transformFlags?: number}).transformFlags = 1 /* ContainsTypeScript */;
		return node;
	}

	function createJSDocAuthorTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocAuthorTag {
		if ("createJSDocAuthorTag" in typescript) {
			return typescript.createJSDocAuthorTag(tagName, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocAuthorTag ?? 320) as Mutable<TS.JSDocAuthorTag>;
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
		if ("createJSDocCallbackTag" in typescript) {
			return typescript.createJSDocCallbackTag(tagName, typeExpression, fullName, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocCallbackTag ?? 328) as Mutable<TS.JSDocCallbackTag>;
		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.fullName = fullName;
		node.comment = comment;
		return node;
	}

	function createJSDocClassTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocClassTag {
		if ("createJSDocClassTag" in typescript) {
			return typescript.createJSDocClassTag(tagName, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocClassTag ?? 322) as Mutable<TS.JSDocClassTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocEnumTag(
		tagName: TS.Identifier | undefined,
		typeExpression: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocEnumTag {
		if ("createJSDocEnumTag" in typescript) {
			return typescript.createJSDocEnumTag(tagName, typeExpression, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocEnumTag ?? 329) as Mutable<TS.JSDocEnumTag>;
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
		if ("createJSDocImplementsTag" in typescript) {
			return typescript.createJSDocImplementsTag(tagName, className, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocImplementsTag ?? 319) as Mutable<TS.JSDocImplementsTag>;
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
		if ("createJSDocPropertyTag" in typescript) {
			return typescript.createJSDocPropertyTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocPropertyTag ?? 337) as Mutable<TS.JSDocPropertyTag>;
		if (tagName != null) node.tagName = tagName;
		node.name = name;
		node.isBracketed = isBracketed;
		node.typeExpression = typeExpression;
		if (isNameFirst != null) node.isNameFirst = isNameFirst;
		node.comment = comment;
		return node;
	}

	function createJSDocProtectedTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocProtectedTag {
		if ("createJSDocProtectedTag" in typescript) {
			return typescript.createJSDocProtectedTag(tagName, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocProtectedTag ?? 325) as Mutable<TS.JSDocProtectedTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}
	function createJSDocPublicTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocPublicTag {
		if ("createJSDocPublicTag" in typescript) {
			return typescript.createJSDocPublicTag(tagName, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocPublicTag ?? 323) as Mutable<TS.JSDocPublicTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocReadonlyTag(tagName: TS.Identifier | undefined, comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>): TS.JSDocReadonlyTag {
		if ("createJSDocReadonlyTag" in typescript) {
			return typescript.createJSDocReadonlyTag(tagName, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocReadonlyTag ?? 326) as Mutable<TS.JSDocReadonlyTag>;
		if (tagName != null) node.tagName = tagName;
		node.comment = comment;
		return node;
	}

	function createJSDocReturnTag(
		tagName: TS.Identifier | undefined,
		typeExpression?: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocReturnTag {
		if ("createJSDocReturnTag" in typescript) {
			return typescript.createJSDocReturnTag(tagName, typeExpression, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocReturnTag ?? 331) as Mutable<TS.JSDocReturnTag>;
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
		if ("createJSDocSignature" in typescript) {
			return typescript.createJSDocSignature(typeParameters, parameters, type);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocSignature ?? 315) as Mutable<TS.JSDocSignature>;

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
		if ("createJSDocTemplateTag" in typescript) {
			return typescript.createJSDocTemplateTag(tagName, constraint, typeParameters, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocTemplateTag ?? 334) as Mutable<TS.JSDocTemplateTag>;

		if (tagName != null) node.tagName = tagName;
		node.constraint = constraint;
		node.typeParameters = typescript.createNodeArray(typeParameters);
		node.comment = comment;
		return node;
	}

	function createJSDocThisTag(
		tagName: TS.Identifier | undefined,
		typeExpression: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocThisTag {
		if ("createJSDocThisTag" in typescript) {
			return typescript.createJSDocThisTag(tagName, typeExpression, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocThisTag ?? 332) as Mutable<TS.JSDocThisTag>;

		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.comment = comment;
		return node;
	}

	function createJSDocTypeExpression(type: TS.TypeNode): TS.JSDocTypeExpression {
		if ("createJSDocTypeExpression" in typescript) {
			return typescript.createJSDocTypeExpression(type);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocTypeExpression ?? 302) as Mutable<TS.JSDocTypeExpression>;

		node.type = type;
		return node;
	}
	function createJSDocTypeLiteral(jsDocPropertyTags?: readonly TS.JSDocPropertyLikeTag[], isArrayType?: boolean): TS.JSDocTypeLiteral {
		if ("createJSDocTypeLiteral" in typescript) {
			return typescript.createJSDocTypeLiteral(jsDocPropertyTags, isArrayType);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocTypeLiteral ?? 314) as Mutable<TS.JSDocTypeLiteral>;

		node.jsDocPropertyTags = jsDocPropertyTags;
		if (isArrayType != null) node.isArrayType = isArrayType;
		return node;
	}

	function createJSDocTypeTag(
		tagName: TS.Identifier | undefined,
		typeExpression: TS.JSDocTypeExpression,
		comment?: string | TS.NodeArray<TS.JSDocText | TS.JSDocLink>
	): TS.JSDocTypeTag {
		if ("createJSDocTypeTag" in typescript) {
			return typescript.createJSDocTypeTag(tagName, typeExpression, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocTypeTag ?? 333) as Mutable<TS.JSDocTypeTag>;

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
		if ("createJSDocTypedefTag" in typescript) {
			return typescript.createJSDocTypedefTag(tagName, typeExpression, fullName, comment);
		}

		const node = typescript.createNode(typescript.SyntaxKind.JSDocTypedefTag ?? 335) as Mutable<TS.JSDocTypedefTag>;

		if (tagName != null) node.tagName = tagName;
		node.typeExpression = typeExpression;
		node.fullName = fullName;
		node.comment = comment;
		return node;
	}

	const {updateSourceFileNode, ...common} = typescript;

	return {
		...common,
		createToken,
		createConstructorTypeNode,
		updateConstructorTypeNode,
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
		createTemplateLiteralType,
		createTemplateLiteralTypeSpan,
		createComma(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createComma(left, right) as TS.BinaryExpression;
		},
		createAssignment(left: TS.ObjectLiteralExpression | TS.ArrayLiteralExpression, right: TS.Expression): TS.DestructuringAssignment {
			return typescript.createAssignment(left, right) as TS.DestructuringAssignment;
		},
		createLessThan(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createLessThan(left, right) as TS.BinaryExpression;
		},
		createSourceFile(statements: readonly TS.Statement[], endOfFileToken: TS.EndOfFileToken, flags: TS.NodeFlags): TS.SourceFile {
			const sourceFile = typescript.createSourceFile("", "", 0, undefined, 0) as Mutable<TS.SourceFile>;
			sourceFile.endOfFileToken = endOfFileToken;
			sourceFile.flags |= flags;
			sourceFile.statements = typescript.createNodeArray(statements);
			return sourceFile;
		},
		createClassExpression(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			name: string | TS.Identifier | undefined,
			typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
			heritageClauses: readonly TS.HeritageClause[] | undefined,
			members: readonly TS.ClassElement[]
		): TS.ClassExpression {
			return typescript.createClassExpression(modifiers, name, typeParameters, heritageClauses, members);
		},
		createExpressionWithTypeArguments(expression: TS.Expression, typeArguments: readonly TS.TypeNode[] | undefined): TS.ExpressionWithTypeArguments {
			return typescript.createExpressionWithTypeArguments(typeArguments, expression);
		},
		updateExpressionWithTypeArguments(
			node: TS.ExpressionWithTypeArguments,
			expression: TS.Expression,
			typeArguments: readonly TS.TypeNode[] | undefined
		): TS.ExpressionWithTypeArguments {
			return typescript.updateExpressionWithTypeArguments(node, typeArguments, expression);
		},
		updateImportClause(node: TS.ImportClause, isTypeOnly: boolean, name: TS.Identifier | undefined, namedBindings: TS.NamedImportBindings | undefined): TS.ImportClause {
			return typescript.updateImportClause(node, name, namedBindings, isTypeOnly);
		},
		updateExportDeclaration(
			node: TS.ExportDeclaration,
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			isTypeOnly: boolean,
			exportClause: TS.NamedExportBindings | undefined,
			moduleSpecifier: TS.Expression | undefined
		): TS.ExportDeclaration {
			return typescript.updateExportDeclaration(node, decorators, modifiers, exportClause, moduleSpecifier, isTypeOnly);
		},
		createTypePredicateNode(
			assertsModifier: TS.AssertsKeyword | undefined,
			parameterName: TS.Identifier | TS.ThisTypeNode | string,
			type: TS.TypeNode | undefined
		): TS.TypePredicateNode {
			return typescript.createTypePredicateNode(parameterName, type!);
		},
		updateTypePredicateNode(
			node: TS.TypePredicateNode,
			assertsModifier: TS.AssertsKeyword | undefined,
			parameterName: TS.Identifier | TS.ThisTypeNode,
			type: TS.TypeNode | undefined
		): TS.TypePredicateNode {
			return typescript.updateTypePredicateNode(node, parameterName, type!);
		},
		createMethodSignature(
			modifiers: readonly TS.Modifier[] | undefined,
			name: string | TS.PropertyName,
			questionToken: TS.QuestionToken | undefined,
			typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
			parameters: readonly TS.ParameterDeclaration[],
			type: TS.TypeNode | undefined
		): TS.MethodSignature {
			const methodSignature = typescript.createMethodSignature(typeParameters, parameters, type, name, questionToken) as Mutable<TS.MethodSignature>;

			// Also set the modifiers
			// Workaround for: https://github.com/microsoft/TypeScript/issues/35959
			if (modifiers != null) {
				methodSignature.modifiers = typescript.createNodeArray(modifiers);
			}
			return methodSignature;

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
			const methodSignature = typescript.updateMethodSignature(node, typeParameters, parameters, type, name, questionToken) as Mutable<TS.MethodSignature>;

			// Also set the modifiers
			// Workaround for: https://github.com/microsoft/TypeScript/issues/35959
			if (modifiers !== methodSignature.modifiers) {
				methodSignature.modifiers = modifiers == null ? modifiers : typescript.createNodeArray(modifiers);
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
			return typescript.updatePropertySignature(node, modifiers, name, questionToken, type, undefined);
		},
		createAwaitExpression(expression: TS.Expression): TS.AwaitExpression {
			return typescript.createAwait(expression);
		},
		createBinaryExpression(left: TS.Expression, operator: TS.BinaryOperator | TS.BinaryOperatorToken, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, operator, right);
		},
		createBitwiseAnd(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.AmpersandToken, right);
		},
		createBitwiseNot(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript.createPrefix(typescript.SyntaxKind.TildeToken, operand);
		},
		createBitwiseOr(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.BarToken, right);
		},
		createBitwiseXor(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.CaretToken, right);
		},
		createBreakStatement(label?: string | TS.Identifier): TS.BreakStatement {
			return typescript.createBreak(label);
		},
		createCommaListExpression(elements: readonly TS.Expression[]): TS.CommaListExpression {
			return typescript.createCommaList(elements);
		},
		createConditionalExpression(
			condition: TS.Expression,
			questionToken: TS.QuestionToken | undefined,
			whenTrue: TS.Expression,
			colonToken: TS.ColonToken | undefined,
			whenFalse: TS.Expression
		): TS.ConditionalExpression {
			if (questionToken == null || colonToken == null) {
				return typescript.createConditional(condition, whenTrue, whenFalse);
			}
			return typescript.createConditional(condition, questionToken, whenTrue, colonToken, whenFalse);
		},
		createConstructorDeclaration(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			parameters: readonly TS.ParameterDeclaration[],
			body: TS.Block | undefined
		): TS.ConstructorDeclaration {
			return typescript.createConstructor(decorators, modifiers, parameters, body);
		},
		createContinueStatement(label?: string | TS.Identifier): TS.ContinueStatement {
			return typescript.createContinue(label);
		},
		createDeleteExpression(expression: TS.Expression): TS.DeleteExpression {
			return typescript.createDelete(expression);
		},
		createDivide(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.SlashToken, right);
		},
		createDoStatement(statement: TS.Statement, expression: TS.Expression): TS.DoStatement {
			return typescript.createDo(statement, expression);
		},
		createElementAccessExpression(expression: TS.Expression, index: number | TS.Expression): TS.ElementAccessExpression {
			return typescript.createElementAccess(expression, index);
		},
		createEquality(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.EqualsEqualsToken, right);
		},
		createExponent(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.AsteriskAsteriskToken, right);
		},
		createForInStatement(initializer: TS.ForInitializer, expression: TS.Expression, statement: TS.Statement): TS.ForInStatement {
			return typescript.createForIn(initializer, expression, statement);
		},
		createForOfStatement(awaitModifier: TS.AwaitKeyword | undefined, initializer: TS.ForInitializer, expression: TS.Expression, statement: TS.Statement): TS.ForOfStatement {
			return typescript.createForOf(awaitModifier, initializer, expression, statement);
		},
		createForStatement(
			initializer: TS.ForInitializer | undefined,
			condition: TS.Expression | undefined,
			incrementor: TS.Expression | undefined,
			statement: TS.Statement
		): TS.ForStatement {
			return typescript.createFor(initializer, condition, incrementor, statement);
		},
		createGreaterThan(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.GreaterThanToken, right);
		},
		createGreaterThanEquals(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.GreaterThanEqualsToken, right);
		},
		createIfStatement(expression: TS.Expression, thenStatement: TS.Statement, elseStatement?: TS.Statement): TS.IfStatement {
			return typescript.createIf(expression, thenStatement, elseStatement);
		},
		createInequality(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.ExclamationEqualsToken, right);
		},
		createLabeledStatement(label: string | TS.Identifier, statement: TS.Statement): TS.LabeledStatement {
			return typescript.createLabel(label, statement);
		},
		createLeftShift(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.LessThanLessThanToken, right);
		},
		createLessThanEquals(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.LessThanEqualsToken, right);
		},
		createMethodDeclaration(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			asteriskToken: TS.AsteriskToken | undefined,
			name: string | TS.PropertyName,
			questionToken: TS.QuestionToken | undefined,
			typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
			parameters: readonly TS.ParameterDeclaration[],
			type: TS.TypeNode | undefined,
			body: TS.Block | undefined
		): TS.MethodDeclaration {
			return typescript.createMethod(decorators, modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body);
		},
		createModulo(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.PercentToken, right);
		},
		createMultiply(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.AsteriskToken, right);
		},
		createNamedTupleMember,
		createNewExpression(expression: TS.Expression, typeArguments: readonly TS.TypeNode[] | undefined, argumentsArray: readonly TS.Expression[] | undefined): TS.NewExpression {
			return typescript.createNew(expression, typeArguments, argumentsArray);
		},
		createParameterDeclaration(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			dotDotDotToken: TS.DotDotDotToken | undefined,
			name: string | TS.BindingName,
			questionToken?: TS.QuestionToken,
			type?: TS.TypeNode,
			initializer?: TS.Expression
		): TS.ParameterDeclaration {
			return typescript.createParameter(decorators, modifiers, dotDotDotToken, name, questionToken, type, initializer);
		},
		createParenthesizedExpression(expression: TS.Expression): TS.ParenthesizedExpression {
			return typescript.createParen(expression);
		},
		createPostfixDecrement(operand: TS.Expression): TS.PostfixUnaryExpression {
			return typescript.createPostfix(operand, typescript.SyntaxKind.MinusMinusToken);
		},
		createPostfixUnaryExpression(operand: TS.Expression, operator: TS.PostfixUnaryOperator): TS.PostfixUnaryExpression {
			return typescript.createPostfix(operand, operator);
		},
		createPrefixDecrement(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript.createPrefix(typescript.SyntaxKind.MinusMinusToken, operand);
		},
		createPrefixIncrement(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript.createPrefix(typescript.SyntaxKind.PlusPlusToken, operand);
		},
		createPrefixMinus(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript.createPrefix(typescript.SyntaxKind.MinusToken, operand);
		},
		createPrefixPlus(operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript.createPrefix(typescript.SyntaxKind.PlusToken, operand);
		},
		createPrefixUnaryExpression(operator: TS.PrefixUnaryOperator, operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript.createPrefix(operator, operand);
		},
		createPropertyDeclaration(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			name: string | TS.PropertyName,
			questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
			type: TS.TypeNode | undefined,
			initializer: TS.Expression | undefined
		): TS.PropertyDeclaration {
			return typescript.createProperty(decorators, modifiers, name, questionOrExclamationToken, type, initializer);
		},
		createRightShift(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.GreaterThanGreaterThanToken, right);
		},
		createSetAccessorDeclaration(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			name: string | TS.PropertyName,
			parameters: readonly TS.ParameterDeclaration[],
			body: TS.Block | undefined
		): TS.SetAccessorDeclaration {
			return typescript.createSetAccessor(decorators, modifiers, name, parameters, body);
		},
		createSpreadElement(expression: TS.Expression): TS.SpreadElement {
			return typescript.createSpread(expression);
		},
		createSwitchStatement(expression: TS.Expression, caseBlock: TS.CaseBlock): TS.SwitchStatement {
			return typescript.createSwitch(expression, caseBlock);
		},
		createTaggedTemplateExpression(tag: TS.Expression, typeArguments: readonly TS.TypeNode[] | undefined, template: TS.TemplateLiteral): TS.TaggedTemplateExpression {
			return typescript.createTaggedTemplate(tag, typeArguments, template);
		},
		createThrowStatement(expression: TS.Expression): TS.ThrowStatement {
			return typescript.createThrow(expression);
		},
		createTryStatement(tryBlock: TS.Block, catchClause: TS.CatchClause | undefined, finallyBlock: TS.Block | undefined): TS.TryStatement {
			return typescript.createTry(tryBlock, catchClause, finallyBlock);
		},
		createTypeOfExpression(expression: TS.Expression): TS.TypeOfExpression {
			return typescript.createTypeOf(expression);
		},
		createUnsignedRightShift(left: TS.Expression, right: TS.Expression): TS.BinaryExpression {
			return typescript.createBinary(left, typescript.SyntaxKind.GreaterThanGreaterThanGreaterThanToken, right);
		},
		createVoidExpression(expression: TS.Expression): TS.VoidExpression {
			return typescript.createVoid(expression);
		},
		createWhileStatement(expression: TS.Expression, statement: TS.Statement): TS.WhileStatement {
			return typescript.createWhile(expression, statement);
		},
		createWithStatement(expression: TS.Expression, statement: TS.Statement): TS.WithStatement {
			return typescript.createWith(expression, statement);
		},
		createYieldExpression(asteriskToken: TS.AsteriskToken | undefined, expression: TS.Expression | undefined): TS.YieldExpression {
			return typescript.createYield(asteriskToken, expression!);
		},
		restoreOuterExpressions(outerExpression: TS.Expression | undefined, innerExpression: TS.Expression, kinds?: TS.OuterExpressionKinds): TS.Expression {
			return innerExpression;
		},
		updateAwaitExpression(node: TS.AwaitExpression, expression: TS.Expression): TS.AwaitExpression {
			return typescript.updateAwait(node, expression);
		},
		updateBinaryExpression(node: TS.BinaryExpression, left: TS.Expression, operator: TS.BinaryOperator | TS.BinaryOperatorToken, right: TS.Expression): TS.BinaryExpression {
			return typescript.updateBinary(node, left, right, operator);
		},
		updateBreakStatement(node: TS.BreakStatement, label: TS.Identifier | undefined): TS.BreakStatement {
			return typescript.updateBreak(node, label);
		},
		updateCommaListExpression(node: TS.CommaListExpression, elements: readonly TS.Expression[]): TS.CommaListExpression {
			return typescript.updateCommaList(node, elements);
		},
		updateConditionalExpression(
			node: TS.ConditionalExpression,
			condition: TS.Expression,
			questionToken: TS.QuestionToken,
			whenTrue: TS.Expression,
			colonToken: TS.ColonToken,
			whenFalse: TS.Expression
		): TS.ConditionalExpression {
			return typescript.updateConditional(node, condition, questionToken, whenTrue, colonToken, whenFalse);
		},
		updateContinueStatement(node: TS.ContinueStatement, label: TS.Identifier | undefined): TS.ContinueStatement {
			return typescript.updateContinue(node, label);
		},
		updateDeleteExpression(node: TS.DeleteExpression, expression: TS.Expression): TS.DeleteExpression {
			return typescript.updateDelete(node, expression);
		},
		updateDoStatement(node: TS.DoStatement, statement: TS.Statement, expression: TS.Expression): TS.DoStatement {
			return typescript.updateDo(node, statement, expression);
		},
		updateElementAccessExpression(node: TS.ElementAccessExpression, expression: TS.Expression, argumentExpression: TS.Expression): TS.ElementAccessExpression {
			return typescript.updateElementAccess(node, expression, argumentExpression);
		},
		updateForInStatement(node: TS.ForInStatement, initializer: TS.ForInitializer, expression: TS.Expression, statement: TS.Statement): TS.ForInStatement {
			return typescript.updateForIn(node, initializer, expression, statement);
		},
		updateForOfStatement(
			node: TS.ForOfStatement,
			awaitModifier: TS.AwaitKeyword | undefined,
			initializer: TS.ForInitializer,
			expression: TS.Expression,
			statement: TS.Statement
		): TS.ForOfStatement {
			return typescript.updateForOf(node, awaitModifier, initializer, expression, statement);
		},
		updateForStatement(
			node: TS.ForStatement,
			initializer: TS.ForInitializer | undefined,
			condition: TS.Expression | undefined,
			incrementor: TS.Expression | undefined,
			statement: TS.Statement
		): TS.ForStatement {
			return typescript.updateFor(node, initializer, condition, incrementor, statement);
		},
		updateIfStatement(node: TS.IfStatement, expression: TS.Expression, thenStatement: TS.Statement, elseStatement: TS.Statement | undefined): TS.IfStatement {
			return typescript.updateIf(node, expression, thenStatement, elseStatement);
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
		updateLabeledStatement(node: TS.LabeledStatement, label: TS.Identifier, statement: TS.Statement): TS.LabeledStatement {
			return typescript.updateLabel(node, label, statement);
		},
		updateMethodDeclaration(
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
		): TS.MethodDeclaration {
			return typescript.updateMethod(node, decorators, modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body);
		},
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
			return typescript.updateNew(node, expression, typeArguments, argumentsArray);
		},
		updateObjectLiteralExpression(node: TS.ObjectLiteralExpression, properties: readonly TS.ObjectLiteralElementLike[]): TS.ObjectLiteralExpression {
			return typescript.updateObjectLiteral(node, properties);
		},
		updateParameterDeclaration(
			node: TS.ParameterDeclaration,
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			dotDotDotToken: TS.DotDotDotToken | undefined,
			name: string | TS.BindingName,
			questionToken: TS.QuestionToken | undefined,
			type: TS.TypeNode | undefined,
			initializer: TS.Expression | undefined
		): TS.ParameterDeclaration {
			return typescript.updateParameter(node, decorators, modifiers, dotDotDotToken, name, questionToken, type, initializer);
		},
		updateParenthesizedExpression(node: TS.ParenthesizedExpression, expression: TS.Expression): TS.ParenthesizedExpression {
			return typescript.updateParen(node, expression);
		},
		updatePostfixUnaryExpression(node: TS.PostfixUnaryExpression, operand: TS.Expression): TS.PostfixUnaryExpression {
			return typescript.updatePostfix(node, operand);
		},
		updatePrefixUnaryExpression(node: TS.PrefixUnaryExpression, operand: TS.Expression): TS.PrefixUnaryExpression {
			return typescript.updatePrefix(node, operand);
		},
		updatePropertyAccessExpression(node: TS.PropertyAccessExpression, expression: TS.Expression, name: TS.MemberName): TS.PropertyAccessExpression {
			return typescript.updatePropertyAccess(node, expression, name);
		},
		updatePropertyDeclaration(
			node: TS.PropertyDeclaration,
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			name: string | TS.PropertyName,
			questionOrExclamationToken: TS.QuestionToken | TS.ExclamationToken | undefined,
			type: TS.TypeNode | undefined,
			initializer: TS.Expression | undefined
		): TS.PropertyDeclaration {
			return typescript.updateProperty(node, decorators, modifiers, name, questionOrExclamationToken, type, initializer);
		},
		updateReturnStatement(node: TS.ReturnStatement, expression: TS.Expression | undefined): TS.ReturnStatement {
			return typescript.updateReturn(node, expression);
		},
		updateSetAccessorDeclaration(
			node: TS.SetAccessorDeclaration,
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			name: TS.PropertyName,
			parameters: readonly TS.ParameterDeclaration[],
			body: TS.Block | undefined
		): TS.SetAccessorDeclaration {
			return typescript.updateSetAccessor(node, decorators, modifiers, name, parameters, body);
		},
		updateSpreadElement(node: TS.SpreadElement, expression: TS.Expression): TS.SpreadElement {
			return typescript.updateSpread(node, expression);
		},
		updateSwitchStatement(node: TS.SwitchStatement, expression: TS.Expression, caseBlock: TS.CaseBlock): TS.SwitchStatement {
			return typescript.updateSwitch(node, expression, caseBlock);
		},
		updateTaggedTemplateExpression(
			node: TS.TaggedTemplateExpression,
			tag: TS.Expression,
			typeArguments: readonly TS.TypeNode[] | undefined,
			template: TS.TemplateLiteral
		): TS.TaggedTemplateExpression {
			return typescript.updateTaggedTemplate(node, tag, typeArguments, template);
		},
		updateTemplateLiteralType(node: TS.TemplateLiteralTypeNode, head: TS.TemplateHead, templateSpans: readonly TS.TemplateLiteralTypeSpan[]): TS.TemplateLiteralTypeNode {
			return head === node.head && templateSpans === node.templateSpans ? node : typescript.setTextRange(createTemplateLiteralType(head, templateSpans), node);
		},
		updateTemplateLiteralTypeSpan(node: TS.TemplateLiteralTypeSpan, type: TS.TypeNode, literal: TS.TemplateMiddle | TS.TemplateTail): TS.TemplateLiteralTypeSpan {
			return type === node.type && literal === node.literal ? node : typescript.setTextRange(createTemplateLiteralTypeSpan(type, literal), node);
		},
		updateThrowStatement(node: TS.ThrowStatement, expression: TS.Expression): TS.ThrowStatement {
			return typescript.updateThrow(node, expression);
		},
		updateTryStatement(node: TS.TryStatement, tryBlock: TS.Block, catchClause: TS.CatchClause | undefined, finallyBlock: TS.Block | undefined): TS.TryStatement {
			return typescript.updateTry(node, tryBlock, catchClause, finallyBlock);
		},
		updateTypeOfExpression(node: TS.TypeOfExpression, expression: TS.Expression): TS.TypeOfExpression {
			return typescript.updateTypeOf(node, expression);
		},
		updateVoidExpression(node: TS.VoidExpression, expression: TS.Expression): TS.VoidExpression {
			return typescript.updateVoid(node, expression);
		},
		updateWhileStatement(node: TS.WhileStatement, expression: TS.Expression, statement: TS.Statement): TS.WhileStatement {
			return typescript.updateWhile(node, expression, statement);
		},
		updateWithStatement(node: TS.WithStatement, expression: TS.Expression, statement: TS.Statement): TS.WithStatement {
			return typescript.updateWith(node, expression, statement);
		},
		updateYieldExpression(node: TS.YieldExpression, asteriskToken: TS.AsteriskToken | undefined, expression: TS.Expression | undefined): TS.YieldExpression {
			return typescript.updateYield(node, asteriskToken, expression);
		},
		createImportClause(isTypeOnly: boolean, name: TS.Identifier | undefined, namedBindings: TS.NamedImportBindings | undefined): TS.ImportClause {
			return typescript.createImportClause(name, namedBindings, isTypeOnly);
		},
		createCallExpression(expression: TS.Expression, typeArguments: readonly TS.TypeNode[] | undefined, argumentsArray: readonly TS.Expression[] | undefined): TS.CallExpression {
			return typescript.createCall(expression, typeArguments, argumentsArray);
		},
		updateCallExpression(
			node: TS.CallExpression,
			expression: TS.Expression,
			typeArguments: readonly TS.TypeNode[] | undefined,
			argumentsArray: readonly TS.Expression[]
		): TS.CallExpression {
			return typescript.updateCall(node, expression, typeArguments, argumentsArray);
		},
		createArrayLiteralExpression(elements?: readonly TS.Expression[], multiLine?: boolean): TS.ArrayLiteralExpression {
			return typescript.createArrayLiteral(elements, multiLine);
		},
		updateArrayLiteralExpression(node: TS.ArrayLiteralExpression, elements: readonly TS.Expression[]): TS.ArrayLiteralExpression {
			return typescript.updateArrayLiteral(node, elements);
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
			return typescript.updateSourceFileNode(node, statements, isDeclarationFile, referencedFiles, typeReferences, hasNoDefaultLib, libReferences);
		},
		updateClassExpression(
			node: TS.ClassExpression,
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			name: TS.Identifier | undefined,
			typeParameters: readonly TS.TypeParameterDeclaration[] | undefined,
			heritageClauses: readonly TS.HeritageClause[] | undefined,
			members: readonly TS.ClassElement[]
		): TS.ClassExpression {
			return typescript.updateClassExpression(node, modifiers, name, typeParameters, heritageClauses, members);
		},
		createPropertyAccessExpression(expression: TS.Expression, name: string | TS.MemberName): TS.PropertyAccessExpression {
			return typescript.createPropertyAccess(expression, name);
		},
		createGetAccessorDeclaration(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			name: string | TS.PropertyName,
			parameters: readonly TS.ParameterDeclaration[],
			type: TS.TypeNode | undefined,
			body: TS.Block | undefined
		): TS.GetAccessorDeclaration {
			return typescript.createGetAccessor(decorators, modifiers, name, parameters, type, body);
		},
		updateGetAccessorDeclaration(
			node: TS.GetAccessorDeclaration,
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			name: TS.PropertyName,
			parameters: readonly TS.ParameterDeclaration[],
			type: TS.TypeNode | undefined,
			body: TS.Block | undefined
		): TS.GetAccessorDeclaration {
			return typescript.updateGetAccessor(node, decorators, modifiers, name, parameters, type, body);
		},
		createReturnStatement(expression?: TS.Expression): TS.ReturnStatement {
			return typescript.createReturn(expression);
		},
		createObjectLiteralExpression(properties?: readonly TS.ObjectLiteralElementLike[], multiLine?: boolean): TS.ObjectLiteralExpression {
			return typescript.createObjectLiteral(properties, multiLine);
		},
		createVariableDeclaration(name: string | TS.BindingName, exclamationToken?: TS.ExclamationToken, type?: TS.TypeNode, initializer?: TS.Expression): TS.VariableDeclaration {
			if (typescript.createVariableDeclaration.length === 4) {
				return typescript.createVariableDeclaration(name, exclamationToken, type, initializer);
			}
			return typescript.createVariableDeclaration(name, type, initializer);
		},
		updateVariableDeclaration(
			node: TS.VariableDeclaration,
			name: TS.BindingName,
			exclamationToken: TS.ExclamationToken | undefined,
			type: TS.TypeNode | undefined,
			initializer: TS.Expression | undefined
		): TS.VariableDeclaration {
			if (typescript.updateVariableDeclaration.length === 4) {
				return typescript.updateVariableDeclaration(node, name, type, initializer);
			}

			return typescript.updateVariableDeclaration(node, name, exclamationToken, type, initializer);
		},
		createImportEqualsDeclaration(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			isTypeOnly: boolean,
			name: string | TS.Identifier,
			moduleReference: TS.ModuleReference
		): TS.ImportEqualsDeclaration {
			// For TypeScript < 4.0
			if (typescript.createImportEqualsDeclaration.length === 4) {
				return (typescript as unknown as typeof import("typescript-3-9-2")).createImportEqualsDeclaration(
					decorators as never,
					modifiers as never,
					name as never,
					moduleReference as never
				) as unknown as TS.ImportEqualsDeclaration;
			}

			return typescript.createImportEqualsDeclaration(decorators, modifiers, isTypeOnly, name, moduleReference);
		},
		createMappedTypeNode(
			readonlyToken: TS.ReadonlyKeyword | TS.PlusToken | TS.MinusToken | undefined,
			typeParameter: TS.TypeParameterDeclaration,
			nameType: TS.TypeNode | undefined,
			questionToken: TS.QuestionToken | TS.PlusToken | TS.MinusToken | undefined,
			type: TS.TypeNode | undefined
		): TS.MappedTypeNode {
			if (typescript.createMappedTypeNode.length === 4) {
				return (typescript as unknown as import("typescript-4-0-3").NodeFactory).createMappedTypeNode(
					readonlyToken as never,
					typeParameter as never,
					questionToken as never,
					type as never
				) as unknown as TS.MappedTypeNode;
			}

			return typescript.createMappedTypeNode(readonlyToken, typeParameter, nameType, questionToken, type);
		},
		createExportDeclaration(
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			isTypeOnly: boolean,
			exportClause: TS.NamedExportBindings | undefined,
			moduleSpecifier?: TS.Expression
		): TS.ExportDeclaration {
			return typescript.createExportDeclaration(decorators, modifiers, exportClause, moduleSpecifier, isTypeOnly);
		},
		updateConstructorDeclaration(
			node: TS.ConstructorDeclaration,
			decorators: readonly TS.Decorator[] | undefined,
			modifiers: readonly TS.Modifier[] | undefined,
			parameters: readonly TS.ParameterDeclaration[],
			body: TS.Block | undefined
		): TS.ConstructorDeclaration {
			return typescript.updateConstructor(node, decorators, modifiers, parameters, body);
		}
	};
}
