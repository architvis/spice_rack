var path = require('path');

module.exports = {
  entry: {
      spicerack_simulation: "./private/js/spicerack_simulation.js"
  },
  output: {
    path: path.resolve(__dirname, "./public/js/"),
    filename: '[name].js'
  },
  watch: true,
  module: {
    rules: [
      { test: /\.css$/, use: 'css-loader' },
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  }
};