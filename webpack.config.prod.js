const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    target: 'node',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            // node 9.0.0 is fully compatible with es7
            uglifyOptions: {ecma: 7}
        }),
        new webpack.EnvironmentPlugin({
            'NODE_ENV': 'production',
            'STRATEGOS_SERVER_URL': undefined,
        })
    ]
};
