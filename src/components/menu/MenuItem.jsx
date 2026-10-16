import { ClickAwayListener, Popper } from '@mui/base'
import clsx from 'clsx'
import React, {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    memo,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import useResponsiveProp from '@/hooks/useResponsiveProp'
import { useMatchPath } from '../../hooks/useMatchPath'
import {
    MenuHeading,
    MenuLabel,
    MenuLink,
    MenuSub,
    MenuToggle,
    useMenu,
} from './'
import { useLocation } from 'react-router-dom'
import { getMenuLinkPath, hasMenuActiveChild, moduloDaUrl } from './utils'
const MenuItemComponent = forwardRef(function MenuItem(props, ref) {
    const {
        toggle,
        trigger,
        dropdownProps,
        dropdownZIndex = 1300,
        disabled,
        tabIndex,
        className,
        handleParentHide,
        onShow,
        onHide,
        onClick,
        containerProps: ContainerPropsProp = {},
        children,
        open = false,
        parentId,
        id,
    } = props
    const { ...containerProps } = ContainerPropsProp
    const menuItemRef = useRef(null)
    const path = props.path || getMenuLinkPath(children)
    const {
        disabled: isMenuDisabled,
        highlight,
        multipleExpand,
        setOpenAccordion,
        isOpenAccordion,
        dropdownTimeout,
    } = useMenu()
    const finalParentId = parentId !== undefined ? parentId : ''
    const finalId = id !== undefined ? id : ''
    const menuContainerRef = useRef(null)

    const hideTimeoutRef = useRef(null)
    //PÁGINA ATUAL = PATHNAME + MÓDULO (?pag=). SÓ O PATHNAME NÃO SERVE: NESTE PAINEL ELE É SEMPRE "/"
    //E OS EFFECTS DE ABRIR/FECHAR O MENU NUNCA DISPARAVAM AO NAVEGAR
    const location = useLocation()
    const rotaAtual = location.pathname + '|' + moduloDaUrl(location.search)
    const rotaAnterior = useRef(rotaAtual)
    const { match } = useMatchPath(path)
    const propToggle = useResponsiveProp(toggle, 'accordion')
    const propTrigger = useResponsiveProp(trigger, 'click')
    const propDropdownProps = useResponsiveProp(dropdownProps)
    const active = highlight ? path.length > 0 && match : false
    const [here, setHere] = useState(open)
    const accordionShow = isOpenAccordion(finalParentId, finalId)
    const [show, setShow] = useState(open)
    const [transitioning, setTransitioning] = useState(open)
    const [accordionEnter, setAccordionEnter] = useState(open)
    const hasSub = Children.toArray(children).some(
        (child) => isValidElement(child) && child.type === MenuSub
    )
    const handleHide = () => {
        if (hasSub) {
            setShow(false)
        }
        if (hasSub && propToggle === 'accordion' && multipleExpand === false) {
            setOpenAccordion(finalParentId, '')
        }
        if (handleParentHide) {
            handleParentHide()
        }
    }
    const handleShow = () => {
        if (hasSub) {
            setShow(true)
        }
        if (hasSub && propToggle === 'accordion' && multipleExpand === false) {
            setOpenAccordion(finalParentId, finalId)
        }
    }
    const handleMouseEnter = (e) => {
        if (isMenuDisabled) return

        // Cancel any previously set hide timeout
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
        }
        if (propTrigger === 'hover') {
            setShow(true)
            if (containerProps.onMouseEnter) {
                containerProps.onMouseEnter(e)
            }
        }
    }
    const handleMouseLeave = (e) => {
        if (isMenuDisabled) return
        if (propTrigger === 'hover') {
            // Set a timeout to hide the dropdown after `dropdownTimeout` delay
            hideTimeoutRef.current = setTimeout(() => {
                setShow(false)
                if (containerProps.onMouseLeave) {
                    containerProps.onMouseLeave(e)
                }
                hideTimeoutRef.current = null // Reset the timeout reference
            }, dropdownTimeout)
        }
    }
    const handleToggle = (e) => {
        if (isMenuDisabled) return
        if (disabled) return
        if (show) {
            if (propToggle === 'accordion') {
                setAccordionEnter(true)
            }
            handleHide()
        } else {
            if (propToggle === 'accordion') {
                setAccordionEnter(true)
            }
            handleShow()
        }
        if (onClick) {
            onClick(e, props)
        }
    }
    const handleClick = (e) => {
        if (disabled) {
            return
        }
        handleHide()
        if (onClick) {
            onClick(e, props)
        }
    }
    const renderLink = (child) => {
        // Add some props to each child
        const modifiedProps = {
            hasItemSub: hasSub,
            tabIndex,
            handleToggle,
            handleClick,
        }

        // Return the child with modified props
        return cloneElement(child, modifiedProps)
    }
    const renderToggle = (child) => {
        // Add some props to each child
        const modifiedProps = {
            hasItemSub: hasSub,
            tabIndex,
            handleToggle,
        }

        // Return the child with modified props
        return cloneElement(child, modifiedProps)
    }
    const renderLabel = (child) => {
        // Add some props to each child
        const modifiedProps = {
            hasItemSub: hasSub,
            tabIndex,
            handleToggle,
            handleClick,
        }

        // Return the child with modified props
        return cloneElement(child, modifiedProps)
    }
    const renderHeading = (child) => {
        return cloneElement(child)
    }
    const renderSubDropdown = (child) => {
        // Add some props to each child
        const modifiedProps = {
            parentId: `${parentId}-${finalId}`,
            toggle: propToggle,
            handleParentHide: handleHide,
            tabIndex,
            menuItemRef: ref,
        }
        const modofiedChild = cloneElement(child, modifiedProps)
        return (
            <Popper
                style={{
                    zIndex: dropdownZIndex,
                    pointerEvents: trigger === 'click' ? 'auto' : 'none',
                }}
                {...propDropdownProps}
                anchorEl={show ? menuItemRef.current : null}
                open={show}
                autoFocus={false}
                className={clsx(
                    child.props.rootClassName && child.props.rootClassName
                )}
            >
                <ClickAwayListener onClickAway={handleHide}>
                    <div
                        className={clsx(
                            'menu-container',
                            child.props.baseClassName &&
                                child.props.baseClassName
                        )}
                        ref={menuContainerRef}
                        style={{
                            pointerEvents: 'auto',
                        }}
                    >
                        {modofiedChild}
                    </div>
                </ClickAwayListener>
            </Popper>
        )
    }
    const renderSubAccordion = (child) => {
        const handleEntered = () => {
            setTransitioning(true)
        }
        const handleExited = () => {
            setTransitioning(false)
            setAccordionEnter(true)
        }

        // Add some props to each child
        const modifiedProps = {
            parentId: `${parentId}-${finalId}`,
            tabIndex,
            show,
            enter: accordionEnter,
            toggle: propToggle,
            handleClick,
            handleEntered,
            handleExited,
        }
        return cloneElement(child, modifiedProps)
    }
    const renderChildren = () => {
        const modifiedChildren = Children.map(children, (child) => {
            if (isValidElement(child)) {
                if (child.type === MenuLink) {
                    return renderLink(child)
                } else if (child.type === MenuToggle) {
                    return renderToggle(child)
                } else if (child.type === MenuLabel) {
                    return renderLabel(child)
                } else if (child.type === MenuHeading) {
                    return renderHeading(child)
                } else if (
                    child.type === MenuSub &&
                    propToggle === 'dropdown'
                ) {
                    return renderSubDropdown(child)
                } else if (
                    child.type === MenuSub &&
                    propToggle === 'accordion'
                ) {
                    return renderSubAccordion(child)
                }
            }
            return child
        })
        return modifiedChildren
    }
    // VALORES MAIS RECENTES DO RENDER PARA OS EFFECTS ABAIXO (MESMO PAPEL DO useEffectEvent DO REACT).
    // OS EFFECTS SÃO "QUANDO X MUDA, FAÇA Y": DISPARAM SÓ COM show / accordionShow / rotaAtual, MAS
    // PRECISAM LER children, onShow, handleHide... ATUAIS. COLOCAR ESSES VALORES NAS DEPENDÊNCIAS FARIA
    // OS EFFECTS RODAREM A CADA RENDER (children E CALLBACKS SÃO NOVOS A CADA RENDER DO PAI), FECHANDO
    // ACCORDIONS ABERTOS À MÃO E DISPARANDO onShow SEM PARAR.
    const atual = useRef({})
    useLayoutEffect(() => {
        atual.current = {
            show,
            onShow,
            onHide,
            handleShow,
            handleHide,
            children,
            highlight,
            propToggle,
            multipleExpand,
            hasSub,
            location,
            open,
        }
    })
    useImperativeHandle(
        ref,
        () => ({
            current: menuItemRef.current,
            show: () => {
                atual.current.handleShow()
            },
            hide: () => {
                atual.current.handleHide()
            },
            isOpen: () => {
                return atual.current.show
            },
        }),
        []
    )
    useEffect(() => {
        const { onShow: aoAbrir, onHide: aoFechar } = atual.current
        if (show) {
            if (aoAbrir) {
                aoAbrir()
            }
        } else {
            if (aoFechar) {
                aoFechar()
            }
        }
    }, [show])
    useEffect(() => {
        const { propToggle: modo, multipleExpand: variosAbertos } = atual.current
        if (modo === 'accordion' && variosAbertos === false) {
            setShow(accordionShow)
        }
    }, [accordionShow])
    useEffect(() => {
        const { highlight: destacar, children: filhos, propToggle: modo, hasSub: temSub, handleHide: esconde, location: local, open: abertoPorProp } = atual.current
        const mudouDePagina = rotaAnterior.current !== rotaAtual
        rotaAnterior.current = rotaAtual
        if (destacar) {
            if (hasMenuActiveChild(local, filhos)) {
                if (modo === 'accordion') {
                    setShow(true)
                }
                setHere(true)
            } else {
                //open = ABERTO DE FORA (ex.: GRUPO COM RESULTADO DA BUSCA DA SIDEBAR): NÃO FECHA SÓ POR NÃO TER O ITEM ATUAL
                if (modo === 'accordion' && !abertoPorProp) {
                    setShow(false)
                }
                setHere(false)
            }
        }
        if (mudouDePagina && temSub && modo === 'dropdown') {
            esconde()
        }
    }, [rotaAtual])

    // Cleanup: ensure that any timeouts are cleared when the component unmounts
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current)
            }
        }
    }, [])
    return (
        <div
            {...containerProps}
            ref={menuItemRef}
            tabIndex={tabIndex}
            {...(propToggle === 'dropdown' && {
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
            })}
            className={clsx(
                'menu-item',
                propToggle === 'dropdown' && 'menu-item-dropdown',
                className && className,
                active && 'active',
                show && 'show',
                here && 'here',
                transitioning && 'transitioning'
            )}
        >
            {renderChildren()}
        </div>
    )
})
const MenuItem = memo(MenuItemComponent)
export { MenuItem }
