    import { forwardRef, useRef } from 'react'
    import clsx from 'clsx'
    import { toAbsoluteUrl } from '@/utils'
    import { useAuthContext } from '@/auth'
    import { KeenIcon, Menu, MenuItem, MenuSub, MenuToggle } from '@/components'
    import { DropdownUserPanel } from '@/partials/dropdowns/user'
    import { useLanguage } from '@/i18n'
    import { useMenus } from '@/providers'
    import { lerUsoDeDisco, tamanhoLegivel } from '@/utils/usoDeDisco'
    import { BarraDeUso } from '@/components/ui/barra-de-uso'

    const AVATAR_PADRAO = '/media/avatars/gray/6.png'

    const UsoDeDisco = ({ uso }) => {

        const { percentual, nivel, barra, texto } = lerUsoDeDisco(uso)

        return (
            <div className="rounded-lg border border-gray-200 bg-light px-3 py-2.5">

                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-2xs font-medium text-gray-700">
                        <KeenIcon icon="cloud" className="text-sm text-gray-500" />
                        Armazenamento
                    </span>
                    {percentual !== null && (
                        <span className={clsx('text-2xs font-semibold tabular-nums', texto)}>
                            {percentual}%
                        </span>
                    )}
                </div>

                {/* h-1.5 E bg-gray-200 MANTÊM A ALTURA E O FUNDO DE ANTES */}
                {percentual !== null && <BarraDeUso percentual={percentual} classeDaBarra={barra} className="h-1.5 mb-1.5" />}

                <div className="text-2xs text-gray-600 tabular-nums">
                    <span className="font-medium text-gray-800">{tamanhoLegivel(uso.used)}</span> de {tamanhoLegivel(uso.plan)}
                    {nivel === 'critico' && <span className="text-danger"> · quase cheio</span>}
                </div>

            </div>
        )

    }

    const SidebarFooter = forwardRef((props, ref) => {

        const { logout, usuarioLogado } = useAuthContext()
        const itemUserRef = useRef(null)
        const { isRTL } = useLanguage()
        const { getMenuConfig } = useMenus()

        //USO DE DISCO DO CLIENTE ENVIADO PELO panel/menus (false QUANDO O LEGADO NÃO MOSTRAVA)
        const uso = getMenuConfig('primary')?.usage

        return (
            <div ref={ref} className="flex flex-col gap-2.5 shrink-0 px-3.5 pt-1 pb-3.5">

                {uso?.used && <UsoDeDisco uso={uso} />}

                <div className="flex items-center gap-1.5">

                    <Menu data-menu="true" className="grow min-w-0">
                        <MenuItem
                            ref={itemUserRef}
                            className="w-full"
                            toggle="dropdown"
                            trigger="click"
                            dropdownProps={{
                                placement: isRTL() ? 'right-start' : 'right-end',
                                modifiers: [
                                    {
                                        name: 'offset',
                                        options: {
                                            offset: isRTL() ? [10, 15] : [-10, 15], // [skid, distance]
                                        },
                                    },
                                ],
                            }}
                        >
                            {/* NOME E E-MAIL NO PRÓPRIO RODAPÉ: ANTES SÓ O AVATAR, SEM DIZER QUEM ESTÁ LOGADO */}
                            <MenuToggle
                                className="flex items-center gap-2.5 w-full min-w-0 rounded-lg px-1.5 py-1.5 text-start hover:bg-light menu-item-show:bg-light transition-colors"
                            >
                                <img
                                    className="size-8 rounded-full border border-gray-300 object-cover shrink-0"
                                    src={usuarioLogado?.foto || toAbsoluteUrl(AVATAR_PADRAO)}
                                    onError={(e) => { e.currentTarget.src = toAbsoluteUrl(AVATAR_PADRAO) }}
                                    alt=""
                                />
                                <span className="flex flex-col min-w-0 grow">
                                    <span className="text-2sm font-semibold text-gray-900 truncate leading-5">
                                        {usuarioLogado?.nome || 'Minha conta'}
                                    </span>
                                    {usuarioLogado?.email && (
                                        <span className="text-2xs text-gray-600 truncate leading-4">
                                            {usuarioLogado.email}
                                        </span>
                                    )}
                                </span>
                                <KeenIcon icon="dots-vertical" className="text-base text-gray-500 shrink-0" />
                            </MenuToggle>
                            <MenuSub className="menu-default light:border-gray-300 w-[250px]" rootClassName="p-0">
                                <DropdownUserPanel />
                            </MenuSub>
                        </MenuItem>
                    </Menu>

                    <button
                        type="button"
                        onClick={logout}
                        aria-label="Sair"
                        title="Sair"
                        className="btn btn-icon btn-icon-lg size-9 shrink-0 rounded-lg text-gray-600 hover:bg-light hover:text-danger"
                    >
                        <KeenIcon icon="exit-right" />
                    </button>

                </div>

            </div>

        )

    })

    SidebarFooter.displayName = 'SidebarFooter'

    export { SidebarFooter }
