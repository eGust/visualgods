module.exports = {
  root: true,
  extends: ['airbnb', 'plugin:@typescript-eslint/recommended'],
  plugins: ['react-hooks'],
  rules: {
    'no-bitwise': 'warn',
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    'react/jsx-filename-extension': [1, {
      extensions: ['.js', '.jsx', '.tsx'],
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'spaced-comment': ['error', 'always', {
      markers: ['/'],
    }],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    }],
    'no-unused-vars': ['error', {
      ignoreRestSiblings: true,
    }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
