// eslint-disable-next-line import/no-default-export
export default function (api) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
}
