 - make the exports use the same type values as runBody would put into scope, do we need exports to run first? perhaps it is cleaner, but then we'll need to unify creating the types, and also when creating the root scope, it should read the value of the export declarations from the exports, rather than creating the types again, as it's important they are shared.

 - actually enter into classes and functions (e.g. have a infer/run method on Type?), actually running the code to infer types

 - see how far we get with this, probably not that far
 - ignore dynamic property access
 - provide a way to pass the concrete type of our `platform` to `main` for hydrogen test case