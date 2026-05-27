module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }]
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@store': './store',
            '@configs': './configs',
            '@utils': './utils',
          },
        },
      ],
      // Reanimated v4 moved worklets to a separate package
      'react-native-worklets/plugin',
    ],
  };
};
