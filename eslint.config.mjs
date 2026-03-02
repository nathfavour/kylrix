export default [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-explicit-any": "off"
    }
  }
];
