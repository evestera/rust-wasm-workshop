# Creating this setup from scratch

TODO -- Sorry, I have not had time to finish this part yet.

TLDR: Create a workspace with two crates. Mark one of them as cdylib and add
`wasm-bindgen = "0.2.58"` as a dep. Add a third subfolder, and do `npm init`.
Add a webpack-config.

## Some other options

[The `wasm-pack` template](https://github.com/rustwasm/wasm-pack-template):

`cargo generate --git https://github.com/rustwasm/wasm-pack-template`

[Rust webpack template](https://github.com/rustwasm/rust-webpack-template)
(unfortunately has a few outdated deps at the moment):

`npm init rust-webpack my-app`

[create-wasm-app](https://github.com/rustwasm/create-wasm-app) (for using wasm modules):

`npm init wasm-app`
