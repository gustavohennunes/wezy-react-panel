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
import { buildApiUrl } from '@/utils/urlHelper'
import { api } from '@/services/api'
import { useLanguage } from '@/i18n'
import { toast } from 'sonner'
import { transformOldIcon } from '@/lib/transformOldIcon'
const DataRowActionsMenu = ({ row }) => {
    const { isRTL } = useLanguage()

    const removeRow = (url) => {
        //TODO excluir da API menu ações
        let response = '';
        console.log('Linha a ser excluida: ' + url)
        try {
            //response = api.post(buildApiUrl(url));
        } catch (err) {
            toast(`Error atualizar`, {
                description: `❌ Erro ao excluir item.`
            })
            setError(err)
        } finally {
            toast(`Sucesso`, {
                description: response?.success?.response.data.message
            })
        }
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
                        row.content.map((item, index) => {
                            var icon = transformOldIcon(item.icon)
                            return (<MenuItem
                                key={index}
                                path={item.url || '#'}
                                target={item.target || '_self'}
                                onClick={(e, props) => {
                                    e.preventDefault()
                                    const params = new URLSearchParams(props.path)

                                    if (params.has("excluir")) {
                                        const idExcluir = params.get("excluir");
                                        removeRow(idExcluir)
                                    } else {
                                        //window.location.href = props.path
                                    }
                                }}
                            >
                                <MenuLink>
                                    <MenuIcon>
                                        <KeenIcon icon={icon.icon} style={icon.type} />
                                    </MenuIcon>
                                    <MenuTitle>{item.title}</MenuTitle>
                                </MenuLink>
                            </MenuItem>
                        )})
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
