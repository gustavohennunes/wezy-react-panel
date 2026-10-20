import { FormattedMessage } from 'react-intl'
import { useAuthContext } from '@/auth'
import { toAbsoluteUrl } from '@/utils'
import { useSettings } from '@/providers/SettingsProvider'
import { KeenIcon } from '@/components'
import { useMenus } from '@/providers'
import { MenuItem, MenuLink, MenuTitle, MenuSeparator, MenuIcon } from '@/components/menu'
import { transformOldIcon } from '@/lib/transformOldIcon'
import { OldIcon } from '@/components/legacy/OldIcon'
import { comChaves } from '@/utils/chavesUnicas'

const AVATAR_PADRAO = '/media/avatars/gray/6.png'

const CabecalhoDoUsuario = ({ usuario }) => (
    <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
        <div className="flex items-center gap-2">
            <img
                className="size-9 rounded-full border-2 border-success object-cover"
                src={usuario?.foto || toAbsoluteUrl(AVATAR_PADRAO)}
                onError={(e) => { e.currentTarget.src = toAbsoluteUrl(AVATAR_PADRAO) }}
                alt=""
            />
            <div className="flex flex-col gap-1.5">
                <div className="text-sm text-gray-800 hover:text-primary font-semibold leading-none">
                    {usuario?.nome}
                </div>
                <div className="text-xs text-gray-600 hover:text-primary font-medium leading-none">
                    {usuario?.email}
                </div>
            </div>
        </div>
    </div>
)

//O MENU DO USUÁRIO SÃO OS MÓDULOS adm/conf/manu QUE O USUÁRIO ACESSA (PanelMenus.php). SEM NENHUM,
//SÓ SOBRAVAM OS DOIS SEPARADORES COM UMA DIV VAZIA NO MEIO
const ModulosDoUsuario = ({ itens }) => {

    const comTitulo = (itens || []).filter((item) => item.title)

    if (comTitulo.length === 0) {
        return <MenuSeparator />
    }

    return (
        <>
            <MenuSeparator />
            <div className="flex flex-col">
                {comChaves(comTitulo, (item) => item.path || item.title).map(({ item, chave }) => (
                    <MenuItem key={chave}>
                        <MenuLink path={item.path}>
                            <MenuIcon className="menu-icon">
                                <OldIcon icon={transformOldIcon(item.icon)} />
                            </MenuIcon>
                            <MenuTitle>{item.title}</MenuTitle>
                        </MenuLink>
                    </MenuItem>
                ))}
            </div>
            <MenuSeparator />
        </>
    )

}

const RodapeDoUsuario = () => {

    const { settings, storeSettings } = useSettings()
    const { logout } = useAuthContext()

    return (
        <div className="flex flex-col">
            <div className="menu-item mb-0.5">
                {/* A LINHA INTEIRA É O <label>: CLICAR NO ÍCONE OU NO TEXTO TAMBÉM ALTERNA O MODO ESCURO.
                    O .switch VIROU <span> PORQUE <label> DENTRO DE <label> NÃO É VÁLIDO */}
                <label className="menu-link cursor-pointer">
                    <span className="menu-icon">
                        <KeenIcon icon="moon" />
                    </span>
                    <span className="menu-title">
                        <FormattedMessage id="USER.MENU.DARK_MODE" />
                    </span>
                    <span className="switch switch-sm">
                        <input
                            name="theme"
                            type="checkbox"
                            checked={settings.themeMode === 'dark'}
                            onChange={(event) => storeSettings({ themeMode: event.target.checked ? 'dark' : 'light' })}
                            value="1"
                        />
                    </span>
                </label>
            </div>

            <div className="menu-item px-4 py-1.5">
                {/* AÇÃO, NÃO NAVEGAÇÃO: <button> (O <a> SEM href NÃO RECEBIA FOCO PELO TECLADO) */}
                <button
                    type="button"
                    onClick={logout}
                    className="btn btn-sm btn-light justify-center"
                >
                    <FormattedMessage id="USER.MENU.LOGOUT" />
                </button>
            </div>
        </div>
    )

}

// CONTEÚDO DO MENU DO USUÁRIO (DENTRO DO MenuSub QUE O SidebarFooter MONTA — O MenuItem PRECISA DELE COMO FILHO DIRETO)
const DropdownUserPanel = () => {

    const { usuarioLogado } = useAuthContext()
    const { getMenuConfig } = useMenus()

    return (
        <>
            <CabecalhoDoUsuario usuario={usuarioLogado} />
            <ModulosDoUsuario itens={getMenuConfig('primary')?.user} />
            <RodapeDoUsuario />
        </>
    )

}

export { DropdownUserPanel }
