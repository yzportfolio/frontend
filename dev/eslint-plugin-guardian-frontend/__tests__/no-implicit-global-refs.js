const { RuleTester } = require('eslint');
const rule = require('../rules/no-implicit-global-refs');

const ruleTester = new RuleTester({
    parser: 'babel-eslint',
    parserOptions: { 
        ecmaVersion: 2015,
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true
    }
});

ruleTester.run('exports-last', rule, {
    valid: [
        'const foo = () => {}; foo();',
        // 'window.close();',
        // 'const close = window.close;',
        'const close = () => {}; close();',
        // 'import close from "lib/close"; close();',
    ],

    invalid: [
        'close();',
        // 'const close = close;',
    ].map(code => ({
        code,
        errors: ['global property referenced without window prefix'],
    })),
});
