import {parseModule} from "./module.js";

async function main(file) {
	const module = await parseModule(file);
	module.run();
}

main(process.argv[2]);