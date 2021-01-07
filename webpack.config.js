const path = require('path');
const { WebpackPkgPlugin } = require('webpack-pkg-plugin-v4');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  target: 'node',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'upload.js',
    path: path.resolve(__dirname, 'bin'),
  },
  plugins: [
    new WebpackPkgPlugin({
      // Default params:
      targets: ['host'], // array of targets (--targets option)
      output: '', // Path for dir with executables inside your output folder (--out-path)
    })
  ]
};