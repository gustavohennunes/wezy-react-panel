    import React, { forwardRef, useRef } from 'react'
    import { toAbsoluteUrl } from '@/utils'
    import { useAuthContext } from '@/auth'
    import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components'
    import { DropdownUserPanel } from '@/partials/dropdowns/user'
    import { useLanguage } from '@/i18n'
    import { useMenus } from '@/providers'

    const SidebarFooter = forwardRef((props, ref) => {

        const { logout } = useAuthContext()
        const itemUserRef = useRef(null)
        const { isRTL } = useLanguage()
        const { getMenuConfig } = useMenus()

        //USO DE DISCO DO CLIENTE ENVIADO PELO panel/menus (false QUANDO O LEGADO NÃO MOSTRAVA)
        const uso = getMenuConfig('primary')?.usage

        return (
            <div ref={ref} className="flex flex-center flex-col">

                {uso?.used && (
                    <div className="px-4 mb-3 text-2xs leading-4 text-gray-600">
                        <span className="font-semibold text-gray-700">Disco utilizado:</span> {uso.used}
                        <br />
                        <span className="font-semibold text-gray-700">Plano atual:</span> {uso.plan}
                    </div>
                )}

                <div className="flex justify-between shrink-0 ps-4 pe-3.5 mb-3.5">

                    <Menu data-menu="true">
                        <MenuItem
                            ref={itemUserRef}
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
                            <MenuToggle className="btn btn-icon rounded-full">
                                <img
                                    className="size-8 rounded-full justify-center border border-gray-500 shrink-0"
                                    src={toAbsoluteUrl('/media/avatars/gray/6.png')}
                                    alt=""
                                />
                            </MenuToggle>
                            {DropdownUserPanel({
                                menuItemRef: itemUserRef,
                            })}
                        </MenuItem>
                    </Menu>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={logout}
                            aria-label="Sair"
                            className="btn btn-icon btn-icon-lg size-8 hover:bg-light hover:text-primary text-gray-600"
                        >
                            <KeenIcon icon="exit-right" />
                        </button>
                    </div>

                </div>

            </div>

        )

    })

    export { SidebarFooter }
