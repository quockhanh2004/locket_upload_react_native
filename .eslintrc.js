module.exports = {
  root: true,
  env: {
    'react-native/react-native': true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'eslint:recommended',
    '@react-native',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: ['react-native', 'react-hooks', 'prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
      {
        usePrettierrc: true,
      },
    ],
  },
};
