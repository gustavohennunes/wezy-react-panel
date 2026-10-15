    import { forwardRef, useRef } from 'react'
    import clsx from 'clsx'
    import { toAbsoluteUrl } from '@/utils'
    import { useAuthContext } from '@/auth'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components'
    import { DropdownUserPanel } from '@/partials/dropdowns/user'
    import { useLanguage } from '@/i18n'
    import { useMenus } from '@/providers'

    const AVATAR_PADRAO = '/media/avatars/gray/6.png'

    const UNIDADES = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }

    //"1.3GB" / "500 MB" / "1,3 GB" → BYTES (null QUANDO NÃO DÁ PARA LER: AÍ SÓ O TEXTO APARECE, SEM A BARRA)
    const emBytes = (texto) => {
        const partes = /([\d.,]+)\s*(B|KB|MB|GB|TB)\b/i.exec(String(texto ?? ''))
        if (!partes) return null
        const numero = parseFloat(partes[1].replace(',', '.'))
        return Number.isFinite(numero) ? numero * UNIDADES[partes[2].toUpperCase()] : null
    }

    //"1.3GB" → "1,3 GB"
    const legivel = (texto) =>
        String(texto ?? '')
            .replace(/(\d)\.(\d)/, '$1,$2')
            .replace(/(\d)\s*(B|KB|MB|GB|TB)\b/i, '$1 $2')

    const UsoDeDisco = ({ uso }) => {

        const usado     = emBytes(uso.used)
        const plano     = emBytes(uso.plan)
        const percentual = usado !== null && plano ? Math.min(100, Math.round((usado * 100) / plano)) : null

        //AMARELO A PARTIR DE 75% E VERMELHO A PARTIR DE 90%: O AVISO VAI TAMBÉM NO TEXTO, NÃO SÓ NA COR
        const nivel = percentual === null ? 'normal' : percentual >= 90 ? 'critico' : percentual >= 75 ? 'alerta' : 'normal'

        return (
            <div className="rounded-lg border border-gray-200 bg-light px-3 py-2.5">

                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-2xs font-medium text-gray-700">
                        <KeenIcon icon="cloud" className="text-sm text-gray-500" />
                        Armazenamento
                    </span>
                    {percentual !== null && (
                        <span
                            className={clsx(
                                'text-2xs font-semibold tabular-nums',
                                nivel === 'critico' ? 'text-danger' : nivel === 'alerta' ? 'text-warning' : 'text-gray-600'
                            )}
                        >
                            {percentual}%
                        </span>
                    )}
                </div>

                {percentual !== null && (
                    //BARRA DO METRONIC (.progress / .progress-bar); h-1.5 E bg-gray-200 MANTÊM A ALTURA E O FUNDO DE ANTES
                    <div
                        className={clsx(
                            'progress h-1.5 bg-gray-200 mb-1.5',
                            nivel === 'critico' ? 'progress-danger' : nivel === 'alerta' ? 'progress-warning' : 'progress-primary'
                        )}
                        role="progressbar"
                        aria-label="Uso do armazenamento"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percentual}
                    >
                        <div className="progress-bar transition-[width]" style={{ width: `${Math.max(percentual, 2)}%` }} />
                    </div>
                )}

                <div className="text-2xs text-gray-600 tabular-nums">
                    <span className="font-medium text-gray-800">{legivel(uso.used)}</span> de {legivel(uso.plan)}
                    {nivel === 'critico' && <span className="text-danger"> · quase cheio</span>}
                </div>

            </div>
        )

    }

    const SidebarFooter = forwardRef((props, ref) => {

        const { logout } = useAuthContext()
        const { usuarioLogado } = useAuth()
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
                            {DropdownUserPanel({
                                menuItemRef: itemUserRef,
                            })}
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

    export { SidebarFooter }
