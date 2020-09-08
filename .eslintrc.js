module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        createDefaultProgram: true,
        ecmaVersion: 2020,
        project: 'tsconfig.json'
    },
    plugins: [
        '@typescript-eslint',
        'prettier'
    ],
    rules: {
        quotes: ['error', 'single', {allowTemplateLiterals: true}],
        'prettier/prettier': ['error', {singleQuote: true}]
    }
};
