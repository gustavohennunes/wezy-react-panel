
import { KeenIcon, MenuIcon, MenuItem, MenuLink, MenuSub, MenuTitle } from '@/components'

const DropdownCard2 = () => {

    return (
        <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
            <MenuItem>
                <MenuLink path="?pag=meus-pagamentos">
                    <MenuIcon>
                        <KeenIcon icon="eye" />
                    </MenuIcon>
                    <MenuTitle>Visualizar faturas</MenuTitle>
                </MenuLink>
            </MenuItem>
        </MenuSub>
    )

}

export { DropdownCard2 }
