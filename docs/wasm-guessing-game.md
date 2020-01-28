# Implementing the guessing game in WebAssembly

For reference: [The original guessing game tutorial](https://doc.rust-lang.org/book/ch02-00-guessing-game-tutorial.html)

Suggestion: Start with a hard coded number to guess. You should still parse the
input, handle any error, do the comparison and return a description of what
happened.

<details>
<summary>Possible solution (with hard coded number)</summary>

`mycrate_web/src/index.js`
```js
  const {make_guess} = await import("../../mycrate_wasm/pkg");

  const button = document.querySelector("button");
  const input = document.querySelector("input");
  const output = document.querySelector("#output");
  button.onclick = () => output.textContent = make_guess(input.value);
  button.disabled = false;
```

`mycrate_web/src/index.html`
```html
<label>Name: <input type="text" value="0"/></label>
<button type="button" disabled>Make guess</button>
<p id="output"></p>
```

`mycrate_wasm/src/lib.rs`
```rust
use wasm_bindgen::prelude::*;
use std::cmp::Ordering;

#[wasm_bindgen]
pub fn make_guess(guess: String) -> String {
    let guess: u32 = match guess.trim().parse() {
        Ok(num) => num,
        Err(_) => return "Invalid guess!".to_string(),
    };

    return match guess.cmp(&50) {
        Ordering::Less => "Too small!".to_string(),
        Ordering::Greater => "Too big!".to_string(),
        Ordering::Equal => "You win!".to_string()
    }
}
```
</details>

### Getting a random number

The `rand` crate is not the best choice in WebAssembly for just getting a single
random number. Instead, we can call out to JS for `Math.random()`. You have seen
one way to do this, which is `wasm_bindgen`. Another way is to use
[the js-sys crate](https://crates.io/crates/js-sys), which has pre-defined
bindings for JS.

<details>
<summary>Getting a random number (f64) with js-sys</summary>

`mycrate_wasm/src/lib.rs`
```rust
fn foo() {
    js_sys::Math::random()
}
```

`mycrate_wasm/Cargo.toml`
```toml
[dependencies]
js-sys = "0.3.35"
```

</details>

However, that leads us to our next challenge. How do we store our target value?
Our game state?

With `wasm_bindgen` we can create structs which can be returned to JS and stored
there. Public methods declared on the structs are also accessible from JS.
If you are not familiar with structs yet, you may want to have a look at
[The Rust book chapter on structs](https://doc.rust-lang.org/book/ch05-00-structs.html)

<details>
<summary>Possible solution (complete)</summary>

`mycrate_web/src/index.js`
```js
  const {GuessingGame} = await import("../../mycrate_wasm/pkg");

  let game = GuessingGame.new();

  const button = document.querySelector("button");
  const input = document.querySelector("input");
  const output = document.querySelector("#output");
  button.onclick = () => output.textContent = game.make_guess(input.value);
  button.disabled = false;
```

`mycrate_web/src/index.html`
```html
<label>Name: <input type="text" value="0"/></label>
<button type="button" disabled>Make guess</button>
<p id="output"></p>
```

`mycrate_wasm/src/lib.rs`
```rust
use wasm_bindgen::prelude::*;
use std::cmp::Ordering;

#[wasm_bindgen]
pub struct GuessingGame {
    secret_number: u32
}

#[wasm_bindgen]
impl GuessingGame {
    pub fn new() -> Self {
        GuessingGame {
            secret_number: (js_sys::Math::random() * 100.0) as u32
        }
    }

    pub fn make_guess(&mut self, guess: String) -> String {
        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => return "Invalid guess!".to_string(),
        };

        return match guess.cmp(&self.secret_number) {
            Ordering::Less => "Too small!".to_string(),
            Ordering::Greater => "Too big!".to_string(),
            Ordering::Equal => "You win!".to_string()
        }
    }
}
```

`mycrate_wasm/Cargo.toml`
```toml
[dependencies]
js-sys = "0.3.35"
wasm-bindgen = "0.2.58"
```

### Some notes

This ignores resetting the game without reloading. This could of course be added
as well. If you have a look at the generated `mycrate_wasm/pkg/index.d.ts` you
can see that a `free()` method has been added as well which you should call when
throwing away the old game state.

</details>