
export class ClassType {
	constructor(node, scope) {
		this.node = node;
		this.superClass = node.superClass ? scope.get(node.superClass.name) : null;
	}
}

export class FunctionType {
	constructor(node) {
		this.node = node;
	}
}

export function literalType(node) {
	if (node.value === null) {
		return NullType;
	}
	switch (typeof node.value) {
		case "number": return NumberType;
		case "string": return StringType;
		case "boolean": return BooleanType;
		// TODO: RegExp
	}
}


export const NumberType = {
	getMember() {}
};
export const StringType = {
	getMember(name) {
		switch (name) {
			case "length": return NumberType;
			case "substr": return new FunctionType(StringType, [NumberType, NumberType]);
		}
	}
};
export const NullType = {};
export const UndefinedType = {};

export class ObjectType {
	constructor(properties) {
		this.properties = properties;
	}

	getMember(name) {
		return this.properties.get(name);
	}

	static fromNode(node, scope) {
		const props = new Map();
		for (const p of node.properties) {
			if (p.key.type === "Identifier") {
				props.set(p.key.name, resolveExpressionType(p.value, scope));
			}
		}
		return new ObjectType(props);
	}
}
