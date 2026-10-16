    // ABAS DA LISTAGEM ($setBotoes DO CARTÃO -> params.buttons.list.before). QUANDO A TELA TEM $cabecalhoPagina
    // (extra_content.header.after, ex.: "Section: ..." DO projetos-paginas-sections-backend), AS ABAS SOBEM PARA CIMA DELE,
    // NO TOPO DO CONTEÚDO, COMO NAS ABAS DOS FORMULÁRIOS (Geral/CSS/JS) — DENTRO DO CARD ELAS FICAVAM ABAIXO DO CABEÇALHO.
    // SEM CABEÇALHO CONTINUAM NO CARD DA LISTAGEM (Models)

    export const abasDaListagemNoTopo = (pageData) => {

        const abas      = pageData?.params?.buttons?.list?.before
        const cabecalho = String(pageData?.params?.extra_content?.header?.after || '').trim()

        if (cabecalho === '' || !Array.isArray(abas) || abas.length === 0) return null
        if (pageData?.layout && pageData.layout !== 'list') return null

        return abas

    }
