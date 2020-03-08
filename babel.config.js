const presets = [
    [
      "@babel/env",
      {
        targets: {
          safari: "10",
          edge  : "14"
        }
        
      },
    ],
  ];
  module.exports = { presets };