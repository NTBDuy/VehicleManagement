module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      'nativewind/babel', 
      [
        'module-resolver',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@/types': './types',
            '@/components': './components',
            '@/config': './config',
            '@/contexts': './contexts',
            '@/utils': './utils',
            '@/assets': './assets',
          },
        },
      ],
    ],
  };
};
