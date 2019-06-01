module.exports = {
  root: true,
  extends: ['airbnb', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'no-bitwise': 1,
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
