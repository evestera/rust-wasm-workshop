import {polyfill} from './polyfill';

(async function() {
  await polyfill();
  const {add} = await import("../../mycrate_wasm/pkg");

  console.log("Calculated with WebAssembly:", add(4, 6));
})();
