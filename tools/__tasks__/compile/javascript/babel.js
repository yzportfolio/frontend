const execa = require('execa');

const { src, transpiled } = require('../../config').paths;

module.exports = {
    description: 'Transpile',
    task: [
        {
            description: 'main JS',
            task: () =>
                execa(
                    'babel',
                    [
                        `${src}/javascripts`,
                        '--out-dir',
                        `${transpiled}/javascripts`,
                        '--ignore',
                        '**/*.spec.js',
                    ],
                    {
                        env: {
                            BABEL_ENV: 'karma',
                        },
                    }
                ),
        },
        {
            description: 'legacy JS',
            task: () =>
                execa(
                    'babel',
                    [
                        `${src}/javascripts-legacy`,
                        '--out-dir',
                        `${transpiled}/javascripts`,
                        '--ignore',
                        '**/*.spec.js',
                    ],
                    {
                        env: {
                            BABEL_ENV: 'karma',
                        },
                    }
                ),
        },
    ],
    concurrent: true,
};
