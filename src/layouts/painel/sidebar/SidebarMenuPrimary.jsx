
    import clsx from 'clsx'
    import { KeenIcon } from '@/components/keenicons'
    import { Menu, MenuArrow, MenuIcon, MenuItem, MenuLink, MenuSub, MenuTitle } from '@/components/menu'
    import { MenuModuloProvider } from '@/components/menu/MenuModulo'
    import { moduloDaUrl } from '@/components/menu/utils'
    import { usePageData } from '@/context/PageDataContext'
    import { useLocation } from 'react-router-dom'
    import { useMenus } from '@/providers'
    import { iconeDoMenu } from '@/lib/transformOldIcon'
    import { OldIcon } from '@/components/legacy/OldIcon'
    import { SidebarEditorTree } from './SidebarEditorTree'
    import { useMemo } from 'react'
    import { DestaqueBusca } from './DestaqueBusca'
    import { normalizarBusca } from '@/utils/normalizarBusca'
    import { comChaves } from '@/utils/chavesUnicas'
    import { urlDoPainelMestre } from '@/utils/painelMestre'

    //CHAVE DO ITEM PELO LINK (OU PELO TÍTULO, NOS GRUPOS SEM LINK)
    const chaveDoItem = (item) => item.path || item.title

    const iconeDoItem = iconeDoMenu

    //BUSCA NO MENU: ANTES SÓ OS ITENS SOLTOS DO 1º NÍVEL ERAM FILTRADOS (E SEM IGNORAR ACENTO) — OS GRUPOS APARECIAM SEMPRE,
    //FECHADOS E SEM FILTRAR OS FILHOS, ENTÃO "formas de doar" NÃO ACHAVA O ITEM DENTRO DO GRUPO "Formas de doar".
    //AGORA: GRUPO QUE BATE VEM INTEIRO E ABERTO; GRUPO COM FILHO QUE BATE VEM ABERTO SÓ COM OS FILHOS QUE BATEM
    const filtrarMenu = (items, termo) =>
        items.reduce((lista, item) => {

            if (item.disabled) return lista

            const bate = normalizarBusca(item.title).includes(termo)

            if (item.children) {
                if (bate) {
                    lista.push({ ...item, aberto: true })
                } else {
                    const filhos = filtrarMenu(item.children, termo)
                    if (filhos.length > 0) lista.push({ ...item, children: filhos, aberto: true })
                }
            } else if (bate) {
                lista.push(item)
            }

            return lista

        }, [])

    //MÓDULO DE UM LINK DO MENU OU DO BREADCRUMB ("?pag=x", "index.php?pag=x&amp;cliente=")
    const moduloDoLink = (href) => {
        const inicio = (href || '').indexOf('?')
        return inicio < 0 ? '' : moduloDaUrl(href.slice(inicio).replace(/&amp;/g, '&'))
    }

    //O MÓDULO TEM LINK EM ALGUM NÍVEL DO MENU?
    const menuTemModulo = (items, modulo) =>
        (items || []).some((item) => moduloDoLink(item?.path) === modulo || menuTemModulo(item?.children, modulo))

    //TELA FORA DO MENU (ex.: CSS/JS/BACK-END DE CABEÇALHO, ?pag=projetos-paginas-sections-css): O ITEM A DESTACAR É O
    //MÓDULO MAIS PRÓXIMO NO BREADCRUMB QUE ESTÁ NO MENU ("Cabeçalho/Rodapé" = ?pag=projeto-header-footer), E O GRUPO DELE
    //("Restrito") FICA ABERTO. CABEÇALHO/RODAPÉ TEM PRIORIDADE NAS ABAS DA SECTION, MESMO SE A ABA ESTÁ NO MENU.
    const moduloDoMenu = (items, moduloAtual, breadcrumbs, paisDosModulos = {}) => {

        if (!items || !moduloAtual) return ''

        const modulos = typeof breadcrumbs === 'string'
            ? Array.from(breadcrumbs.matchAll(/href=["']([^"']*)["']/gi), ([, href]) => moduloDoLink(href))
            : []

        const abaDaSection = ['projetos-paginas-sections', 'projetos-paginas-sections-css', 'projetos-paginas-sections-js', 'projetos-paginas-sections-backend'].includes(moduloAtual)
        if (abaDaSection && modulos.includes('projeto-header-footer') && menuTemModulo(items, 'projeto-header-footer')) {
            return 'projeto-header-footer'
        }

        if (menuTemModulo(items, moduloAtual)) return ''

        //SUBPÁGINAS COMO FORMULÁRIOS/WHATSAPP/LGPD DESTACAM FERRAMENTAS, PELOS VÍNCULOS DA ESTRUTURA DO CLIENTE.
        const paiVisivel = (paisDosModulos[moduloAtual] || []).find((modulo) => menuTemModulo(items, modulo))
        if (paiVisivel) return paiVisivel

        return modulos.reverse().find((modulo) => modulo && modulo !== moduloAtual && menuTemModulo(items, modulo)) || ''

    }

    const SidebarMenuPrimary = ({ search = '' }) => {

        const termo = normalizarBusca(search).trim()

        const subIndetion = ['ps-7', 'ps-2.5', 'ps-2.5']

        const buildMenu = (items) => {

            return comChaves(items?.main, chaveDoItem).map(({ item, chave }) => {

                if (!item.heading && !item.disabled && item.title != 'Dashboards') {
                    return buildMenuItemRoot(item, chave, 0)
                }

                return null

            })

        }

        const buildMenuItemRoot = (item, chave, level) => {

            var icon = iconeDoItem(item)

            if (item.children) {

                //COM BUSCA O GRUPO REMONTA (key) JÁ ABERTO (open SÓ VALE NA MONTAGEM); SEM BUSCA VOLTA AO NORMAL
                return (
                    <MenuItem key={termo ? 'busca-' + chave : chave} toggle="accordion" trigger="click" open={!!item.aberto}>
                        <MenuLink className="gap-2.5 py-2 px-2.5 rounded-md border border-transparent">
                            <MenuIcon className="items-start text-gray-600 text-lg menu-item-here:text-gray-800 menu-item-show:text-gray-800 menu-link-hover:text-gray-800 dark:menu-item-here:text-gray-900 dark:menu-item-show:text-gray-900 dark:menu-link-hover:text-gray-900">
                                <OldIcon icon={icon} />
                            </MenuIcon>
                            <MenuTitle className="font-medium text-sm text-gray-800 menu-item-here:text-gray-900 menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                                <DestaqueBusca texto={item.title} termo={termo} />
                            </MenuTitle>
                            {buildMenuArrow()}
                        </MenuLink>
                        <MenuSub
                            className={clsx(
                                'menu-accordion gap-px',
                                subIndetion[level]
                            )}
                        >
                            {buildMenuItemChildren(item.children, level + 1)}
                        </MenuSub>
                    </MenuItem>
                )

            } else {

                //VERIFICA SE O ITEM É O ATUAL (A BUSCA JÁ FOI APLICADA NO filtrarMenu)
                let className = "";
                if (item.path == window.location.search) {
                    className = "active"
                }

                return (
                    <MenuItem key={chave} className={className}>
                        <MenuLink
                            path={item.path}
                            className={clsx(
                                'gap-2.5 py-2 px-2.5 rounded-md border border-transparent menu-item-active:border-gray-200 menu-item-active:bg-light menu-link-hover:bg-light menu-link-hover:border-gray-200'
                            )}
                        >
                            <MenuIcon className="items-start text-lg text-gray-600 menu-item-active:text-gray-800 menu-item-here:text-gray-800 menu-item-show:text-gray-800 menu-link-hover:text-gray-800 dark:menu-item-active:text-gray-900 dark:menu-item-here:text-gray-900 dark:menu-item-show:text-gray-900 dark:menu-link-hover:text-gray-900">
                                <OldIcon icon={icon} />
                                {/* {item.icon && <KeenIcon icon={item.icon} />} */}
                            </MenuIcon>
                            <MenuTitle className="text-sm text-gray-800 font-medium menu-item-here:text-gray-900 menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                                <DestaqueBusca texto={item.title} termo={termo} />
                            </MenuTitle>
                        </MenuLink>
                    </MenuItem>
                )

            }

        }

        const buildMenuItemChildren = (items, level = 0) => {

            return comChaves(items, chaveDoItem).map(({ item, chave }) => (item.disabled ? null : buildMenuItemChild(item, chave, level)))

        }

        const buildMenuItemChild = (item, chave, level = 0) => {

            var icon = iconeDoItem(item)

            if (item.children) {

                return (
                    <MenuItem
                        key={termo ? 'busca-' + chave : chave}
                        toggle="accordion"
                        trigger="click"
                        open={!!item.aberto}
                        className={clsx(item.collapse && 'flex-col-reverse')}
                    >
                        <MenuLink className="py-2 px-2.5 rounded-md border border-transparent">
                            <MenuIcon className="text-gray-600">
                                <OldIcon icon={icon} />
                            </MenuIcon>
                            {item.collapse ? (
                                <MenuTitle className="text-2sm text-gray-600 menu-item-here:text-gray-800 menu-item-show:text-gray-800 menu-link-hover:text-gray-800 dark:menu-item-here:text-gray-900 dark:menu-item-show:text-gray-900 dark:menu-link-hover:text-gray-900">
                                    <span className="hidden menu-item-show:!flex">
                                        {item.collapseTitle}
                                    </span>
                                    <span className="flex menu-item-show:hidden">
                                        {item.expandTitle}
                                    </span>
                                </MenuTitle>
                            ) : (
                                <MenuTitle className="text-2sm text-gray-800 menu-item-active:text-gray-900 menu-item-here:text-gray-900 menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                                    <DestaqueBusca texto={item.title} termo={termo} />
                                </MenuTitle>
                            )}

                            {buildMenuArrow()}
                        </MenuLink>
                        <MenuSub
                            className={clsx(
                                'menu-accordion gap-px',
                                !item.collapse && subIndetion[level]
                            )}
                        >
                            {buildMenuItemChildren(item.children, item.collapse ? level : level + 1)}
                        </MenuSub>
                    </MenuItem>
                )

            } else {

                //master_panel (ex.: "Módulos" DO "Acesso restrito"): ABRE NO PAINEL MESTRE, NUMA ABA NOVA
                return (
                    <MenuItem key={chave}>
                        <MenuLink
                            path={item.master_panel ? urlDoPainelMestre(item.path) : item.path}
                            externalLink={!!item.master_panel}
                            newTab={!!item.master_panel}
                            className="py-2 px-2.5 rounded-md border border-transparent menu-item-active:border-gray-200 menu-item-active:bg-light menu-link-hover:bg-light menu-link-hover:border-gray-200"
                        >
                            <MenuIcon className="items-start text-lg text-gray-600 pr-2 menu-item-active:text-gray-800 menu-item-here:text-gray-800 menu-item-show:text-gray-800 menu-link-hover:text-gray-800 dark:menu-item-active:text-gray-900 dark:menu-item-here:text-gray-900 dark:menu-item-show:text-gray-900 dark:menu-link-hover:text-gray-900">
                                <OldIcon icon={icon} />
                            </MenuIcon>
                            <MenuTitle className="text-2sm text-gray-800 menu-item-active:text-gray-900 menu-link-hover:text-gray-900">
                                <DestaqueBusca texto={item.title} termo={termo} />
                            </MenuTitle>
                        </MenuLink>
                    </MenuItem>
                )

            }

        }

        const buildMenuArrow = () => {

            return (
                <MenuArrow className="text-gray-600 menu-item-here:text-gray-800 menu-item-show:text-gray-800 menu-link-hover:text-gray-800">
                    <KeenIcon
                        icon="down"
                        className="text-xs menu-item-show:hidden"
                    />
                    <KeenIcon
                        icon="up"
                        className="text-xs hidden menu-item-show:inline-flex"
                    />
                </MenuArrow>
            )

        }

        const { getMenuConfig } = useMenus()

        const menuConfig = getMenuConfig('primary')

        //MENU JÁ FILTRADO PELA BUSCA (null = SEM BUSCA)
        const menuFiltrado = useMemo(
            () => (termo && menuConfig?.main ? { ...menuConfig, main: filtrarMenu(menuConfig.main, termo) } : null),
            [menuConfig, termo]
        )

        const location     = useLocation()
        const { pageData } = usePageData() || {}
        const breadcrumbs  = pageData?.params?.breadcrumbs
        const moduloMenu   = useMemo(
            () => moduloDoMenu(menuConfig?.main, moduloDaUrl(location.search), breadcrumbs, menuConfig?.module_parents),
            [menuConfig, location.search, breadcrumbs]
        )

        //MODO DE EDIÇÃO DO SITE (ACESSO DE SUPORTE): A ÁRVORE DO PROJETO NO LUGAR DO MENU, COMO O retornaMenu LEGADO
        if (menuConfig?.editor) {
            return <SidebarEditorTree editor={menuConfig.editor} search={search} />
        }

        //COM BUSCA, VÁRIOS GRUPOS ABERTOS AO MESMO TEMPO (SEM ISSO O ACCORDION FECHA OS OUTROS)
        return (
            <MenuModuloProvider value={moduloMenu}>
                <Menu
                    highlight={true}
                    multipleExpand={!!termo}
                    className="flex min-w-0 flex-col w-full gap-1.5 px-3.5"
                >
                    {menuFiltrado && menuFiltrado.main.length === 0 && (
                        <span className="min-w-0 whitespace-normal [overflow-wrap:anywhere] px-2.5 text-2sm text-gray-600">{`Nenhum menu com "${search.trim()}".`}</span>
                    )}
                    {menuConfig && buildMenu(menuFiltrado || menuConfig)}
                </Menu>
            </MenuModuloProvider>
        )
    }

    export { SidebarMenuPrimary }
