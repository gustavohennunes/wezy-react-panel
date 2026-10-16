import { PANEL_LOGO } from '@/config/branding'
import { useMenus } from '@/providers'

// LOGO DO PAINEL (SIDEBAR E CABEÇALHO DO MOBILE). COM "Usar logotipo customizado" NO CADASTRO DO CLIENTE (CARTÃO
// clientes > Customização) O panel/menus MANDA A URL EM logo E ELA ENTRA NO LUGAR DO PADRÃO (PANEL_LOGO, CAYMAN).
// A CUSTOMIZADA É UMA IMAGEM SÓ NOS DOIS TEMAS: O brightness(100) DO DARK DEIXARIA UM JPG INTEIRO BRANCO
const PanelLogo = ({ width = 135 }) => {

    const { getMenuConfig } = useMenus()
    const logoCliente = getMenuConfig('primary')?.logo

    if (logoCliente) {
        return <img src={logoCliente} alt="Logo" style={{ width, height: 'auto' }} />
    }

    return (
        <>
            <img src={PANEL_LOGO} alt="Logo" className="dark:hidden" style={{ width }} />
            <img src={PANEL_LOGO} alt="Logo" className="hidden dark:block" style={{ filter: 'brightness(100)', width }} />
        </>
    )

}

export { PanelLogo }
