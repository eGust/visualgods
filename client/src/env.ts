declare const process: {
  env: {
    NODE_ENV: string;
  };
};

export const IS_DEV = process.env.NODE_ENV === 'development';

export const IS_PROD = process.env.NODE_ENV === 'production';
