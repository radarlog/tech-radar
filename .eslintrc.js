module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        createDefaultProgram: true,
        ecmaVersion: 2020,
        project: 'tsconfig.json'
    },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        quotes: ['error', 'single', {allowTemplateLiterals: true}],
    }
};
