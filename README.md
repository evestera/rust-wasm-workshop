# WebAssembly with Rust

Note: The formatting of this document (expandable solutions, internal links,
etc.) has only been verified on GitHub. (Sorry).

## Setup

You need:

- A Rust toolchain. Use [rustup](https://rustup.rs/)
- [nodejs and npm](https://nodejs.org/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/) (though you can let it
be autoinstalled later if you prefer)
- The editor of your choice. I personally like IntelliJ IDEA with
 [IntelliJ Rust](https://intellij-rust.github.io/). For other alternatives see
 [this overview](https://areweideyet.com/). Visual Studio Code is often
 recommended.

## Resources

In the Rust community there tends to be "books" for everything. So before we
get started I'll mention a selection of useful resources depending on which
part you want to tinker with:

- [the rustwasm book](https://rustwasm.github.io/docs/book/):<br/>
 General intro to Rust and WebAssembly and various useful resources.
- [the wasm-pack book](https://rustwasm.github.io/docs/wasm-pack/):<br/>
 For details on how to use the tool that makes the npm package.
- [The Rust Programming Language book](https://doc.rust-lang.org/book) (can
 also be found locally with `rustup doc --book`):<br/>
 For learning the Rust language itself.
- [the wasm-bindgen book](https://rustwasm.github.io/docs/wasm-bindgen/):<br/>
 For the details on the interface between JS and Rust.
 Answers to questions like "How do I call window.fetch from my Rust code?"

## Let's get started

To begin with, just clone this repository. Or if you prefer, [set it up from
scratch](docs/from-scratch.md). Now, try to build and run it:

```
cd mycrate_web
npm install
npm start -- --open
```

A not very exciting web page should pop up in your web browser.
Congratulations! You have built your first WebAssembly-containing web page!

## What am I looking at?

The app is split into three parts:

### `mycrate_core`

`mycrate_core` is just a completely normal Rust library, with no adaptations for
WebAssembly. It could be published to [crates.io](https://crates.io/), used
in a command line application or a web server. Anything you would use Rust
without WebAssembly for. If you already have a Rust library you would like
to use in a web page you might slot it in here.

This module is here primarily to show that you can adapt your code to WebAssembly
while keeping your existing code completely general.

### `mycrate_wasm`

`mycrate_wasm` imports `mycrate_core` and adapts the interface for use with
WebAssembly. For the simple, early examples you probably don't want to wrap and
adapt all that much. So since hot reloading is slightly more stable in this
folder, you may want to just make your edits here and ignore `mycrate_core`
until you have something to wrap/adapt.

When we build, the code in `mycrate_wasm/src` is compiled into a WebAssembly
module, and packaged into an npm-package in `mycrate_wasm/pkg` by `wasm-pack`.

Have a look at the files in `mycrate_wasm/pkg`. In particular, you have:

- The actual `.wasm`-file, `index_bg.wasm`
- A JS wrapper, `index.js`, which is what you will actually import. Right now it
 is pretty simple, but it can get complex pretty fast.
- TypeScript declarations, `index.d.ts`.
- A `package.json` file. The metadata here is taken from
 `mycrate_wasm/Cargo.toml`, so if you actually want to publish the generated NPM
 package, you should edit the `Cargo.toml` accordingly.

### `mycrate_web`

This is our actual web app / page. It imports the npm-package from
`mycrate_wasm/pkg`.

If you look at `mycrate_web/src/index.js` you can see it makes a call to a
function in the WebAssembly module and logs the result to the console. Open the
console for our page in your browser and make sure the result is logged.

The WebAssembly module has to be loaded asynchronously, with
an `import(...)`-expression. Since it is actually a completely different file
format, there is no way to bundle the whole thing together. So in this simple
example, our code is wrapped in an `async function` so that we can just
say `await import(...)`.

## Your first edit

While building and running WebAssembly is cool and all, we should probably start
doing some actual editing.

As a start, I think our WebAssembly code should be slightly better than our
normal Rust code. Exactly 1 better in fact.

Edit the add function in `mycrate_wasm` so that it adds 1 to the result. Make sure
the number in the console is now 1 bigger.

## Hello Bob!

Now, let's make the form on the page do something!

1: Add a function `create_greeting` to `mycrate_wasm` which when called from JS 
creates a greeting. E.g. `create_greeting("Bob") -> "Hello Bob"`. 
(Hint: [format!](https://doc.rust-lang.org/std/macro.format.html))

2: Enable the button once the WebAssembly is ready, and when the button is 
clicked create a greeting with the value of the input field, and show it in an 
`alert(...)`. (Hint: [document.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector),
[onclick](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onclick))

<details>
<summary>Expand to see a possible solution</summary>

In mycrate_wasm/src/lib.rs
```rust
#[wasm_bindgen]
pub fn create_greeting(name: String) -> String {
    format!("Hello {}", name)
}
```
(Not ideal Rust, but let's ignore that for now).

In mycrate_web/src/index.js
```js
  const {create_greeting} = await import("../../mycrate_wasm/pkg");

  const button = document.querySelector("button");
  const input = document.querySelector("input");
  button.onclick = () => alert(create_greeting(input.value));
  button.disabled = false;
```
</details>

## Calling JS from Rust

Now, as great as that was, perhaps we should do the alert call inside the JS as 
well?

We can do this by declaring an external function and letting `wasm_bindgen` bind
it for us.

```rust
#[wasm_bindgen]
extern {
    fn alert(msg: String);
}
```

<details>
<summary>A note for those who already know Rust</summary>

`alert` can also be declared to take a string slice, like this:

```rust
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}
```
</details>

<details>
<summary>Expand to see a possible solution</summary>

```rust
// ...
#[wasm_bindgen]
extern {
    fn alert(msg: String);
}

#[wasm_bindgen]
pub fn greet(name: String) {
    alert(create_greeting(name))
}
```

```js
  const {greet} = await import("../../mycrate_wasm/pkg");
  // ...
  button.onclick = () => greet(input.value));
```
</details>

Note. Jumping between JS and WebAssembly is actually pretty expensive,
relatively speaking, so it is not something you want to do in a
performance-critical part of your code.

## Now what?

Where to go from here depends a lot on what you know already, and what you
want to do.

### I don't know any Rust

Unfortunately, writing WebAssembly with Rust adds a layer of complexity (albeit
small) on top of writing plain Rust. So to begin with, I would suggest trying at
least the [guessing game tutorial](https://doc.rust-lang.org/book/ch02-00-guessing-game-tutorial.html) in the Rust book.

### I already know a little Rust

Maybe you should try to [implement the guessing game in WebAssembly](docs/wasm-guessing-game.md)?

If you want to follow a longer guide the rustwasm
[Game of Life tutorial](https://rustwasm.github.io/docs/book/game-of-life/introduction.html)
covers a lot of ground, including testing and debugging.

### I already have my own Rust code that I want to use in a JS app, publish as a library to NPM or create an interface for

As mentioned earlier, `mycrate_core` could be replaced by any Rust crate,
provided it does not rely on any non-Rust code or OS APIs.

However, if your crate does depend on something that is not compatible with
WebAssembly, don't give up yet.
You may still be able to adapt it through the use of feature flags /
conditional compilation.

This particular repository is stripped down a bit to make it easy to understand
and easy to expand. So if you want to build a real, production-ready project
there are [some adaptions you may want to make](docs/prod-adaptions.md).

For some examples I can answers questions about I have my own two WebAssembly
projects: [json_typegen](https://github.com/evestera/json_typegen) and
[svg-halftone](https://github.com/evestera/svg-halftone).

### I want to create a web app entirely in Rust

You may want to have a look at [Yew](https://yew.rs/docs/), a framework similar
to React and Elm which can be used to write applications entirely in Rust.

### Hmm, I'm still not sure...

The aforementioned [wasm-bindgen book](https://rustwasm.github.io/docs/wasm-bindgen/)
has a lot of interesting examples to draw inspiration from.

How about [drawing directly to a canvas, from Rust](https://rustwasm.github.io/wasm-bindgen/examples/paint.html)?
Or even [loading a WebAssembly module from WebAssembly](https://rustwasm.github.io/docs/wasm-bindgen/examples/wasm-in-wasm.html)?

