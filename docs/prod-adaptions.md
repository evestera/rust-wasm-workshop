# Adaptions for production-ready code

<https://github.com/rustwasm/console_error_panic_hook>

<https://github.com/rustwasm/wee_alloc>

<https://github.com/iamcodemaker/console_log> or another suitable logger
implementation.

Compiling with Link Time Optimizations (LTO) and optimize of size.
See <https://rustwasm.github.io/book/reference/code-size.html#optimizing-builds-for-code-size>

Have a look at your dependencies. Do they offer any flags to shrink their size?
Are any of them big enough that calling out to JS might be worth it to remove them?

Compile wasm to JS to support IE? See <https://rustwasm.github.io/docs/wasm-bindgen/examples/wasm2js.html>
