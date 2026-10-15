import { Fragment, useContext } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { useAuthContext } from '@/auth'
import { useLanguage } from '@/i18n'
import { toAbsoluteUrl } from '@/utils'
import { useSettings } from '@/providers/SettingsProvider'
import { DefaultTooltip, KeenIcon } from '@/components'
import { useMenus } from '@/providers'
import { MenuItem, MenuLink, MenuSub, MenuTitle, MenuSeparator, MenuArrow, MenuIcon, } from '@/components/menu'
import { transformOldIcon } from '@/lib/transformOldIcon'
import { OldIcon } from '@/components/legacy/OldIcon'
import { useAuth } from '@/auth/providers/JWTProvider'

const DropdownUserPanel = ({ menuItemRef }) => {

    const { settings, storeSettings } = useSettings();
    const { logout } = useAuthContext();
    const { isRTL } = useLanguage();
    const { getMenuConfig } = useMenus();
    const { usuarioLogado } = useAuth();

    const menuConfig = getMenuConfig('primary')

    const handleThemeMode = (event) => {

        const newThemeMode = event.target.checked ? 'dark' : 'light'
        storeSettings({
            themeMode: newThemeMode,
        })

    }

    const buildHeader = () => {

        return (
            <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
                <div className="flex items-center gap-2">
                    <img
                        className="size-9 rounded-full border-2 border-success object-cover"
                        src={usuarioLogado?.foto || toAbsoluteUrl('/media/avatars/gray/6.png')}
                        onError={(e) => { e.currentTarget.src = toAbsoluteUrl('/media/avatars/gray/6.png') }}
                        alt=""
                    />
                    <div className="flex flex-col gap-1.5">
                        <div className="text-sm text-gray-800 hover:text-primary font-semibold leading-none">
                            {usuarioLogado?.nome}
                        </div>
                        <div className="text-xs text-gray-600 hover:text-primary font-medium leading-none">
                            {usuarioLogado?.email}
                        </div>
                    </div>
                </div>
            </div>
        )

    }

    const buildMenu = (menuConfig) => {

        //O MENU DO USUÁRIO SÃO OS MÓDULOS adm/conf/manu QUE O USUÁRIO ACESSA (PanelMenus.php). SEM NENHUM,
        //SÓ SOBRAVAM OS DOIS SEPARADORES COM UMA DIV VAZIA NO MEIO
        const itens = (menuConfig?.user || []).filter((item) => item.title)

        if (itens.length === 0) {
            return <MenuSeparator />
        }

        return (
            <Fragment>
                <MenuSeparator />
                <div className="flex flex-col">

                    {itens.map((item, index) => {

                        var icon = transformOldIcon(item.icon)

                        return (
                            <MenuItem key={index}>
                                <MenuLink path={item.path}>
                                    <MenuIcon className="menu-icon">
                                        <OldIcon icon={icon} />
                                    </MenuIcon>
                                    <MenuTitle>
                                        {item.title}
                                    </MenuTitle>
                                </MenuLink>
                            </MenuItem>
                        );

                    })}

                </div>
                <MenuSeparator />
            </Fragment>
        )

    }

    const buildFooter = () => {

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
                                onChange={handleThemeMode}
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

    return (
        <MenuSub
            className="menu-default light:border-gray-300 w-[250px]"
            rootClassName="p-0"
        >
            {buildHeader()}
            {buildMenu(menuConfig)}
            {buildFooter()}
        </MenuSub>
    )

}

export { DropdownUserPanel }
