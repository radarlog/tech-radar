import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { Configuration } from 'webpack';

const outputDirectory = 'build';

const config: Configuration = {
    devServer: {
        hot: true,
        compress: true,
        contentBase: outputDirectory,
        publicPath: '/',
    },
    entry: {
        index: './src/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: '[name]-[hash:12].js',
        path: path.resolve(__dirname, outputDirectory),
        publicPath: '/',
    },
    optimization: {
        runtimeChunk: 'single',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'public/index.html',
        }),
    ],
};

export default config;
