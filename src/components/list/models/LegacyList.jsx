    import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
    import { createPortal } from 'react-dom'
    import { useNavigate } from 'react-router-dom'
    import { DataRowActionsMenu } from '@/components/data-grid/row-components/DataRowActionsMenu'
    import { executarScript } from '@/components/legacy/executarScript'
    import { injectLegacyIconsCss } from '@/utils/legacyIcons'
    import { tratarCliqueEmLinkDoLegado } from '@/components/legacy/cliqueEmLinkDoLegado'

    // LISTAGEM MONTADA EM HTML PELO PRÓPRIO CARD ($novoResultadoInicial no painel-php).
    // A ponte entrega esse HTML em params.list.content; como são <tr> crus, não é possível
    // injetá-los no DataGrid (TanStack) — aqui montamos uma tabela própria com o mesmo cabeçalho.
    //
    // OS <script> DO HTML SÃO EXECUTADOS DEPOIS DE MONTAR A TABELA, E O WRAPPER .legacy-html DEIXA O legacy-runtime.js
    // (SERVIDO PELA API) APLICAR DATAS E O CONTADOR DOS CHECKBOXES, COMO NO painel.js LEGADO.
    //DEFAULT FORA DO COMPONENTE: UM [] NOVO A CADA RENDER INVALIDAVA O useMemo DAS COLUNAS
    const SEM_COLUNAS = []

    const LegacyList = ({ html, columnHeader = SEM_COLUNAS, showHeader = true, onRemoveItems }) => {

        const corpoRef = useRef(null)
        const navigate = useNavigate()

        //ÍCONES DO SPRITE DO LEGADO NAS AÇÕES (<div class="icones"><div class="figura-black l4 c1">, ex.: "Alterar" DO
        //projetos-paginas-sections-backend): TAMANHO E RECORTE VÊM DO /css/icons.css DO PAINEL ANTIGO, QUE ESTA LISTAGEM
        //NÃO CARREGAVA — O ÍCONE FICAVA SEM CSS E O LINK SUMIA. SÓ CARREGA UMA VEZ
        useEffect(() => {
            if (/figura-|class=["'][^"']*\bicones\b/.test(html || '')) {
                injectLegacyIconsCss()
            }
        }, [html])

        //CÉLULAS DE AÇÕES DO LEGADO (<a class="bttPS" data-original-title="Alterar"><div class="icones"><div class="figura-black
        //l4 c1">): VIRAM O MESMO MENU DE AÇÕES DAS LISTAGENS NORMAIS (?pag=modulos) — ÍCONE CENTRALIZADO, TOOLTIP COM O TÍTULO E
        //EXCLUSÃO COM CONFIRMAÇÃO PELA API. createPortal: O MENU FICA NA ÁRVORE DO REACT (ROUTER, PageData) MESMO DENTRO DO
        //HTML DO CARTÃO. SÓ CONVERTE CÉLULA QUE TEM APENAS ESSES LINKS (SEM TEXTO NEM CAMPOS) — O RESTO FICA COMO VEIO
        const [celulasDeAcoes, setCelulasDeAcoes] = useState([])
        useLayoutEffect(() => {

            const corpo = corpoRef.current
            if (!corpo) {
                setCelulasDeAcoes([])
                return
            }

            const encontradas = []

            corpo.querySelectorAll('td').forEach((td) => {

                const links = Array.from(td.querySelectorAll('a[href]')).filter((link) => link.querySelector('.icones, [class*="figura-"]'))
                if (links.length === 0) return

                const copia = td.cloneNode(true)
                copia.querySelectorAll('a[href]').forEach((link) => link.remove())
                if (copia.textContent.trim() !== '' || copia.querySelector('input, select, textarea, button, img')) return

                const itens = links.map((link) => ({
                    url: link.getAttribute('href') || '',
                    title: link.getAttribute('data-original-title') || link.getAttribute('title') || link.textContent.trim(),
                    icon: link.querySelector('[class*="figura-"]')?.className || '',
                    target: link.getAttribute('target') || '',
                }))

                td.innerHTML = ''
                const host = document.createElement('div')
                host.className = 'flex justify-center'
                td.appendChild(host)

                encontradas.push({ host, element: td.closest('tr'), row: { content: itens } })

            })

            setCelulasDeAcoes(encontradas)

        }, [html])

        //LINK ?pag=... DA LISTAGEM NAVEGA PELO ROUTER (VER tratarCliqueEmLinkDoLegado)
        const aoClicar = (event) => tratarCliqueEmLinkDoLegado(event, navigate)

        //SCRIPT VINDO DE innerHTML NÃO RODA: RECRIA NA ORDEM, COMO O LegacyHtml
        useEffect(() => {

            const corpo = corpoRef.current
            if (!corpo) return

            let cancelado = false

            const executar = async () => {
                for (const script of Array.from(corpo.querySelectorAll('script'))) {
                    if (cancelado) return
                    await executarScript(script)
                }
            }

            executar()

            return () => {
                cancelado = true
            }

        }, [html])

        const columns = useMemo(
            () => (Array.isArray(columnHeader) ? columnHeader : []),
            [columnHeader]
        )

        if (!html) {
            return null
        }

        return (
            <div className="grid min-w-full legacy-html">
                <div className="overflow-x-auto">
                    <table className="table table-auto align-middle text-sm text-gray-700 w-full legacy-list">

                        {showHeader && columns.length > 0 && (

                            <thead>
                                <tr>
                                    {columns.map((col, index) => (
                                        <th
                                            key={`legacy-th-${index}`}
                                            className={col.class || ''}
                                            style={{
                                                width: col.width && col.width !== '0%' ? col.width : undefined,
                                                textAlign: col.align || 'left',
                                            }}
                                        >
                                            {typeof col.content === 'string' ? col.content : ''}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                        )}

                        <tbody ref={corpoRef} onClick={aoClicar} dangerouslySetInnerHTML={{ __html: html }} />

                        {celulasDeAcoes.map((celula, indice) => createPortal(<DataRowActionsMenu row={celula.row} onRemoveItems={(ids) => onRemoveItems(ids, celula.element)} />, celula.host, `acoes-${indice}`))}

                    </table>
                </div>
            </div>
        )

    }

    export { LegacyList }
