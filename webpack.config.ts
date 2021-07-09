import { join, resolve } from 'path';
import { Configuration } from 'webpack';
import { sync as glob } from 'glob';
import nodeExternals from 'webpack-node-externals';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const common: Configuration = {
  node: false,
  performance: {
    // Hides a warning about large bundles.
    hints: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      util: false,
    },
  },
  stats: {
    assets: false,
    entrypoints: true,
    errors: true,
    hash: false,
    modules: false,
    version: false,
    warnings: true,
  },
};

const config: Configuration = {
  ...common,
  entry: join(__dirname, 'src', 'index.ts'),
  externals: { axios: 'axios' },
  mode: 'production',
  module: {
    rules: [
      {
        test: /@dojo/,
        use: 'umd-compat-loader',
      },
      {
        test: /\.ts/,
        include: join(__dirname, 'src'),
        use: {
          loader: 'ts-loader',
          options: {
            instance: 'src',
            configFile: join(__dirname, 'tsconfig.json'),
          },
        },
      },
      {
        test: /\.ts/,
        include: join(__dirname, 'tests'),
        use: {
          loader: 'ts-loader',
          options: {
            instance: 'tests',
            configFile: join(__dirname, 'tests', 'tsconfig.json'),
          },
        },
      },
    ],
  },
  output: {
    filename: join('_build', 'src', 'index.js'),
    // globalObject must be specified because webpack 4 emits an invalid UMD wrapper
    // See https://github.com/webpack/webpack/issues/6522
    globalObject: 'typeof self !== "undefined" ? self : this',
    libraryTarget: 'umd',
    path: resolve(__dirname),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'package.json', to: join('_build', 'src') },
        { from: 'README.md', to: join('_build', 'src') },
        { from: 'LICENSE', to: join('_build', 'src') },
      ],
    }),
  ],
  target: ['web', 'es5'],
};

const commonTest: Configuration = {
  entry: glob('./tests/unit/**/*.ts'),
  mode: 'development',
  module: {
    rules: [
      {
        test: /@dojo/,
        use: 'umd-compat-loader',
      },
      {
        test: /.ts/,
        include: join(__dirname, 'src'),
        use: {
          loader: '@theintern/istanbul-loader',
        },
      },
      {
        test: /\.ts/,
        use: {
          loader: 'ts-loader',
          options: {
            instance: 'tests',
            configFile: join(__dirname, 'tests', 'tsconfig.json'),
          },
        },
      },
    ],
  },
};

// Browser shims
const browserShimConfig: Configuration = {
  ...common,
  ...commonTest,
  entry: './tests/shim.ts',
  output: {
    filename: join('_build', 'tests', 'browserShim.js'),
    path: resolve(__dirname),
  },
  target: ['web', 'es5'],
};

// Unit tests for the browser
const browserTestConfig: Configuration = {
  ...common,
  ...commonTest,
  entry: glob('./tests/unit/**/*.ts'),
  output: {
    filename: join('_build', 'tests', 'browserUnit.js'),
    path: resolve(__dirname),
  },
  target: ['web', 'es5'],
};

// Unit tests for Node
const nodeTestConfig: Configuration = {
  ...common,
  ...commonTest,
  externals: [nodeExternals()] as Configuration['externals'],
  output: {
    filename: join('_build', 'tests', 'nodeUnit.js'),
    path: resolve(__dirname),
  },
  target: 'node',
};

// Integration tests for Node
const nodeIntegrationTestConfig: Configuration = {
  ...common,
  ...commonTest,
  entry: glob('./tests/integration/**/*.ts'),
  externals: [nodeExternals()] as Configuration['externals'],
  output: {
    filename: join('_build', 'tests', 'nodeIntegration.js'),
    path: resolve(__dirname),
  },
  target: 'node',
};

module.exports = [
  config,
  nodeTestConfig,
  nodeIntegrationTestConfig,
  browserTestConfig,
  browserShimConfig,
];
