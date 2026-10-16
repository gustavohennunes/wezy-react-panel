import plugin from 'tailwindcss/plugin'

export default plugin(({ addComponents, theme }) => {
    // Base
    addComponents({
        '.tabs': {
            display: 'flex',
            'align-items': 'center',
            gap: theme('spacing.5'),
            'border-bottom': '1px solid var(--tw-gray-200)',
        },
        '.tab': {
            display: 'inline-flex',
            'align-items': 'center',
            gap: theme('spacing')['2'],
            'font-size': theme('fontSize.2sm'),
            'line-height': '1',
            color: 'var(--tw-gray-700)',
            i: {
                'font-size': theme('fontSize.md'),
                color: 'var(--tw-gray-600)',
            },
            'font-weight': theme('fontWeight.medium'),
            padding: `${theme('spacing.4')} 0`,
            'border-bottom': '2px solid transparent',
            transition: 'color 0.15s ease, border-color 0.15s ease',
            '&.active, &:hover, &:focus': {
                color: 'var(--tw-primary)',
                i: {
                    color: 'var(--tw-primary)',
                },
            },
            //HOVER E FOCO DO TECLADO GANHAM A MESMA LINHA DA ABA ATIVA (ANTES SÓ A COR DO TEXTO MUDAVA)
            '&.active, &:hover, &:focus-visible': {
                'border-bottom-color': 'var(--tw-primary)',
            },
        },
    })
})
