module.exports = {
    presets: [
        '@babel/preset-env',
        ['@babel/preset-react', {
            "pragma": "h",
            "pragmaFrag": "Fragment"
        }]
    ],
    plugins: [
        ['jsx-pragmatic', {
            module: 'preact',
            import: 'h',
            export: 'h'
        }],
        ['jsx-pragmatic', {
            module: 'preact',
            import: 'Fragment',
            export: 'Fragment'
        }, 'jsx-pragmatic-fragments']
    ]
};