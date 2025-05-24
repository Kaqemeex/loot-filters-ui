const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.rs2f$/,
                type: 'asset/source',
            },
            {
                test: /\.json$/,
                type: 'json',
            },
            {
                test: /\.json\.gz$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]',
                },
            },
            {
                test: /\.ttf$/,
                type: 'asset/resource',
            },
            {
                test: /\.(png|jpe?g|gif|svg|wav)$/,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000,
        historyApiFallback: true,
        client: {
            overlay: {
                runtimeErrors: (error) => {
                    if (
                        error?.message ===
                        'ResizeObserver loop completed with undelivered notifications.'
                    ) {
                        console.error(error)
                        return false
                    }
                    return true
                },
            },
        },
    },
}
