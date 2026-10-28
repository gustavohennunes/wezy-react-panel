    import { useEffect, useReducer, useRef } from 'react'
    import { SugestoesDoInput } from './CampoComSugestoes'
    import { criaMontadorLegado } from '@/components/legacy/criaMontadorLegado'

    // DROPDOWN DE SUGESTÕES NOS <input> CRUS DOS CARTÕES (HTML DO aut, ex.: Src DO IMAGE DENTRO DE UMA LISTA NO BACK-END DAS
    // SECTIONS): data-sugestoes='[{"value":"...","description":"..."}]' E, OPCIONAL, data-sugestoes-titulo (CABEÇALHO). O INPUT ORIGINAL CONTINUA VISÍVEL E DIGITÁVEL — A
    // LISTA SÓ ESCREVE NELE (E DISPARA input/change PARA O CÓDIGO DO CARTÃO)

    const lerSugestoes = (input) => {
        try {
            const sugestoes = JSON.parse(input.getAttribute('data-sugestoes') || '[]')
            return Array.isArray(sugestoes) ? sugestoes : []
        } catch {
            return []
        }
    }

    const LegacySugestoes = ({ elemento: input }) => {

        const inputRef     = useRef(input)
        const sugestoes    = useRef(lerSugestoes(input)).current
        const [, atualiza] = useReducer((n) => n + 1, 0)

        //VALOR DIGITADO OU TROCADO POR OUTRO CÓDIGO DO CARTÃO → MARCA A SUGESTÃO CERTA
        useEffect(() => {
            input.addEventListener('input', atualiza)
            input.addEventListener('change', atualiza)
            return () => {
                input.removeEventListener('input', atualiza)
                input.removeEventListener('change', atualiza)
            }
        }, [input])

        const escolhe = (valor) => {
            input.value = valor
            input.dispatchEvent(new Event('input', { bubbles: true }))
            input.dispatchEvent(new Event('change', { bubbles: true }))
        }

        if (sugestoes.length === 0) return null

        return (
            <SugestoesDoInput
                inputRef={inputRef}
                sugestoes={sugestoes}
                valor={input.value}
                onEscolher={escolhe}
                titulo={input.getAttribute('data-sugestoes-titulo')}
            />
        )

    }

    const LegacyInputSugestoes = criaMontadorLegado({
        seletor: 'input[data-sugestoes]',
        marcador: 'data-legacy-sugestoes',
        Componente: LegacySugestoes,
    })

    export { LegacyInputSugestoes }
