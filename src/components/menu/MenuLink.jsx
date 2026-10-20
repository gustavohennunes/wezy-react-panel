import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { propsDeBotao } from './keyboard'

// LINK DO ITEM DO MENU: <a> PARA LINK EXTERNO, <Link> DO ROUTER PARA ROTA INTERNA. ITEM COM SUBMENU (OU SEM path) É UM
// "BOTÃO" (div COM role/teclado — VER propsDeBotao) QUE ABRE O SUBMENU OU SÓ EXECUTA O CLIQUE
const MenuLink = ({
    path,
    newTab,
    hasItemSub = false,
    externalLink,
    className,
    handleToggle,
    handleClick,
    children,
}) => {

    const classe = clsx('menu-link', className)

    if (hasItemSub || !path) {
        return (
            <div className={classe} {...propsDeBotao(hasItemSub ? handleToggle : handleClick)}>
                {children}
            </div>
        )
    }

    if (externalLink) {
        return (
            <a href={path} target={newTab ? '_blank' : '_self'} rel="noopener" onClick={handleClick} className={classe}>
                {children}
            </a>
        )
    }

    return (
        <Link to={path} onClick={handleClick} className={classe}>
            {children}
        </Link>
    )

}

export { MenuLink }
