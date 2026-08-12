const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const autoprefixer = require("autoprefixer");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const devMode = process.env.NODE_ENV !== "production";
const prodMode = process.env.NODE_ENV === "production";
const environment = prodMode ? "production" : "development";
const logLevel = process.env.REACT_LOG_LEVEL || (prodMode ? "warn" : "debug");
const reactEnvVariables = new webpack.DefinePlugin({
  ["REACT_LOG_LEVEL"]: JSON.stringify(`${logLevel}`),
});
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
console.log("environment", environment, process.env.NODE_ENV);
const client = {
  target: "web",
  mode: environment,
  watch: devMode,
  entry: path.resolve(__dirname, "client", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "dist", "client"),
    filename: "assets/[name].js",
    publicPath: "",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: [path.resolve(__dirname, "../node_modules")],
  },
  node: {
    __dirname: false,
  },
  devtool: environment === 'production' ? 'inline-nosources-cheap-source-map': 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react']
        }
      },
      
      {
        test: /\.module\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: devMode,
              reloadAll: true,
              publicPath: "../../",
            },
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: devMode ? "[path][name]__[local]" : "[hash:base64]",
              },
            },
          },
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: "expanded",
              },
            },
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /\.module\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: devMode,
              reloadAll: true,
              publicPath: "../../",
            },
          },
          {
            loader: "css-loader",
            options: {},
          },
          {
            loader: "postcss-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: "expanded",
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        loader: "file-loader",
        options: {
          name: "assets/images/[name].[ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
        options: {
          name: "assets/fonts/[name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new NodePolyfillPlugin(),
   new CopyPlugin({ 
    patterns: [ 
     { 
      from: './public/',
      to: "assets/images/" 
    }, 
    ]
 }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "server", "views", "layout.html"),
      filename: "views/layout.html",
      minify: prodMode,
      scriptLoading: "defer",
      inject: "head",
      hash: prodMode,
    }),
    
    new MiniCssExtractPlugin({
      filename: devMode
        ? "assets/css/[name].css"
        : "assets/css/[name].[contenthash].css",
      chunkFilename: devMode
        ? "assets/css/[id].css"
        : "assets/css/[id].[contenthash].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "client/i18n/translations", to: "assets/translations" },
        { from: "server/views", to: "views" },
      ],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      defaultSizes: "gzip",
      openAnalyzer: false,
    }),
    reactEnvVariables,
  ],
  // externals: {
  //   react: "React",
  //   "react-dom": "ReactDOM",
  // },
};

const server = {
  target: "node",
  mode: environment,
  watch: devMode,
  entry: path.resolve(__dirname, "server", "index.ts"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: [path.resolve(__dirname, "../node_modules")],
  },
  node: {
    __dirname: false,
  },
  watchOptions: {
    poll: 1000, // enable polling since fsevents are not supported in docker
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react']
        }
      },
    ],
  },
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, "../node_modules"),
    }),
  ],
};

module.exports = [client, server];