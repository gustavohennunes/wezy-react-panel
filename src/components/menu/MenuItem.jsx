import { ClickAwayListener, Popper } from '@mui/base'
import clsx from 'clsx'
import { Children, cloneElement, forwardRef, isValidElement, memo } from 'react'
import { MenuHeading } from './MenuHeading'
import { MenuLabel } from './MenuLabel'
import { MenuLink } from './MenuLink'
import { MenuSub } from './MenuSub'
import { MenuToggle } from './MenuToggle'
import { useMenuItem } from './useMenuItem'

//SUBMENU EM DROPDOWN: FLUTUA AO LADO DO ITEM (Popper) E FECHA NO CLIQUE FORA
const SubmenuDropdown = ({ child, aberto, ancora, zIndex, trigger, dropdownProps, onFechar }) => (
    <Popper
        style={{
            zIndex,
            pointerEvents: trigger === 'click' ? 'auto' : 'none',
        }}
        {...dropdownProps}
        anchorEl={aberto ? ancora : null}
        open={aberto}
        autoFocus={false}
        className={clsx(child.props.rootClassName)}
    >
        <ClickAwayListener onClickAway={onFechar}>
            <div className={clsx('menu-container', child.props.baseClassName)} style={{ pointerEvents: 'auto' }}>
                {child}
            </div>
        </ClickAwayListener>
    </Popper>
)

const MenuItemComponent = forwardRef(function MenuItem(props, ref) {

    const { trigger, dropdownZIndex = 1300, tabIndex, className, containerProps = {}, children, parentId } = props

    const item = useMenuItem(props, ref)
    const { propToggle, hasSub, show, handleToggle, handleClick, handleHide } = item

    //CADA FILHO RECEBE O QUE PRECISA DO ITEM: LINK/LABEL ABREM OU FECHAM E NAVEGAM, TOGGLE SÓ ABRE/FECHA, SUBMENU
    //VIRA DROPDOWN (Popper) OU ACCORDION CONFORME O toggle
    const filhoDoItem = (child) => {

        if (!isValidElement(child)) return child

        switch (child.type) {

            case MenuLink:
            case MenuLabel:
                return cloneElement(child, { hasItemSub: hasSub, tabIndex, handleToggle, handleClick })

            case MenuToggle:
                return cloneElement(child, { hasItemSub: hasSub, tabIndex, handleToggle })

            case MenuHeading:
                return cloneElement(child)

            case MenuSub: {

                const parentIdDoSub = `${parentId}-${item.finalId}`

                if (propToggle === 'dropdown') {
                    return (
                        <SubmenuDropdown
                            child={cloneElement(child, { parentId: parentIdDoSub, toggle: propToggle, handleParentHide: handleHide, tabIndex, menuItemRef: ref })}
                            aberto={show}
                            ancora={item.menuItemRef.current}
                            zIndex={dropdownZIndex}
                            trigger={trigger}
                            dropdownProps={item.propDropdownProps}
                            onFechar={handleHide}
                        />
                    )
                }

                if (propToggle === 'accordion') {
                    return cloneElement(child, {
                        parentId: parentIdDoSub,
                        tabIndex,
                        show,
                        enter: item.accordionEnter,
                        toggle: propToggle,
                        handleClick,
                        handleEntered: item.handleEntered,
                        handleExited: item.handleExited,
                    })
                }

                return child

            }

            default:
                return child

        }

    }

    return (
        <div
            {...containerProps}
            ref={item.menuItemRef}
            tabIndex={tabIndex}
            {...(propToggle === 'dropdown' && {
                onMouseEnter: item.handleMouseEnter,
                onMouseLeave: item.handleMouseLeave,
            })}
            className={clsx(
                'menu-item',
                propToggle === 'dropdown' && 'menu-item-dropdown',
                className,
                item.active && 'active',
                show && 'show',
                item.here && 'here',
                item.transitioning && 'transitioning'
            )}
        >
            {Children.map(children, filhoDoItem)}
        </div>
    )

})

const MenuItem = memo(MenuItemComponent)
export { MenuItem }
