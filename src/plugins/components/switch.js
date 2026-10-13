import plugin from 'tailwindcss/plugin'

export default plugin(({ addVariant, addComponents, theme, e }) => {
    addComponents({
        '.switch': {
            display: 'flex',
            'align-items': 'center',
            gap: theme('spacing')['2.5'],
            cursor: 'pointer',
            'input[type=checkbox]': {
                display: 'flex',
                appearance: 'none',
                'background-color': 'var(--tw-gray-300)',
                position: 'relative',
                cursor: 'pointer',
                'flex-shrink': '0',
                height: theme('custom.components.switch.DEFAULT.height'),
                width: theme('custom.components.switch.DEFAULT.width'),
                'border-radius': theme(
                    'custom.components.switch.DEFAULT.height'
                ),
                transition: 'background-color .15s ease-in-out',
                //DISTÂNCIA QUE A BOLINHA ANDA: LARGURA DO TRILHO - BOLINHA - 2x O RECUO DE 0.25rem
                '--tw-switch-travel': `calc(${theme('custom.components.switch.DEFAULT.width')} - 1rem - 0.5rem)`,
                '&:before': {
                    display: 'flex',
                    position: 'absolute',
                    content: '""',
                    height: '1rem',
                    width: '1rem',
                    'border-radius': '100%',
                    'background-color': 'var(--tw-light)',
                    'inset-inline-start': '0.25rem', // Logical property for RTL/LTR
                    top: '50%',
                    transform: 'translateY(-50%)',
                    filter: 'drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.03))',
                    //SÓ O transform ANIMA. ANTES inset-inline-start E transform MUDAVAM JUNTOS; COM CLIQUES
                    //RÁPIDOS AS DUAS TRANSIÇÕES SE INTERROMPIAM EM PONTOS DIFERENTES E A BOLINHA SAÍA DO TRILHO
                    transition: 'transform .15s ease-in-out, background-color .15s ease-in-out',
                },
                '&:checked, &[aria-checked="true"]': {
                    'background-color': 'var(--tw-primary)',
                    '&:before': {
                        'background-color': '#ffffff',
                        transform: 'translate(var(--tw-switch-travel), -50%)',
                        filter: 'none',
                    },
                },
                '&:disabled': {
                    'background-color': 'var(--tw-gray-100)',
                    border: '1px solid var(--tw-gray-300)',
                    cursor: 'not-allowed',
                    opacity: '0.5',
                    '&:before': {
                        'background-color': 'var(--tw-gray-300)',
                    },
                    '&:checked, &[aria-checked="true"]': {
                        'background-color': 'var(--tw-primary-clarity)',
                        border: '0',
                        '&:before': {
                            'background-color': 'var(--tw-light)',
                        },
                    },
                },
            },
            '.switch-label': {
                color: 'var(--tw-gray-700)',
                'font-size': theme('fontSize.sm'),
                'font-weight': theme('fontWeight.medium'),
                'line-height': theme('lineHeight.4'),
            },
            'input[type=checkbox] + .switch-label': {
                color: 'var(--tw-gray-800)',
            },
            '&:has(input[type=checkbox]:disabled)': {
                '.switch-label': {
                    color: 'var(--tw-gray-500)',
                },
            },
        },
        '.switch-sm': {
            'input[type=checkbox]': {
                height: theme('custom.components.switch.sm.height'),
                width: theme('custom.components.switch.sm.width'),
                '--tw-switch-travel': `calc(${theme('custom.components.switch.sm.width')} - 0.75rem - 0.5rem)`,
                'border-radius': theme('custom.components.switch.sm.height'),
                '&:before': {
                    height: '0.75rem',
                    width: '0.75rem',
                },
            },
            '.switch-label': {
                'font-size': theme('fontSize.2sm'),
            },
        },
        '.switch-lg': {
            'input[type=checkbox]': {
                height: theme('custom.components.switch.lg.height'),
                width: theme('custom.components.switch.lg.width'),
                '--tw-switch-travel': `calc(${theme('custom.components.switch.lg.width')} - 1.25rem - 0.5rem)`,
                'border-radius': theme('custom.components.switch.lg.height'),
                '&:before': {
                    height: '1.25rem',
                    width: '1.25rem',
                },
            },
            '.switch-label': {
                'font-size': theme('fontSize.md'),
            },
        },
        '[dir=rtl] .switch': {
            'input[type=checkbox]': {
                '&:checked, &[aria-checked="true"]': {
                    '&:before': {
                        transform: 'translate(calc(var(--tw-switch-travel) * -1), -50%)',
                    },
                },
            },
        },
    })

    addVariant('switch-on', [
        ({ modifySelectors, separator }) => {
            modifySelectors(({ className }) => {
                return `.switch:has([type="checkbox"]:checked) .${e(`switch-on${separator}${className}`)}`
            })
        },
    ])
})
