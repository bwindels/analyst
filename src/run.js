import {UndefinedType, literalType, ObjectType, ClassType, FunctionType} from "./types.js";
import {DefaultExport} from "./module.js";

function addImportToScope(imports, importNode, scope) {
	const module = imports.get(importNode.source.value);
	for (const spec of importNode.specifiers) {
		if (spec.type === "ImportDefaultSpecifier") {
			scope = scope.add(spec.local.name, module.exports.get(DefaultExport));
		} else if (spec.type === "ImportSpecifier") {
			scope = scope.add(spec.local.name, module.exports.get(spec.imported.name));
		}
	}
	return scope;
}

function resolveExpressionType(node, scope) {
	if (node.type === "Literal") {
		return literalType(node);
	} else if (node.type === "Identifier") {
		if (node.name === "undefined") {
			return UndefinedType;
		} else {
			return scope.get(node.name);
		}
	} else if (node.type === "ObjectExpression") {
		return ObjectType.fromNode(node, scope);
	} else if (node.type === "Identifier") {
		return scope.get(node.name);
	} else if (node.type === "MemberExpression") {
		const object = resolveExpressionType(node.object, scope);
		return object.getMemberType(node.property.name);
	} else if (node.type === "CallExpression") {
		const callee = resolveExpressionType(node.callee, scope);
		callee.reconcile(node.arguments.map(n => resolveExpressionType(n, scope)));
		return callee.returnType;
	}
}

function addDeclarationToScope(node, scope, imports) {
	if (node.type === "ImportDeclaration") {
		scope = addImportToScope(imports, node, scope);
	} else if ((node.type === "ExportDefaultDeclaration" || node.type === "ExportNamedDeclaration") && node.declaration) {
		scope = addDeclarationToScope(node.declaration, scope, imports);
	} else if (node.type === "ClassDeclaration") {
		scope = scope.add(node.id.name, new ClassType(node, scope));
	} else if (node.type === "FunctionDeclaration") {
		scope = scope.add(node.id.name, new FunctionType(node, scope));
	} else if (node.type === "VariableDeclaration") {
		for (const variable of node.declarations) {
			if (node.kind === "var") {
				console.warn(`using lexical scoping for var ${variable.id.name} declaration`);
			}
			if (variable.init) {
				const type = resolveExpressionType(variable.init);
				if (type) {
					scope = scope.add(variable.id.name, type);
				}
			}
		}
	}
	return scope;
}

export function runBody(statements, scope, imports) {
	for (const statement of statements) {
		scope = addDeclarationToScope(statement, scope, imports);
		if (statement.type === "IfStatement") {
			console.dir(statement);
		}
	}
	return scope;
}