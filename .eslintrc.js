module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/essential",
    "plugin:prettier/recommended",
    "@vue/prettier",
  ],
  rules: {
    "no-console": "off",//process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": "off",//process.env.NODE_ENV === "production" ? "error" : "off",
  },
  parserOptions: {
    parser: "babel-eslint",
  },
};
