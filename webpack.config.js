
var webpack = require('webpack');

module.exports = {
  entry: {
      testform: "./out/test/testform.js",
      vendor: "./src/vendor.js"
  },
  output: {
    path: "./out",
    filename: "bundle-[name].js"
  },
  plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
        new webpack.optimize.CommonsChunkPlugin("vendor", "bundle-vendor.js")
    ]
}
