import espree from "espree";
import fs from "fs/promises";
import path from "path";
import {runBody} from "./run.js";
import {Scope} from "./scope.js";

class Module {
	constructor(program, imports, exports) {
		this.program = program;
		this.imports = imports;
		this.exports = exports;
	}

	run() {
		const scope = runBody(this.program.body, new Scope(), this.imports);
		for (const [name, declaration] of scope.entries()) {
			console.log(name, declaration);
		}
		// console.log(file, {scope: Array.from(scope.keys()), exports: Array.from(exports.keys())});
		// should return exports here?
	}
}

const modules = new Map();
export const DefaultExport = "<Default>";

async function resolveImport(parentModuleFile, moduleFile) {
	const file = path.join(path.dirname(parentModuleFile), moduleFile);
	let module = modules.get(file);
	if (!module) {
		module = await parseModule(file);
		modules.set(file, module);
	}
	return module;
}

async function resolveImports(program, parentModuleFile) {
	const imports = new Map();
	for (const node of program.body) {
		if (node.type === "ImportDeclaration") {
			const importPath = node.source.value;
			const module = await resolveImport(parentModuleFile, importPath);
			imports.set(importPath, module);
		} 
	}
	return imports;
}

async function resolveExports(program, parentModuleFile) {
	const exports = new Map();
	for (const node of program.body) {
		if (node.type === "ExportDefaultDeclaration") {
			exports.set(DefaultExport, node);
		} else if (node.type === "ExportNamedDeclaration") {
			if (node.declaration) {
				const {declaration} = node;
				if (declaration.type === "VariableDeclaration") {
				for (const variable of declaration.declarations) {
					exports.set(variable.id.name, variable);
				}
				} else if (declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") {
					exports.set(declaration.id.name, declaration);
				} else {
					console.log("some other declaration in export", declaration);
				}
			} else if (node.specifiers) {
				// reexports
				for (const s of node.specifiers) {
					const module = await resolveImport(parentModuleFile, node.source.value);
					const exportValue = module.exports.get(s.local.name);
					exports.set(s.exported.name, exportValue);
				}
			} else {
				console.dir(node);
			}
		}
	}
	return exports;
}


export async function parseModule(file) {
	const source = await fs.readFile(file, {encoding: "utf8"});
	const program = espree.parse(source, {ecmaVersion: 11, sourceType: "module"});
	const exports = await resolveExports(program, file);
	const imports = await resolveImports(program, file);
	return new Module(program, imports, exports);
}