module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          path: require.resolve("path-browserify"),
          os: require.resolve("os-browserify/browser"),
          fs: false, // No need for fs in browser
        },
      },
    },
  },
};
