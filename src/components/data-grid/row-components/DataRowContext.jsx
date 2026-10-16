import { useNavigate } from 'react-router-dom'
import { DataRowToggle, DataRowActionsMenu, DataRowPicture } from '.'
import { DataGridRowSelect } from '@/components'
import { LegacyHtml } from '@/components/legacy/LegacyHtml'
import { injectLegacyIconsCss } from '@/utils/legacyIcons'
import { isLegacyUrl } from '@/utils/legacyBridge'
import { cleanUrl } from '@/utils/urlHelper'

//CÉLULA COM HTML DO CARTÃO (ex.: COLUNA "Ações" MONTADA NO arrumaConteudo, COMO NO projetos-paginas-sections-backend)
const CelulaHtml = ({ html }) => {

    const navigate = useNavigate()

    //ÍCONES DO SPRITE DO PAINEL ANTIGO (<div class="icones"><div class="figura-black l4 c1">): O TAMANHO (16x16) E O
    //RECORTE VÊM DO /css/icons.css DO LEGADO. ELE SÓ ERA CARREGADO PELO MENU DE AÇÕES E PELO EDITOR — AQUI O ÍCONE FICAVA
    //SEM TAMANHO E O LINK "Alterar" SUMIA (4x0). injectLegacyIconsCss SÓ CARREGA UMA VEZ
    if (/figura-|class=["'][^"']*\bicones\b/.test(html)) {
        injectLegacyIconsCss()
    }

    //LINK ?pag=... DO CARTÃO NAVEGA PELO ROUTER (SEM RECARREGAR O PAINEL INTEIRO)
    const aoClicar = (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        const link = event.target.closest?.('a[href]')
        if (!link || (link.target && link.target !== '_self')) return
        const href = link.getAttribute('href') || ''
        if (!isLegacyUrl(href)) return
        event.preventDefault()
        const destino = cleanUrl(href)
        navigate(destino.startsWith('?') || destino.startsWith('/') ? destino : '/' + destino)
    }

    return <div className="celula-html" onClick={aoClicar} dangerouslySetInnerHTML={{ __html: html }} />

}

export const DataRowContext = ({ fullRow, row, index, handleToggle }) => {
    if (!row) return

    if (row.component === 'checkbox_delete') {
        // CHECKBOX
        return <DataGridRowSelect row={fullRow} />
    } else if (
        row.component === 'menu_dropdown' &&
        Array.isArray(row.content)
    ) {
        // MENU AÇÕES
        return <DataRowActionsMenu row={row} />
    } else if (row.component === 'photo_preview') {
        return <DataRowPicture row={row} />
    } else if (row.component === 'toggle') {
        // TOOGLE
        return (
            <DataRowToggle
                row={row}
                fullRow={fullRow}
                handleToggle={() =>
                    handleToggle(fullRow.original['row-id'], index, row)
                }
            />
        )
    } else if (row.component === 'html') {
        // RETORNA COMO TEXTO
        return row.content || '-'
    }

    if (row.content) {

        //SÓ AS CÉLULAS COM <script> OU <form> DO CARTÃO PASSAM PELO LegacyHtml (EXECUTA E ENVIA PARA A API);
        //AS DEMAIS CONTINUAM COM O innerHTML SIMPLES, MAIS LEVE PARA LISTAGENS GRANDES
        if (typeof row.content === 'string' && /<(script|form)\b/i.test(row.content)) {
            return <LegacyHtml html={row.content} />
        }

        return <CelulaHtml html={row.content} />
    }

    return row.content || '-'
}
