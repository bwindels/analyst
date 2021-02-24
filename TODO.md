 - make the exports use the same type values as runBody would put into scope, do we need exports to run first? perhaps it is cleaner, but then we'll need to unify creating the types, and also when creating the root scope, it should read the value of the export declarations from the exports, rather than creating the types again, as it's important they are shared.

 - use typescript parser to load .d.ts type definitions for built-in types like https://github.com/microsoft/TypeScript/blob/master/lib/lib.es5.d.ts
 - try https://hegel.js.org/docs/install
 - add OR type
 - create global scope with all globals from .d.ts defs
 - actually enter into classes and functions (e.g. have a infer/run method on Type?), actually running the code to infer types
 - see how far we get with this, probably not that far
 - ignore dynamic property access, although that is what we need for createEnum ... some function should create types every time they are called based on their actual arguments... functions that return object literals with (only) dynamic prop access?
 - for functions, we could immediately check if there is a return statement, but running through the code will give us infer info still.
 - provide a way to pass the concrete type of our `platform` to `main` for hydrogen test case


so the idea is to, for a function, when called:
	- take the arguments (which have a type, and may have a literal value)
	- map this to a return type (possibly an OR type with options for all the branches, later we can eliminate branches depending on the arguments and thus) by running the ast
	- the input types are also augmented with the usage in the function

for methods, this becomes like an argument



looks like variables all have their own type and might have a value attached. When combining two values (using a supported operator, like 5 + 7), the new values also has a known value.

how to handle recursion? basically don't do recursion and if there are branches with different types do an OR type

wrt to class declarations or expressions, we would have an instance of the Class type, of which a new expression would return a InstanceType

generics would be mainly implemented internally of the Type class, in that the type it returns from getMember.
```js

class Type {
	// returns "this | type"
	withOption(type) {}

	// if this is "a | b" and type is "a", then "b" is returned
	withoutOption(type) {}
	addMember(name) { return new Type(); }
	getMember(name) {}
	call(thisValue, arguments) {}
	new(arguments) {}
	setIndex(key, value) {}
	getIndex(key) {}
}

class Value or rather Instance {
	get type() {}
	get value() {}
}
```

 1. build root scope for every module by running module body
 	1. create initial scope with all hoisted functions and vars and uninitialized let, const and class definitions
 	2. add let, const and class to scope in order
 	3. any branching is ignored
 2. 



 scope maps identifiers to binding.
 a binding has an optional instance, e.g. it can be uninitialized. a binding can be readonly.
 an instance has a type and optionally a value.

 a binding can be readonly or readwrite

 so `scope.get("foo").instance.type`
 and `scope.get("foo").instance.value?`
 and `scope.get("foo").assign(otherInstance)`