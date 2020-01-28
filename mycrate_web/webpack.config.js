const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: dist,
    filename: "bundle.js"
  },
  devServer: {
    contentBase: dist,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),

    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "../mycrate_wasm"),
      forceMode: 'release'
    }),
  ]
};
