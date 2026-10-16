
    import clsx from 'clsx'
    import { KeenIcon } from '@/components/keenicons'
    import { Menu, MenuArrow, MenuIcon, MenuItem, MenuLink, MenuSub, MenuTitle } from '@/components/menu'
    import { useMenus } from '@/providers'
    import { iconeDoMenu } from '@/lib/transformOldIcon'
    import { OldIcon } from '@/components/legacy/OldIcon'
    import { SidebarEditorTree } from './SidebarEditorTree'
    import { useMemo } from 'react'
    import { DestaqueBusca, normalizarBusca } from '@/utils/buscaSidebar'

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

    const SidebarMenuPrimary = ({ search = '' }) => {

        const termo = normalizarBusca(search).trim()

        const subIndetion = ['ps-7', 'ps-2.5', 'ps-2.5']

        const buildMenu = (items) => {

            return items?.main.map((item, index) => {

                if (!item.heading && !item.disabled && item.title != 'Dashboards') {
                    return buildMenuItemRoot(item, index, 0)
                }

            })

        }

        const buildMenuItemRoot = (item, index, level) => {

            var icon = iconeDoItem(item)

            if (item.children) {

                //COM BUSCA O GRUPO REMONTA (key) JÁ ABERTO (open SÓ VALE NA MONTAGEM); SEM BUSCA VOLTA AO NORMAL
                return (
                    <MenuItem key={termo ? 'busca-' + index : index} toggle="accordion" trigger="click" open={!!item.aberto}>
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
                            {buildMenuItemChildren(item.children, index, level + 1)}
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
                    <MenuItem key={index} className={className}>
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

        const buildMenuItemChildren = (items, index, level = 0) => {

            return items.map((item, index) => {

                if (!item.disabled) {
                    return buildMenuItemChild(item, index, level)
                }

            })

        }

        const buildMenuItemChild = (item, index, level = 0) => {

            var icon = iconeDoItem(item)

            if (item.children) {

                return (
                    <MenuItem
                        key={termo ? 'busca-' + index : index}
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
                            {buildMenuItemChildren(
                                item.children,
                                index,
                                item.collapse ? level : level + 1
                            )}
                        </MenuSub>
                    </MenuItem>
                )

            } else {

                return (
                    <MenuItem key={index}>
                        <MenuLink
                            path={item.path}
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

        //MODO DE EDIÇÃO DO SITE (ACESSO DE SUPORTE): A ÁRVORE DO PROJETO NO LUGAR DO MENU, COMO O retornaMenu LEGADO
        if (menuConfig?.editor) {
            return <SidebarEditorTree editor={menuConfig.editor} search={search} />
        }

        //COM BUSCA, VÁRIOS GRUPOS ABERTOS AO MESMO TEMPO (SEM ISSO O ACCORDION FECHA OS OUTROS)
        return (
            <Menu
                highlight={true}
                multipleExpand={!!termo}
                className="flex flex-col w-full gap-1.5 px-3.5"
            >
                {menuFiltrado && menuFiltrado.main.length === 0 && (
                    <span className="px-2.5 text-2sm text-gray-600">{`Nenhum menu com "${search.trim()}".`}</span>
                )}
                {menuConfig && buildMenu(menuFiltrado || menuConfig)}
            </Menu>
        )
    }

    export { SidebarMenuPrimary }
