    import { Fragment, useMemo, useState } from 'react'
    import { Link, useLocation } from 'react-router-dom'
    import clsx from 'clsx'
    import { KeenIcon } from '@/components/keenicons'
    import { DestaqueBusca as Destaque } from './DestaqueBusca'
    import { normalizarBusca as normalizar } from '@/utils/normalizarBusca'

    // MODO DE EDIÇÃO DO SITE (?pag=ativar-modulo-edicao, ACESSO DE SUPORTE): A SIDEBAR VIRA A ÁRVORE PÁGINAS > SECTIONS >
    // BACK-ENDS, COMO O class/ProjectStructure.php DO PAINEL ANTIGO. OS DADOS VÊM DO panel/menus (data.editor.pages).
    // ABRE SOZINHO O CAMINHO DA TELA ATUAL (MESMAS REGRAS DO buildHtml LEGADO); O RESTO ABRE E FECHA NO CLIQUE

    const caminhosAbertos = (pages, params) => {

        const pag        = params.get('pag') || params.get('slug') || ''
        const id         = params.get('id') || ''
        const parametro  = params.get('parametro') || ''
        const parametros = params.get('parametros') || ''
        const cliente    = params.get('cliente') || ''
        const sectionType = params.get('section_type') || ''

        //TUDO COMEÇA FECHADO; SÓ ABRE O CAMINHO DA TELA ATUAL. O "Cabeçalho e rodapé" (shared) ABRIA SEMPRE, A CADA TROCA DE
        //TELA, MESMO FECHADO PELA SETA — AGORA SEGUE A MESMA REGRA DAS PÁGINAS
        const abertos = new Set()
        let atual = null

        //DESTAQUE EM GRUPO COMO NO LEGADO: BACK-END = ELE + A SECTION; SECTION = ELA + OS BACK-ENDS; PÁGINA = ELA + TODAS AS
        //SECTIONS E BACK-ENDS (OS BACK-ENDS SÓ APARECEM COM A SECTION ABERTA)
        const grupo = new Set()
        const marcaSection = (section) => {
            grupo.add('s' + section.id)
            section.backend.forEach((backend) => grupo.add('b' + backend.id))
        }

        pages.forEach((page) => {

            //TELAS DA PÁGINA (ABAS DO FORMULÁRIO DE PÁGINA): "Páginas" (projetos-paginas&id=), "Sections" (A LISTA:
            //projetos-paginas-sections&parametro= SEM id) E "Ações/ajax" (actions-pages&cliente= — O CARTÃO MANDA O id DA
            //PÁGINA NO cliente). TODAS DESTACAM A PÁGINA COMO TELA ATUAL
            const telaDaPagina =
                (page.shared && pag === 'projeto-header-footer' && id === '') ||
                //"Adicionar section" DO CABEÇALHO E RODAPÉ: projetos-paginas-sections&acao=Inserir&section_type=ok (SEM parametro)
                (page.shared && pag === 'projetos-paginas-sections' && id === '' && sectionType !== '') ||
                (pag === 'projetos-paginas' && id === page.id) ||
                (pag === 'projetos-paginas-sections' && id === '' && parametro === page.id) ||
                (pag === 'actions-pages' && cliente === page.id)

            if (
                telaDaPagina ||
                (['projetos-paginas-sections', 'projetos-paginas-sections-backend', 'projetos-paginas-sections-css', 'projetos-paginas-sections-js'].includes(pag) && parametro === page.id)
            ) {
                abertos.add('p' + page.id)
                if (telaDaPagina) {
                    atual = 'p' + page.id
                    grupo.add('p' + page.id)
                    page.sections.forEach(marcaSection)
                }
            }

            page.sections.forEach((section) => {

                const backendAtual = pag === 'projetos-paginas-sections-backend' && section.backend.some((b) => b.id === id)

                if (
                    (pag === 'projetos-paginas-sections' && id === section.id) ||
                    (page.shared && pag === 'projeto-header-footer' && id === section.id) ||
                    (['projetos-paginas-sections-css', 'projetos-paginas-sections-js', 'projetos-paginas-sections-backend'].includes(pag) && parametros === section.id) ||
                    backendAtual
                ) {
                    abertos.add('p' + page.id)
                    abertos.add('s' + section.id)

                    if (backendAtual) {
                        //BACK-END ABERTO: ELE + A SECTION PAI
                        atual = 'b' + id
                        grupo.add('b' + id)
                        grupo.add('s' + section.id)
                    } else {
                        //A SECTION OU UMA TELA DELA (CSS, JS, LISTA DE BACK-ENDS): A SECTION + OS BACK-ENDS
                        atual = 's' + section.id
                        marcaSection(section)
                    }
                }

            })

        })

        return { abertos, atual, grupo }

    }

    //FILTRA A ÁRVORE PELA BUSCA, JÁ COM O CAMINHO ABERTO ATÉ O QUE BATEU:
    //- PÁGINA BATE: ELA ABERTA COM TODAS AS SECTIONS (FECHADAS, SALVO AS QUE TAMBÉM BATEM)
    //- SECTION BATE: PÁGINA + ELA ABERTA COM TODOS OS BACK-ENDS
    //- BACK-END BATE (NOME OU TIPO, ex.: "head"): PÁGINA + SECTION ABERTAS, SÓ COM OS BACK-ENDS QUE BATEM
    //null SEM BUSCA (A ÁRVORE NORMAL)
    const filtrarArvore = (pages, busca) => {

        const termo = normalizar(busca).trim()
        if (!termo) return null

        const bate    = (texto) => normalizar(texto).includes(termo)
        const abertos = new Set()

        const paginas = pages.reduce((lista, page) => {

            const paginaBate = bate(page.name)

            const sections = page.sections.reduce((secoes, section) => {

                const backends = section.backend.filter((backend) => bate(backend.name) || bate(backend.type))

                if (bate(section.name)) {
                    abertos.add('s' + section.id)
                    secoes.push(section)
                } else if (backends.length > 0) {
                    abertos.add('s' + section.id)
                    secoes.push({ ...section, backend: backends })
                } else if (paginaBate) {
                    secoes.push(section)
                }

                return secoes

            }, [])

            if (paginaBate || sections.length > 0) {
                if (sections.length > 0) abertos.add('p' + page.id)
                lista.push({ ...page, sections })
            }

            return lista

        }, [])

        return { termo, paginas, abertos }

    }

    //SIGLA DO TIPO DE BACK-END ([HEAD], [PARA]...) E DE SECTION CLONADA
    const Sigla = ({ children }) => (
        <span className="shrink-0 rounded bg-gray-100 px-1 py-px font-mono text-[9px] font-semibold leading-4 text-gray-600">
            {children}
        </span>
    )

    //ativo: A TELA ATUAL (editor-tree-atual); noGrupo: PARENTE DESTACADO JUNTO (editor-tree-grupo) — VER globals.css
    //SEM rounded POR LINHA: O BLOCO DA PÁGINA (<li> COM overflow-hidden) É QUE ARREDONDA — SÓ O PRIMEIRO E O ÚLTIMO ITEM
    //FICAM COM CANTO. semBarra: A PÁGINA ATUAL NÃO LEVA A BARRA DA ESQUERDA
    const Linha = ({ nivel, aberto, temFilhos, onToggle, to, ativo, noGrupo, semBarra, icone, children, titulo }) => (
        <div
            className={clsx(
                'group flex min-h-8 w-full min-w-0 items-center gap-1 pe-2 transition-colors',
                ativo ? clsx('editor-tree-atual', semBarra && 'editor-tree-atual-sem-barra') : noGrupo ? 'editor-tree-grupo text-gray-900' : 'text-gray-800 hover:bg-gray-100'
            )}
            style={{ paddingInlineStart: 4 + nivel * 14 }}
        >
            {temFilhos ? (
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex size-5 shrink-0 items-center justify-center rounded text-gray-500 hover:text-gray-900"
                    aria-label={aberto ? 'Fechar' : 'Abrir'}
                    aria-expanded={aberto}
                >
                    <KeenIcon icon="right" className={clsx('text-[10px] transition-transform', aberto && 'rotate-90')} />
                </button>
            ) : (
                <span className="size-5 shrink-0" />
            )}
            {icone}
            <Link
                to={to}
                title={titulo}
                className={clsx('flex min-w-0 flex-1 items-center gap-1.5 py-1 text-[13px]', ativo ? 'font-semibold' : 'font-medium')}
            >
                {children}
            </Link>
        </div>
    )

    const SidebarEditorTree = ({ editor, search = '' }) => {

        const location = useLocation()
        //PÁGINAS DESATIVADAS (inactive_pages, status != 1) VÊM DEPOIS DAS ATIVAS, MARCADAS COMO inativa: A LISTA MOSTRA
        //UM SEPARADOR ANTES DELAS E AS DEIXA APAGADAS. BUSCA E CAMINHO DA URL VALEM PARA ELAS TAMBÉM
        const pages = useMemo(() => {
            const globais = editor?.shared_sections || []
            const idsGlobais = new Set(globais.map((section) => section.id))
            //SECTIONS DESATIVADAS (inactive_sections) ENTRAM NA POSIÇÃO DELAS: LOGO DEPOIS DA ATIVA after ('' = ANTES DE TODAS)
            const comInativas = (page) => {
                const inativas = (page.inactive_sections || []).map((section) => ({ ...section, inativa: true }))
                if (inativas.length === 0) return page.sections
                const depoisDe = (id) => inativas.filter((section) => (section.after || '') === id)
                return [...depoisDe(''), ...page.sections.flatMap((section) => [section, ...depoisDe(section.id)])]
            }
            const semGlobais = (page) => ({ ...page, sections: comInativas(page).filter((section) => !idsGlobais.has(section.id)) })
            return [
                ...(globais.length > 0 ? [{ id: 'header-footer', name: 'Cabeçalho e rodapé', shared: true, sections: globais }] : []),
                ...(editor?.pages || []).map(semGlobais),
                ...(editor?.inactive_pages || []).map((page) => ({ ...semGlobais(page), inativa: true })),
            ]
        }, [editor])

        const { abertos: abertosDaUrl, atual, grupo } = useMemo(
            () => caminhosAbertos(pages, new URLSearchParams(location.search)),
            [pages, location.search]
        )

        //CLIQUE NA SETA ABRE/FECHA; AO TROCAR DE TELA, O CAMINHO DA TELA ATUAL ABRE DE NOVO (COMO O LEGADO)
        const [abertos, setAbertos] = useState(abertosDaUrl)
        const [abertosDaUrlAnterior, setAbertosDaUrlAnterior] = useState(abertosDaUrl)
        if (abertosDaUrl !== abertosDaUrlAnterior) {
            setAbertosDaUrlAnterior(abertosDaUrl)
            setAbertos((anterior) => new Set([...anterior, ...abertosDaUrl]))
        }

        //COM BUSCA: SÓ O QUE BATEU, COM O PRÓPRIO ABRE/FECHA (RECOMEÇA A CADA LETRA); APAGANDO A BUSCA, VOLTA A ÁRVORE COMO ESTAVA
        const filtro = useMemo(() => filtrarArvore(pages, search), [pages, search])
        const [abertosBusca, setAbertosBusca] = useState(() => (filtro ? new Set(filtro.abertos) : null))
        const [filtroAnterior, setFiltroAnterior] = useState(filtro)
        if (filtro !== filtroAnterior) {
            setFiltroAnterior(filtro)
            setAbertosBusca(filtro ? new Set(filtro.abertos) : null)
        }

        //"Textos e imagens" ABRE DIRETO NO GRUPO DA PÁGINA DA TELA ATUAL (texts_id DA API). NO CABEÇALHO E RODAPÉ, NO DA SECTION
        //ATUAL (OU NA PRIMEIRA QUE TIVER). SEM REGISTRO, ABRE A LISTAGEM
        //A PÁGINA SAI DO ENDEREÇO (id NA TELA DA PÁGINA, parametro NAS TELAS DE SECTION, cliente NO actions-pages); SEM texts_id
        //NA PÁGINA, VALE O DA SECTION ATUAL OU O DA PRIMEIRA SECTION DELA QUE TIVER
        const linkDosTextos = useMemo(() => {
            const params    = new URLSearchParams(location.search)
            const pag       = params.get('pag') || params.get('slug') || ''
            const idDaPagina =
                pag === 'projetos-paginas' ? params.get('id') :
                pag === 'actions-pages' ? params.get('cliente') :
                params.get('parametro')
            const naTela = (chave) => atual === chave || grupo.has(chave)
            const pagina =
                pages.find((page) => !page.shared && idDaPagina && page.id === idDaPagina) ||
                pages.find((page) => naTela('p' + page.id) || page.sections.some((section) => naTela('s' + section.id)))
            const daTela = pagina?.sections.find((section) => naTela('s' + section.id))
            const id =
                (pagina?.shared ? '' : pagina?.texts_id) ||
                daTela?.texts_id ||
                pagina?.sections.find((section) => section.texts_id)?.texts_id
            return id ? `/?pag=textos-e-imagens&acao=Alterar&id=${id}` : '/?pag=textos-e-imagens'
        }, [pages, atual, grupo, location.search])

        const paginasVisiveis = filtro ? filtro.paginas : pages
        const abertosVisiveis = filtro ? abertosBusca || filtro.abertos : abertos
        const termo           = filtro?.termo || ''

        const alternar = (chave) =>
            (filtro ? setAbertosBusca : setAbertos)((anterior) => {
                const proximo = new Set(anterior || filtro?.abertos)
                proximo.has(chave) ? proximo.delete(chave) : proximo.add(chave)
                return proximo
            })

        return (
            //w-full + min-w-0 + overflow-hidden: NOMES LONGOS NÃO PODEM ALARGAR A SIDEBAR (O truncate SÓ CORTA COM LARGURA TRAVADA)
            <div className="flex w-full min-w-0 flex-col gap-3 overflow-x-hidden px-3.5">

                <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-dashed border-primary bg-primary-light px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-primary">
                        <KeenIcon icon="code" className="text-sm" />
                        Modo edição do site
                    </span>
                    <Link to="/?pag=ativar-modulo-edicao&editor-mode=false" className="btn btn-sm btn-light w-full min-w-0 justify-center gap-1.5">
                        <KeenIcon icon="arrow-left" className="text-sm" />
                        Voltar para modo normal
                    </Link>
                    {/* NOVA PÁGINA SEM SAIR DO MODO DE EDIÇÃO. A ÁRVORE RECARREGA NAS TELAS projetos-paginas (PageDataContext),
                        ENTÃO A PÁGINA CRIADA JÁ APARECE AQUI */}
                    <Link to="/?pag=projetos-paginas&acao=Inserir" className="btn btn-sm btn-primary w-full min-w-0 justify-center gap-1.5">
                        <KeenIcon icon="plus" className="text-sm" />
                        Adicionar página
                    </Link>
                </div>

                {pages.every((page) => page.inativa) && (
                    <span className="px-1 text-2sm text-gray-600">Nenhuma página ativa no projeto.</span>
                )}

                {pages.length > 0 && filtro && paginasVisiveis.length === 0 && (
                    <span className="min-w-0 whitespace-normal [overflow-wrap:anywhere] px-1 text-2sm text-gray-600">{`Nenhuma página, section ou back-end com "${search.trim()}".`}</span>
                )}

                <ul className="flex min-w-0 flex-col gap-0.5">
                    {paginasVisiveis.map((page, indice) => {

                        const chavePagina = 'p' + page.id
                        const paginaAberta = abertosVisiveis.has(chavePagina)

                        //PRIMEIRA DESATIVADA DEPOIS DE UMA ATIVA: SEPARADOR ABAIXO DA ÚLTIMA ATIVA
                        const separador = page.inativa && indice > 0 && !paginasVisiveis[indice - 1].inativa

                        return (
                            <Fragment key={chavePagina}>
                            {separador && <li role="separator" className="mb-1.5 border-b border-gray-300 pb-1.5" />}
                            {/* DESATIVADA: APAGADA (opacity FUNCIONA NOS DOIS TEMAS); A TELA ATUAL OU O HOVER A MOSTRAM INTEIRA */}
                            <li className={clsx('min-w-0 overflow-hidden rounded-md', page.inativa && atual !== chavePagina && 'opacity-60 transition-opacity hover:opacity-100')}>

                                <Linha
                                    nivel={0}
                                    aberto={paginaAberta}
                                    temFilhos={page.sections.length > 0 || !filtro}
                                    onToggle={() => alternar(chavePagina)}
                                    to={page.shared ? '/?pag=projeto-header-footer' : `/?pag=projetos-paginas&acao=Alterar&id=${page.id}`}
                                    ativo={atual === chavePagina}
                                    noGrupo={grupo.has(chavePagina)}
                                    semBarra
                                    titulo={page.inativa ? `${page.name} (desativada)` : page.name}
                                    icone={<KeenIcon icon="document" className="shrink-0 text-base text-gray-500" />}
                                >
                                    <span className="truncate">{page.subpage ? '» ' : ''}<Destaque texto={page.name} termo={termo} /></span>
                                </Linha>

                                {paginaAberta && (
                                    <ul className="flex min-w-0 flex-col">
                                        {page.sections.map((section) => {

                                            const chaveSection = 's' + section.id
                                            const sectionAberta = abertosVisiveis.has(chaveSection)

                                            return (
                                                //DESATIVADA: APAGADA COMO AS PÁGINAS DESATIVADAS, COM O ÍCONE DE OLHO CORTADO; A TELA ATUAL OU O
                                                //HOVER A MOSTRAM INTEIRA
                                                <li key={chaveSection} className={clsx('min-w-0', section.inativa && atual !== chaveSection && 'opacity-60 transition-opacity hover:opacity-100')}>

                                                    <Linha
                                                        nivel={1}
                                                        aberto={sectionAberta}
                                                        temFilhos={section.backend.length > 0}
                                                        onToggle={() => alternar(chaveSection)}
                                                        to={`/?pag=projetos-paginas-sections&acao=Alterar&id=${section.id}${page.shared ? '&section_type=ok' : `&parametro=${page.id}`}`}
                                                        ativo={atual === chaveSection}
                                                        noGrupo={grupo.has(chaveSection)}
                                                        titulo={section.inativa ? `${section.name} (desativada)` : section.name}
                                                    >
                                                        {section.type && <Sigla>{section.type === 'header' ? 'CAB' : 'ROD'}</Sigla>}
                                                        {section.clone && <Sigla>CLONE</Sigla>}
                                                        <span className="truncate"><Destaque texto={section.name} termo={termo} /></span>
                                                        {section.inativa && <KeenIcon icon="eye-slash" className="ms-auto shrink-0 text-xs text-gray-500" />}
                                                    </Linha>

                                                    {sectionAberta && (
                                                        <ul className="flex min-w-0 flex-col">
                                                            {section.backend.map((backend) => (
                                                                <li key={'b' + backend.id} className="min-w-0">
                                                                    <Linha
                                                                        nivel={2}
                                                                        to={`/?pag=projetos-paginas-sections-backend&acao=Alterar&id=${backend.id}&parametros=${section.id}${page.shared ? '&section_type=ok' : `&parametro=${page.id}`}`}
                                                                        ativo={atual === 'b' + backend.id}
                                                                        noGrupo={grupo.has('b' + backend.id)}
                                                                        titulo={`[${backend.type}] ${backend.name}`}
                                                                    >
                                                                        <Sigla>{backend.type}</Sigla>
                                                                        <span className="truncate"><Destaque texto={backend.name} termo={termo} /></span>
                                                                    </Linha>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                </li>
                                            )

                                        })}

                                        {/* NOVA SECTION NA PÁGINA SEM SAIR DO MODO DE EDIÇÃO (COMO O "Adicionar página"). CABEÇALHO E RODAPÉ
                                            USAM O MESMO ENDEREÇO DO projeto-header-footer LEGADO (section_type=ok). FORA DA BUSCA */}
                                        {!filtro && (
                                            <li className="min-w-0">
                                                <Link
                                                    to={page.shared ? '/?pag=projetos-paginas-sections&acao=Inserir&section_type=ok' : `/?pag=projetos-paginas-sections&acao=Inserir&parametro=${page.id}`}
                                                    className="flex min-h-8 w-full min-w-0 items-center gap-1.5 pe-2 text-[13px] font-medium text-primary transition-colors hover:bg-gray-100"
                                                    style={{ paddingInlineStart: 4 + 14 }}
                                                >
                                                    <span className="flex size-5 shrink-0 items-center justify-center">
                                                        <KeenIcon icon="plus" className="text-xs" />
                                                    </span>
                                                    <span className="truncate">Adicionar section</span>
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                )}

                            </li>
                            </Fragment>
                        )

                    })}
                </ul>

                {/* ATALHO PARA O textos-e-imagens: IMAGENS E TEXTOS USADOS PELAS SECTIONS SÃO CADASTRADOS LÁ. FORA DA BUSCA */}
                {!filtro && (
                    <div className="min-w-0 border-t border-gray-300 pt-1.5">
                        {/* MESMO CANTO DAS PÁGINAS: A Linha NÃO ARREDONDA, QUEM ARREDONDA É O BLOCO EM VOLTA */}
                        <div className="min-w-0 overflow-hidden rounded-md">
                        <Linha
                            nivel={0}
                            to={linkDosTextos}
                            ativo={new URLSearchParams(location.search).get('pag') === 'textos-e-imagens'}
                            semBarra
                            titulo="Textos e imagens"
                            icone={<KeenIcon icon="picture" className="shrink-0 text-base text-gray-500" />}
                        >
                            <span className="truncate">Textos e imagens</span>
                        </Linha>
                        </div>
                    </div>
                )}

            </div>
        )

    }

    export { SidebarEditorTree }
