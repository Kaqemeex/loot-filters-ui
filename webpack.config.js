const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production'

    return {
        entry: './packages/ui/src/index.tsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? '[name].[contenthash].js' : '[name].js',
            clean: true,
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            alias: {
                '@loot-filters/core': path.resolve(
                    __dirname,
                    'packages/core/src'
                ),
            },
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(
                                __dirname,
                                'packages/ui/tsconfig.json'
                            ),
                            transpileOnly: isProduction,
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
                    type: 'asset/resource',
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                },
                {
                    test: /\.(wav|mp3|ogg)$/,
                    type: 'asset/resource',
                },
                {
                    test: /\.gz$/,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './packages/ui/public/index.html',
                filename: 'index.html',
            }),
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            compress: true,
            port: 3000,
            hot: true,
            open: true,
            watchFiles: ['packages/ui/src/**/*', 'packages/core/src/**/*'],
            historyApiFallback: true,
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
            },
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map',
    }
}
