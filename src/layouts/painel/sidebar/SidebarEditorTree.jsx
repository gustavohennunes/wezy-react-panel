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

        const abertos = new Set()
        let atual = null

        pages.forEach((page) => {

            if (
                (pag === 'projetos-paginas' && id === page.id) ||
                (['projetos-paginas-sections', 'projetos-paginas-sections-backend', 'projetos-paginas-sections-css', 'projetos-paginas-sections-js'].includes(pag) && parametro === page.id)
            ) {
                abertos.add('p' + page.id)
                if (pag === 'projetos-paginas') atual = 'p' + page.id
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
                    if (pag === 'projetos-paginas-sections') atual = 's' + section.id
                }

                if (backendAtual) atual = 'b' + id

            })

        })

        return { abertos, atual }

    }

    //SIGLA DO TIPO DE BACK-END ([HEAD], [PARA]...) E DE SECTION CLONADA
    const Sigla = ({ children }) => (
        <span className="shrink-0 rounded bg-gray-100 px-1 py-px font-mono text-[9px] font-semibold leading-4 text-gray-600">
            {children}
        </span>
    )

    const Linha = ({ nivel, aberto, temFilhos, onToggle, to, ativo, icone, children, titulo }) => (
        <div
            className={clsx(
                'group flex min-h-8 w-full min-w-0 items-center gap-1 rounded-md pe-2 transition-colors',
                ativo ? 'bg-primary-light text-primary' : 'text-gray-800 hover:bg-gray-100'
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

        const { abertos: abertosDaUrl, atual } = useMemo(
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
            <div className="flex w-full min-w-0 flex-col gap-3 overflow-hidden px-3.5">

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
                            <li key={chavePagina} className="min-w-0">

                                <Linha
                                    nivel={0}
                                    aberto={paginaAberta}
                                    temFilhos={page.sections.length > 0}
                                    onToggle={() => alternar(chavePagina)}
                                    to={`/?pag=projetos-paginas&acao=Alterar&id=${page.id}`}
                                    ativo={atual === chavePagina}
                                    titulo={page.name}
                                    icone={<KeenIcon icon="document" className="shrink-0 text-base text-gray-500" />}
                                >
                                    <span className="truncate">{page.subpage ? '» ' : ''}{page.name}</span>
                                </Linha>

                                {paginaAberta && (
                                    <ul className="flex min-w-0 flex-col gap-0.5">
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
                                                        titulo={section.name}
                                                    >
                                                        {section.clone && <Sigla>CLONE</Sigla>}
                                                        <span className="truncate">{section.name}</span>
                                                    </Linha>

                                                    {sectionAberta && (
                                                        <ul className="flex min-w-0 flex-col gap-0.5">
                                                            {section.backend.map((backend) => (
                                                                <li key={'b' + backend.id} className="min-w-0">
                                                                    <Linha
                                                                        nivel={2}
                                                                        to={`/?pag=projetos-paginas-sections-backend&acao=Alterar&id=${backend.id}&parametros=${section.id}&parametro=${page.id}`}
                                                                        ativo={atual === 'b' + backend.id}
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
