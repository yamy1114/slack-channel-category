const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/ts/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: [".ts"]
  }
};
