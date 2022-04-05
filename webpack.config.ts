import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import type { Configuration } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

const outputDirectory = 'build';

const devServerConfig: DevServerConfiguration = {
    hot: true,
    compress: true,
    static: {
        directory: outputDirectory,
        publicPath: '/',
    },
};

const config: Configuration = {
    devServer: devServerConfig,
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
        filename: '[name]-[contenthash:12].js',
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
