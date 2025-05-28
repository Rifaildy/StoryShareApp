const { merge } = require("webpack-merge");
const { InjectManifest } = require("workbox-webpack-plugin");
const common = require("./webpack.common");
const path = require("path");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new InjectManifest({
      swSrc: path.resolve(__dirname, "src/scripts/sw.js"),
      swDest: "sw.js",
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      exclude: [/\.map$/, /manifest$/, /\.htaccess$/, /app\.bundle\.js$/],
      manifestTransforms: [
        (manifestEntries) => {
          const manifest = manifestEntries.filter((entry) => {
            return !entry.url.includes("app.bundle.js");
          });
          return { manifest };
        },
      ],
    }),
  ],
});
