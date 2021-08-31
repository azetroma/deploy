const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './src/app.js',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [ 'babel-loader']
            },
            {
                test: /\.(s?)css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    
    output: {
        path: path.resolve( __dirname + '/react-dist/'),
        publicPath: '/',
        filename: 'app-bundle.js'
    }
};
