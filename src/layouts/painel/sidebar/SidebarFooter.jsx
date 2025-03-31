    import React, { forwardRef, useRef } from 'react'
    import { toAbsoluteUrl } from '@/utils'
    import { useAuthContext } from '@/auth'
    import { KeenIcon, Menu, MenuItem, MenuLink, MenuToggle, MenuIcon, MenuTitle } from '@/components'
    import { DropdownUserPanel } from '@/partials/dropdowns/user'
    import { useLanguage } from '@/i18n'
    import { useAuth } from '@/auth/providers/JWTProvider'

    const SidebarFooter = forwardRef((props, ref) => {

        const { logout } = useAuthContext()
        const itemUserRef = useRef(null)
        const { isRTL } = useLanguage()
        const { userInfos } = useAuth();

        return (
            <div ref={ref} className="flex flex-center flex-col">

                <MenuItem className="active mb-4 mx-4">
                    <MenuLink
                        path={'https://'+userInfos?.user?.main_domain}
                        newTab={true}
                        externalLink={true}
                        className={'gap-2.5 py-2 px-2.5 justify-center rounded-md border-2 border-solid menu-item-active:border-gray-300 menu-item-active:bg-light'}
                    >
                        <MenuIcon className="items-center text-lg text-gray-600 menu-item-active:text-gray-800 menu-item-here:text-gray-800 menu-item-show:text-gray-800 menu-link-hover:text-gray-800 dark:menu-item-active:text-gray-900 dark:menu-item-here:text-gray-900 dark:menu-item-show:text-gray-900 dark:menu-link-hover:text-gray-900">
                            <KeenIcon icon="youtube" style="outline" />
                        </MenuIcon>
                        <MenuTitle className="text-sm text-gray-800 grow-0 font-medium menu-item-here:text-gray-900 menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                            Ir para player
                        </MenuTitle>
                    </MenuLink>
                </MenuItem>

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
                        <div
                            onClick={logout}
                            className="btn btn-icon btn-icon-lg size-8 hover:bg-light hover:text-primary text-gray-600"
                        >
                            <KeenIcon icon="exit-right" />
                        </div>
                    </div>

                </div>

            </div>

        )

    })

    export { SidebarFooter }
