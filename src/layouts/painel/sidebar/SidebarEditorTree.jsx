    import { useEffect, useMemo, useState } from 'react'
    import { Link, useLocation } from 'react-router-dom'
    import clsx from 'clsx'
    import { KeenIcon } from '@/components/keenicons'

    // MODO DE EDIÇÃO DO SITE (?pag=ativar-modulo-edicao, ACESSO DE SUPORTE): A SIDEBAR VIRA A ÁRVORE PÁGINAS > SECTIONS >
    // BACK-ENDS, COMO O class/ProjectStructure.php DO PAINEL ANTIGO. OS DADOS VÊM DO panel/menus (data.editor.pages).
    // ABRE SOZINHO O CAMINHO DA TELA ATUAL (MESMAS REGRAS DO buildHtml LEGADO); O RESTO ABRE E FECHA NO CLIQUE

    const caminhosAbertos = (pages, params) => {

        const pag        = params.get('pag') || params.get('slug') || ''
        const id         = params.get('id') || ''
        const parametro  = params.get('parametro') || ''
        const parametros = params.get('parametros') || ''
        const cliente    = params.get('cliente') || ''

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

    const SidebarEditorTree = ({ editor }) => {

        const location = useLocation()
        const pages    = useMemo(() => editor?.pages || [], [editor])

        const { abertos: abertosDaUrl, atual, grupo } = useMemo(
            () => caminhosAbertos(pages, new URLSearchParams(location.search)),
            [pages, location.search]
        )

        //CLIQUE NA SETA ABRE/FECHA; AO TROCAR DE TELA, O CAMINHO DA TELA ATUAL ABRE DE NOVO (COMO O LEGADO)
        const [abertos, setAbertos] = useState(abertosDaUrl)
        useEffect(() => {
            setAbertos((anterior) => new Set([...anterior, ...abertosDaUrl]))
        }, [abertosDaUrl])

        const alternar = (chave) =>
            setAbertos((anterior) => {
                const proximo = new Set(anterior)
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
                </div>

                {pages.length === 0 && (
                    <span className="px-1 text-2sm text-gray-600">Nenhuma página ativa no projeto.</span>
                )}

                <ul className="flex min-w-0 flex-col gap-0.5">
                    {pages.map((page) => {

                        const chavePagina = 'p' + page.id
                        const paginaAberta = abertos.has(chavePagina)

                        return (
                            <li key={chavePagina} className="min-w-0 overflow-hidden rounded-md">

                                <Linha
                                    nivel={0}
                                    aberto={paginaAberta}
                                    temFilhos={page.sections.length > 0}
                                    onToggle={() => alternar(chavePagina)}
                                    to={`/?pag=projetos-paginas&acao=Alterar&id=${page.id}`}
                                    ativo={atual === chavePagina}
                                    noGrupo={grupo.has(chavePagina)}
                                    semBarra
                                    titulo={page.name}
                                    icone={<KeenIcon icon="document" className="shrink-0 text-base text-gray-500" />}
                                >
                                    <span className="truncate">{page.subpage ? '» ' : ''}{page.name}</span>
                                </Linha>

                                {paginaAberta && (
                                    <ul className="flex min-w-0 flex-col">
                                        {page.sections.map((section) => {

                                            const chaveSection = 's' + section.id
                                            const sectionAberta = abertos.has(chaveSection)

                                            return (
                                                <li key={chaveSection} className="min-w-0">

                                                    <Linha
                                                        nivel={1}
                                                        aberto={sectionAberta}
                                                        temFilhos={section.backend.length > 0}
                                                        onToggle={() => alternar(chaveSection)}
                                                        to={`/?pag=projetos-paginas-sections&acao=Alterar&id=${section.id}&parametro=${page.id}`}
                                                        ativo={atual === chaveSection}
                                                        noGrupo={grupo.has(chaveSection)}
                                                        titulo={section.name}
                                                    >
                                                        {section.clone && <Sigla>CLONE</Sigla>}
                                                        <span className="truncate">{section.name}</span>
                                                    </Linha>

                                                    {sectionAberta && (
                                                        <ul className="flex min-w-0 flex-col">
                                                            {section.backend.map((backend) => (
                                                                <li key={'b' + backend.id} className="min-w-0">
                                                                    <Linha
                                                                        nivel={2}
                                                                        to={`/?pag=projetos-paginas-sections-backend&acao=Alterar&id=${backend.id}&parametros=${section.id}&parametro=${page.id}`}
                                                                        ativo={atual === 'b' + backend.id}
                                                                        noGrupo={grupo.has('b' + backend.id)}
                                                                        titulo={`[${backend.type}] ${backend.name}`}
                                                                    >
                                                                        <Sigla>{backend.type}</Sigla>
                                                                        <span className="truncate">{backend.name}</span>
                                                                    </Linha>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                </li>
                                            )

                                        })}
                                    </ul>
                                )}

                            </li>
                        )

                    })}
                </ul>

            </div>
        )

    }

    export { SidebarEditorTree }
