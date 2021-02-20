 - make the exports use the same type values as runBody would put into scope, do we need exports to run first? perhaps it is cleaner, but then we'll need to unify creating the types, and also when creating the root scope, it should read the value of the export declarations from the exports, rather than creating the types again, as it's important they are shared.

 - use typescript parser to load .d.ts type definitions for built-in types like https://github.com/microsoft/TypeScript/blob/master/lib/lib.es5.d.ts
 - add OR type
 - create global scope with all globals from .d.ts defs
 - actually enter into classes and functions (e.g. have a infer/run method on Type?), actually running the code to infer types
 - see how far we get with this, probably not that far
 - ignore dynamic property access, although that is what we need for createEnum ... some function should create types every time they are called based on their actual arguments... functions that return object literals with (only) dynamic prop access?
 - for functions, we could immediately check if there is a return statement, but running through the code will give us infer info still.
 - provide a way to pass the concrete type of our `platform` to `main` for hydrogen test case