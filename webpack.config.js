const WebpackShellPlugin = require('webpack-shell-plugin');
const webpack = require('webpack');
const path = require('path');

let plugins = [
    new webpack.EnvironmentPlugin({
        'NODE_ENV': 'development',
        'STRATEGOS_SERVER_URL': undefined,
        'STRATEGOS_TLS_KEY': undefined,
        'STRATEGOS_TLS_CERT': undefined,
        'STRATEGOS_READ_MAC_INTERVAL': 30000,
        'STRATEGOS_REPORT_CLEAN_UP_INTERVAL': 4000,
    })
];

if (process.env.NODE_ENV !== 'production') {
    // onBuildEnd only fired after first build
    plugins.push(
        new WebpackShellPlugin({onBuildEnd: ['nodemon dist/main.js --watch dist']})
    );
}

module.exports = {
    mode: 'development',
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
    plugins: plugins
};
