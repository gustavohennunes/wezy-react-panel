import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { destacarBuscaHtml, escaparHtml } from '@/utils/destacarBuscaHtml'
import { DataRowToggle, DataRowActionsMenu, DataRowPicture } from '.'
import { DataGridRowSelect } from '@/components'
import { LegacyHtml } from '@/components/legacy/LegacyHtml'
import { injectLegacyIconsCss } from '@/utils/legacyIcons'
import { tratarCliqueEmLinkDoLegado } from '@/components/legacy/cliqueEmLinkDoLegado'

//CÉLULA COM HTML DO CARTÃO (ex.: COLUNA "Ações" MONTADA NO arrumaConteudo, COMO NO projetos-paginas-sections-backend)
const CelulaHtml = ({ html, onRemoveItems, destaque }) => {

    const navigate = useNavigate()
    const conteudo = useMemo(() => destacarBuscaHtml(html, destaque), [html, destaque])

    //ÍCONES DO SPRITE DO PAINEL ANTIGO (<div class="icones"><div class="figura-black l4 c1">): O TAMANHO (16x16) E O
    //RECORTE VÊM DO /css/icons.css DO LEGADO. ELE SÓ ERA CARREGADO PELO MENU DE AÇÕES E PELO EDITOR — AQUI O ÍCONE FICAVA
    //SEM TAMANHO E O LINK "Alterar" SUMIA (4x0). injectLegacyIconsCss SÓ CARREGA UMA VEZ
    if (/figura-|class=["'][^"']*\bicones\b/.test(html)) {
        injectLegacyIconsCss()
    }

    //role="presentation": O div SÓ RECEBE O CLIQUE DOS LINKS DE DENTRO (DELEGAÇÃO), ELE MESMO NÃO É UM CONTROLE
    return (
        <div
            role="presentation"
            className="celula-html"
            onClick={(event) => tratarCliqueEmLinkDoLegado(event, navigate, (ids) => onRemoveItems?.(ids))}
            dangerouslySetInnerHTML={{ __html: conteudo }}
        />
    )

}

export const DataRowContext = ({ fullRow, row, index, handleToggle, onRemoveItems, destaque }) => {
    if (!row) return

    if (row.component === 'checkbox_delete') {
        // CHECKBOX
        return <DataGridRowSelect row={fullRow} />
    } else if (
        row.component === 'menu_dropdown' &&
        Array.isArray(row.content)
    ) {
        // MENU AÇÕES
        return <DataRowActionsMenu row={row} onRemoveItems={onRemoveItems} />
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
        return destaque ? <CelulaHtml html={escaparHtml(row.content || '-')} destaque={destaque} /> : row.content || '-'
    }

    if (row.content) {

        //SÓ AS CÉLULAS COM <script> OU <form> DO CARTÃO PASSAM PELO LegacyHtml (EXECUTA E ENVIA PARA A API);
        //AS DEMAIS CONTINUAM COM O innerHTML SIMPLES, MAIS LEVE PARA LISTAGENS GRANDES
        if (typeof row.content === 'string' && /<(script|form)\b/i.test(row.content)) {
            return <LegacyHtml html={row.content} />
        }

        return <CelulaHtml html={row.content} onRemoveItems={onRemoveItems} destaque={destaque} />
    }

    return row.content || '-'
}
