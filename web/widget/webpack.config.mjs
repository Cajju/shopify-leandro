import path from 'path'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import { fileURLToPath } from 'url'
import CopyWebpackPlugin from 'copy-webpack-plugin'

function HACK_removeMinimizeOptionFromCssLoaders(config) {
  console.warn('HACK: Removing `minimize` option from `css-loader` entries in Webpack config')
  config.module.rules.forEach((rule) => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach((u) => {
        if (u.loader === 'css-loader' && u.options) {
          delete u.options.minimize
        }
      })
    }
  })
}

const env = {
  // eslint-disable-next-line no-process-env
  DEBUG_MODE: process.env.DEBUG_MODE
}
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDevelopment = process.env.NODE_ENV === 'development'

export default {
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    subWidget: './sub-widget/index.jsx'
  },
  output: {
    filename: (pathData) => {
      if (pathData.chunk.name === 'subWidget') {
        return 'sub-widget--generated.js'
      }
      return null
    },
    library: 'widget',
    path: path.resolve(__dirname, '../../extensions/theme-app-extension/assets')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
              ['@babel/preset-react', { runtime: 'automatic', importSource: 'preact' }]
            ],
            plugins: [
              [
                'babel-plugin-styled-components',
                {
                  displayName: true,
                  fileName: false,
                  meaninglessFileNames: ['index', 'styles'],
                  minify: !isDevelopment,
                  pure: true,
                  transpileTemplateLiterals: true
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              modules: true
            }
          },
          {
            loader: 'sass-loader' // compiles Sass to CSS
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        oneOf: [
          {
            test: /\.svg$/i,
            resourceQuery: /react/, // handle .svg?react
            use: ['@svgr/webpack']
          },
          {
            type: 'asset/resource',
            generator: {
              filename: '[name][ext]'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './shared/utils/themeConfig.json',
          to: 'themeConfig--auto-generated.json'
        }
      ]
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  optimization: {
    minimizer: isDevelopment ? [] : [new TerserPlugin()],
    usedExports: true,
    sideEffects: true,
    minimize: !isDevelopment
  }
}
