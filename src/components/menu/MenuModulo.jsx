import { createContext, useContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { moduloDaUrl } from './utils'

//MÓDULO QUE O MENU DEVE DESTACAR NO LUGAR DO ?pag= DA URL. SERVE PARA TELAS QUE NÃO ESTÃO NO MENU (ex.: CSS/JS/BACK-END
//DE UM CABEÇALHO, QUE É ?pag=projetos-paginas-sections-css) ABRIREM O GRUPO DO MÓDULO DE ONDE VIERAM ("Cabeçalho/Rodapé").
//VAZIO = USA A URL, COMO SEMPRE. QUEM DECIDE O MÓDULO É O SidebarMenuPrimary (PELO BREADCRUMB DA API)
const MenuModuloContext = createContext('')

const MenuModuloProvider = MenuModuloContext.Provider

//useLocation DOS ITENS DO MENU, COM O ?pag= TROCADO PELO MÓDULO DO CONTEXTO
const useMenuLocation = () => {

    const location = useLocation()
    const modulo   = useContext(MenuModuloContext)

    return useMemo(() => {
        if (!modulo || modulo === moduloDaUrl(location.search)) return location
        return { ...location, search: '?pag=' + encodeURIComponent(modulo) }
    }, [location, modulo])

}

export { MenuModuloProvider, useMenuLocation }
