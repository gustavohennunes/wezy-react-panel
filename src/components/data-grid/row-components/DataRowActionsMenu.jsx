    import qs from 'qs'
    import { Menu, MenuToggle, KeenIcon, MenuIcon, MenuItem, MenuLink, MenuSeparator, MenuSub, MenuTitle } from '@/components'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { api } from '@/services/api'
    import { useLanguage } from '@/i18n'
    import { toast } from 'sonner'
    import { transformOldIcon } from '@/lib/transformOldIcon'
    import { usePageData } from '@/context/PageDataContext'
    
    const DataRowActionsMenu = ({ row }) => {

        const { isRTL } = useLanguage()
        const { callApi } = usePageData()

        const removeRow = async (itemId) => {

            let response = ''
            const data = {
                items: [itemId],
            }

            const params = new URLSearchParams(window.location.search)
            const slug = params.get('slug') ?? params.get('pag')
            const urlExcluir = `?slug=${slug}&acao=remove-items`

            try {

                response = await api.post(
                    buildApiUrl(urlExcluir),
                    qs.stringify(data),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                )

                const urlRefresh = buildApiUrl(
                    new URLSearchParams(window.location.search)
                )

                callApi(urlRefresh)

                toast(`✅ Sucesso`, {
                    description: <span style={{ 'color': 'white' }}>{response?.success?.response?.data?.message}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-success',
                        fontWeight: 'bold'
                    }
                })

            } catch (err) {

                toast(`❌ Erro`, {
                    description: <span style={{ 'color': 'white' }}>{'Não foi possível remover este item'}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        fontWeight: 'bold'
                    }
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
                        rootClassName="w-full max-w-[250px]"
                    >

                        {Array.isArray(row.content) && row.content.length > 0 ? (

                            row.content.map((item, index) => {

                                var icon = transformOldIcon(item.icon)
                                
                                return (
                                    <MenuItem
                                        key={index}
                                        path={item.url || '#'}
                                        target={item.target || '_self'}
                                        onClick={(e, props) => {

                                            e.preventDefault()

                                            const params = new URLSearchParams(
                                                props.path
                                            )

                                            if (params.has('excluir')) {
                                                
                                                const idExcluir = params.get('excluir')
                                                
                                                removeRow(idExcluir)

                                            } else {
                                                
                                                if(props.target.indexOf('_blank') !== -1) {
                                                    window.open(props.path, '_blank')
                                                } else {
                                                    window.location.href = props.path
                                                }

                                            }

                                        }}
                                    >
                                        <MenuLink>
                                            <MenuIcon>
                                                <KeenIcon
                                                    icon={icon.icon}
                                                    style={icon.type}
                                                />
                                            </MenuIcon>
                                            <MenuTitle>{item.title}</MenuTitle>
                                        </MenuLink>
                                    </MenuItem>
                                )

                            })

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
