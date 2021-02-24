import {ModuleContext} from "./module.js";

async function main(file) {
	const module = await new ModuleContext().load(file);
	module.link();
}

main(process.argv[2]);