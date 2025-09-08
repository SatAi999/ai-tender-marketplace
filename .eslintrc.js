module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable ESLint for generated files
  },
  overrides: [
    {
      files: ['src/generated/**/*', 'src/**/*.generated.js', 'src/**/*.js'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: ['src/lib/tender-scraper.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
}
