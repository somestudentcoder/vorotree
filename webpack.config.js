//https://github.com/yahiko00/PixiProject

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDev = process.env.NODE_ENV !== 'production';

const config = {
    mode: isDev ? 'development' : 'production',
    entry: './src/scripts/app.ts',
    output: {
        path: path.resolve(__dirname, 'src/dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.riot']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin(
        {   patterns:[
                { from: 'src/index.html' },
                { from: 'src/css/voronoi.css', to: 'css/' },
                { from: 'data/world_gdp.json', to: 'data/'},
                { from: 'data/cars.csv', to: 'data/'},
                { from: 'data/google_product_taxonomy.json', to:'data/'}
            ]
        }),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,
        hot: true,
        open: true
    },
    optimization: {
        minimize: !isDev
      }
};

module.exports = config;