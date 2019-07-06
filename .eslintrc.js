module.exports = {
  root: true,
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
  ],
  // parser: '@typescript-eslint/parser',
  plugins: ['react-hooks'],
  rules: {
    'max-len': ['error', 121],
    'implicit-arrow-linebreak': 'off',
    'no-bitwise': 'warn',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    }],
    '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
    'spaced-comment': ['error', 'always', {
      markers: ['/'],
    }],
    'import/named': 'warn',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    }],
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    // 'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'arrow-parens': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-filename-extension': [1, {
      extensions: ['.js', '.jsx', '.tsx'],
    }],
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {},
    },
  },
};
