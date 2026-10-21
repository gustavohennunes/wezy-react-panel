import { useMemo } from 'react'
import { Models } from './Models'

const SEM_LINHAS = []

// Na edição, a mesma tabela fica disponível abaixo da busca, sem sobreposição.
export const BackendSearch = ({ html }) => {
    const colunas = useMemo(() => {
        const doc = new DOMParser().parseFromString('<table><tbody>' + html + '</tbody></table>', 'text/html')
        const global = doc.querySelector('tr')?.cells.length === 7
        const titulos = ['Cód.', ...(global ? ['Página', 'Section'] : []), 'Label', 'Tipo', 'Situação', 'Ações']
        return titulos.map((content) => ({ content }))
    }, [html])

    return <div className="mb-5"><Models model={SEM_LINHAS} content={html} columnHeader={colunas} localSearch hideUntilSearch btnExcluir={false} /></div>
}
