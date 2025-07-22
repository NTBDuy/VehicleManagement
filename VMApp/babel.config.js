module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@config': './config',
            '@/types': './types',
            '@/components': './components',
            '@/contexts': './contexts',
            '@/utils': './utils',
            '@/assets': './assets',
          },
        },
      ],
    ],
  };
};
