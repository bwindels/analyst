import espree from "espree";
import fs from "fs/promises";
import path from "path";
//import {runBody} from "./run.js";
import {Scope} from "./scope.js";


// see https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
class Module {
	constructor(program, importedModules, file) {
		this.program = program;
		this.importedModules = importedModules;
		this.exports = null;
		this.imports = null;
		this.file = file;
	}

	link() {
		if (this.exports !== null) {
			return;
		}
		this.exports = resolveExports(this.program, this.importedModules);
		for (const module of this.importedModules.values()) {
			module.link();
		}
		// now we can use module.exports
		this.imports = resolveImports(this.program, this.importedModules);
		console.log(`${this.file} has exports ${JSON.stringify(Array.from(this.exports.keys()))} and imports ${JSON.stringify(Array.from(this.imports.keys()))}`);
	}

	run() {
		// now while running, if we encounter an export declaration, resolve
		// const scope = runBody(this.program.body, new Scope(), this.imports);
		// for (const [name, declaration] of scope.entries()) {
		// 	console.log(name, declaration);
		// }
		// console.log(file, {scope: Array.from(scope.keys()), exports: Array.from(exports.keys())});
		// should return exports here?
	}
}

export const DefaultExport = "<Default>";

function resolveImports(program, importedModules) {
	const imports = new Map();
	for (const node of program.body) {
		if (node.type === "ImportDeclaration") {
			const module = importedModules.get(node.source.value);
			for (const specifier of node.specifiers) {
				if (specifier.type === "ImportSpecifier") {
					imports.set(specifier.local.name, module.exports.get(specifier.imported.name));
				} else if (specifier.type === "ImportDefaultSpecifier") {
					imports.set(specifier.local.name, module.exports.get(DefaultExport));
				}
			}
		} else if (node.type === "ExportNamedDeclaration" && node.source) {
			const module = importedModules.get(node.source.value);
			for (const specifier of node.specifiers) {
				if (specifier.type === "ExportSpecifier") {
					imports.set(specifier.exported.name, module.exports.get(specifier.local.name));
				}
			}
		}
	}
	return imports;
}

function resolveExports(program, importedModules) {
	const exports = new Map();
	for (const node of program.body) {
		if (node.type === "ExportDefaultDeclaration") {
			exports.set(DefaultExport, new Export(node));
		} else if (node.type === "ExportNamedDeclaration") {
			if (node.declaration) {
				const {declaration} = node;
				if (declaration.type === "VariableDeclaration") {
				for (const variable of declaration.declarations) {
					exports.set(variable.id.name, new Export());
				}
				} else if (declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") {
					exports.set(declaration.id.name, new Export());
				} else {
					console.log("some other declaration in export", declaration);
				}
			} else if (node.source) {
				for (const s of node.specifiers) {
					const module = importedModules.get(node.source.value);
					exports.set(s.exported.name, new ReExport(s.local.name, module));
				}
			} else {
				console.dir(node);
			}
		}
	}
	return exports;
}

/** as exports are live, we need a container for their deferred initialization */
class Export {
	constructor() {
		this._value = null;
	}

	get value() {
		return this._value;
	}

	resolve(value) {
		this._value = value;
	}
}

class ReExport {
	constructor(name, module) {
		this._name = name;
		this._module = module;
		this._value = null;
	}

	get value() {
		return this._value;
	}

	resolve() {
		this._value = this._module.exports.get(this._name).value;
	}
}

export class ModuleContext {
	constructor() {
		this._modules = new Map();
	}

	async load(file) {
		let module = this._modules.get(file);
		if (module) {
			return module;
		}
		const source = await fs.readFile(file, {encoding: "utf8"});
		const program = espree.parse(source, {ecmaVersion: 11, sourceType: "module"});
		const importedModules = await this._resolveImportedModules(program, file);
		module = new Module(program, importedModules, file);
		this._modules.set(file, module);
		return module;
	}

	async _resolveModule(parentModuleFile, moduleFile) {
		return module;
	}

	async _resolveImportedModules(program, parentModuleFile) {
		const importedModules = new Map();
		for (const node of program.body) {
			if (node.type === "ImportDeclaration" || (node.type === "ExportNamedDeclaration" && node.source)) {
				const importPath = node.source.value;
				const file = path.join(path.dirname(parentModuleFile), importPath);
				const module = await this.load(file);
				importedModules.set(importPath, module);
			}
		}
		return importedModules;
	}
}
