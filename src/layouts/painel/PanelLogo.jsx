import { PANEL_LOGO } from '@/config/branding'
import { useMenus } from '@/providers'

// LOGO DO PAINEL (SIDEBAR E CABEÇALHO DO MOBILE). COM "Usar logotipo customizado" NO CADASTRO DO CLIENTE (CARTÃO
// clientes > Customização) O panel/menus MANDA logo (TEMA CLARO) E logo_dark (TEMA ESCURO), CADA UMA OPCIONAL.
// CADA TEMA É INDEPENDENTE: SEM A IMAGEM DAQUELE TEMA, ELE MOSTRA O PADRÃO (PANEL_LOGO, CAYMAN). A TROCA É SÓ CSS (dark:),
// ACOMPANHA O TEMA NA HORA. O brightness(100) (LOGO BRANCO NO ESCURO) É SÓ PARA O PADRÃO — NUM JPG DO CLIENTE DEIXARIA
// A IMAGEM INTEIRA BRANCA
const PanelLogo = ({ width = 135 }) => {

    const { getMenuConfig } = useMenus()
    const menu = getMenuConfig('primary')

    const logoClaro  = menu?.logo
    const logoEscuro = menu?.logo_dark

    return (
        <>
            <img
                src={logoClaro || PANEL_LOGO}
                alt="Logo"
                className="dark:hidden"
                style={{ width, height: logoClaro ? 'auto' : undefined }}
            />
            <img
                src={logoEscuro || PANEL_LOGO}
                alt="Logo"
                className="hidden dark:block"
                style={{ width, height: logoEscuro ? 'auto' : undefined, filter: logoEscuro ? undefined : 'brightness(100)' }}
            />
        </>
    )

}

export { PanelLogo }
