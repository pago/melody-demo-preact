var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        'main': path.join(__dirname, 'src/index.js')
    },
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.twig$/,
                use: [
                    {
                        loader: 'babel-loader',
                        // presets: [
                        //     '@babel/preset-env',
                        //     ['@babel/preset-react', {
                        //         "pragma": "h"
                        //     }]
                        // ],
                        // options: {
                        //     plugins: [
                        //         // ['transform-react-jsx', { 'pragma': 'h' }], 
                        //         ['jsx-pragmatic', {
                        //             module: 'preact',
                        //             import: 'h',
                        //             export: 'h'
                        //         }]
                        //     ]
                        // }
                    },
                    // {
                    //     loader: 'babel-loader',
                    //     options: {
                    //         plugins: [
                    //             // For Preact
                    //             ['transform-react-jsx', { 'pragma': 'h' }], 
                    //             ['jsx-pragmatic', {
                    //                 module: 'preact',
                    //                 import: 'h',
                    //                 export: 'h'
                    //             }]
                    //         ]
                    //     }
                    // },
                    {
                        loader: 'melody-loader',
                        options: {
                            plugins: ['jsx']
                        }
                    }
                ]
            },
        ]
    },
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      watchOptions: {
        ignored: /node_modules/,
      },
      overlay: false,
    }
};