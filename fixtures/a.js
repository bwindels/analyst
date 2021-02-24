import {bar} from "./b.js";
console.log(bar);
Promise.resolve().then(() => {
	Promise.resolve().then(() => {
		console.log(bar);
		bar = 6;
	});
});
