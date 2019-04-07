module.exports = ({ config }) => {
  const { module: cfgModule, resolve: cfgResolve } = config;
  cfgModule.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      require.resolve('awesome-typescript-loader'),
      require.resolve('react-docgen-typescript-loader'),
    ],
  });
  cfgResolve.extensions.push('.ts', '.tsx');
  return config;
};
