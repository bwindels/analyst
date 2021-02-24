export let bar = 1;
Promise.resolve().then(() => bar = 3);