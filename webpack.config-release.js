//module.exports = {
//  entry: './react-src/app.js',
//  module: {
//    rules: [
//      {
//        test: /\.(js|jsx)$/,
//        exclude: /node_modules/,
//        use: ['babel-loader']
//      }
//    ]
//  },
//  resolve: {
//    extensions: ['*', '.js', '.jsx']
//  },
//  output: {
//    path: __dirname + '/react-dist',
//    publicPath: '/',
//    filename: 'bundle.js'
//  },
//  devServer: {
//    contentBase: './react-dist'
//  }
//};


const path = require('path');

module.exports = {
    //mode: 'development',
    devtool: 'source-map',
    entry: './react-src/app.js',
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
        filename: 'bundle.js'
    }
};
