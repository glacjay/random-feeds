module.exports = {
  root: true,
  extends: 'react-app',
  plugins: ['import', 'simple-import-sort'],
  rules: {
    'import/first': 0,
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'no-console': 0,
    'no-unused-vars': 1,
    'react/prop-types': 0,
    'react/display-name': 0,
    'react-native/no-inline-styles': 0,
    'simple-import-sort/imports': 'error',
    'sort-imports': 'off',
  },
};
