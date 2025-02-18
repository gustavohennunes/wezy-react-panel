import { useRef } from 'react'
import { KeenIcon } from '@/components/keenicons'
import { toAbsoluteUrl } from '@/utils'
import { Menu, MenuItem, MenuToggle } from '@/components'
import { DropdownUserPanel } from '@/partials/dropdowns/user'
import { DropdownNotifications } from '@/partials/dropdowns/notifications'
import { DropdownChat } from '@/partials/dropdowns/chat'
import { useLanguage } from '@/i18n'
const HeaderTopbar = () => {
    const itemChatRef = useRef(null)
    const itemUserRef = useRef(null)
    const itemNotificationsRef = useRef(null)
    const { isRTL } = useLanguage()
    const handleDropdownChatShow = () => {
        window.dispatchEvent(new Event('resize'))
    }
    return (
        <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1"></div>

            <Menu>
                <MenuItem
                    ref={itemUserRef}
                    toggle="dropdown"
                    trigger="click"
                    dropdownProps={{
                        placement: isRTL() ? 'bottom-start' : 'bottom-end',
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [20, 10], // [skid, distance]
                                },
                            },
                        ],
                    }}
                >
                    <MenuToggle className="btn btn-icon rounded-full">
                        <img
                            className="size-9 rounded-full justify-center border border-gray-500 shrink-0"
                            src={toAbsoluteUrl('/media/avatars/gray/6.png')}
                            alt=""
                        />
                    </MenuToggle>
                    {DropdownUserPanel({
                        menuItemRef: itemUserRef,
                    })}
                </MenuItem>
            </Menu>
        </div>
    )
}
export { HeaderTopbar }
