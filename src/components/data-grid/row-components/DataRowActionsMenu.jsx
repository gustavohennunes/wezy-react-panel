import {} from '@/components'
import {
    Menu,
    MenuToggle,
    KeenIcon,
    MenuIcon,
    MenuItem,
    MenuLink,
    MenuSeparator,
    MenuSub,
    MenuTitle,
} from '@/components'
import { useLanguage } from '@/i18n'
const DataRowActionsMenu = ({ row }) => {
    const { isRTL } = useLanguage()

    const removeRow = (id) => {
        //TODO excluir da API menu ações 
        console.log("Linha a ser excluida: "+id)
    }

    return (
        <Menu className="inline-flex">
            <MenuItem
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                    placement: isRTL() ? 'bottom-start' : 'bottom-end',
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
                            },
                        },
                    ],
                }}
            >
                <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                    <KeenIcon icon="dots-vertical" />
                </MenuToggle>

                <MenuSub
                    className="menu-default"
                    rootClassName="w-full max-w-[175px]"
                >
                    {Array.isArray(row.content) && row.content.length > 0 ? (
                        row.content.map((item, index) => (
                            <MenuItem
                                key={index}
                                path={item.url || '#'}
                                target={item.target || '_self'}
                                onClick={(e, props) => {
                                    e.preventDefault();                             
                                    const { path } = props.path;
                                    
                                    if (props.path.startsWith("Javascript:")) {
                                        const match = props.path.match(/removeRow\('(\d+)'\)/);
                                        if (match) {
                                            const rowId = match[1];
                                            removeRow(rowId);
                                        }
                                    } else {
                                        window.location.href = props.path;
                                    }
                                }}
                            >
                                <MenuLink>
                                    <MenuIcon>
                                        <KeenIcon icon="search-list" />
                                    </MenuIcon>
                                    <MenuTitle>{item.title} 2 </MenuTitle>
                                </MenuLink>
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem>
                            <MenuLink>
                                <MenuTitle className="text-gray-500">
                                    Sem ações
                                </MenuTitle>
                            </MenuLink>
                        </MenuItem>
                    )}
                </MenuSub>
            </MenuItem>
        </Menu>
    )
}
export { DataRowActionsMenu }
