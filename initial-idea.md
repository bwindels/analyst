static analysis on javascript source code

have a main file (with optionally a main function)

1. build an ast of the file
	for all imports, also build ast, recursively
	for all call expressions, determine interface type of arguments, recursively.
		- determine ast node for called method, need to first resolve child member expression
			e.g. if we have arguments `a` and `b`, and we have the expression `a.bar(b.foo)`, we would need to know what type b.foo is before we can determine the interface type of the bar argument. So we need to create a type shared between those two and add declarations to it once we know what a is. This would happen when higher up the call stack we know the concrete type of a. At that point, we need to take into account other usages of b.foo and see if it matches? So we would have
			type A:
				fn foo(arg1: #type0001)
			type B:
				prop foo: #type0001

			usages of either of those types elsewhere could add declarations to #type0001.

			For every argument up from the root, we should keep a track of their type so it can be passed down to all call expressions that can then add declarations to it, or at least fork their declarations off of it.

		- look for member expressions and add those to the abstract type
	for all return statements, determine type of return value.

we also want to guess the type of object properties of the methods we run. E.g. also have to look at side-effects in methods. Basically we need to run the code.

so we have interface types, from usage of arguments
and we have concrete types from literals:
	- class literal
	- function literal
	- boolean literal
	- number literal
	- array literal
	- object literal (to which it is reasonable to add properties dynamically, so again, we need to run the code)


you would have to take lexical scoping into account as const/let can hide the name of arguments

a return type could be either

interface type is abstract and can be compatible with concrete type, e.g. interface type with `substr` method and `length` prop is compatible with concrete string type. interface types can also be compatible with other interface types. Operators (like +) would also need to be modeled here.

runtime modification of the prototype like our "html.js" templating does would not be supported and have manual declarations provided. In class-based ES6 code, this feels like it would be a small minority?

```js
//every declaration creates a new scope, as well as blocks
class LexicalScope {
	constructor(parent, name, type) {
		this._parent = parent;
		this._name = name
		this._type = type;
	}

	add(name, type) {
		return new LexicalScope(this, name, type);
	}

	resolve(name) {
		if (this._name === name) {
			return this._type;
		} else if (this._parent) {
			return this._parent.resolve(name);
		}
		return null;
	}
}
// when parsing a file
let scope = new LexicalScope();

const logItemImport = await file.resolveImport("./LogItem.js");
scope = scope.add("LogItem", logItemImport.namedImport("LogItem"));
// when getting ready to call the function, either resolve the argument expressiosn to types, or create types for the params ...
scope = scope.add("a", new Type());
scope = scope.add("b", new Type());

const b = scope.resolve("b");
const foo = b.getMemberType("foo") || b.addPropertyType("foo", new Type());
const a = scope.resolve("a");
const bar = a.getMemberType("bar") || a.addMethodType("bar", [foo]);
bar.call();
// now bar.returnType should be set?
```