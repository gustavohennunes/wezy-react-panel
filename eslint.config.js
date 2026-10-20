import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    { ignores: ['dist'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: '18.3' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/jsx-no-target-blank': 'off',
            //O PAINEL NÃO USA PropTypes: AS PROPS VÊM DA PONTE (DADOS DINÂMICOS). A REGRA SÓ GERAVA CENTENAS DE ERROS
            //E ESCONDIA OS REAIS
            'react/prop-types': 'off',
            //ATRIBUTO QUE O cmdk LÊ NO CSS DO COMMAND (components/ui/command.jsx, PADRÃO DO shadcn)
            'react/no-unknown-property': ['error', { ignore: ['cmdk-input-wrapper'] }],
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
]
