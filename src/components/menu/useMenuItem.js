import { Children, isValidElement, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import useResponsiveProp from '@/hooks/useResponsiveProp'
import { useMatchPath } from '../../hooks/useMatchPath'
import { MenuSub } from './MenuSub'
import { useMenu } from './Menu'
import { useMenuLocation } from './MenuModulo'
import { getMenuLinkPath, hasMenuActiveChild, moduloDaUrl } from './utils'

// ESTADO DE UM ITEM DO MENU: ABERTO/FECHADO (ACCORDION OU DROPDOWN), DESTAQUE DA PÁGINA ATUAL E OS HANDLERS QUE O
// MenuItem REPASSA PARA O LINK/TOGGLE/SUBMENU FILHOS
const useMenuItem = (props, ref) => {

    const {
        toggle,
        trigger,
        dropdownProps,
        disabled,
        handleParentHide,
        onShow,
        onHide,
        onClick,
        containerProps = {},
        children,
        open = false,
        parentId,
        id,
    } = props

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

    const hideTimeoutRef = useRef(null)
    //PÁGINA ATUAL = PATHNAME + MÓDULO (?pag=). SÓ O PATHNAME NÃO SERVE: NESTE PAINEL ELE É SEMPRE "/"
    //E OS EFFECTS DE ABRIR/FECHAR O MENU NUNCA DISPARAVAM AO NAVEGAR
    const location = useMenuLocation()
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
    const hasSub = Children.toArray(children).some((child) => isValidElement(child) && child.type === MenuSub)

    //ACCORDION SEM multipleExpand: SÓ UM ABERTO POR NÍVEL (O Menu GUARDA QUAL)
    const accordionUnico = hasSub && propToggle === 'accordion' && multipleExpand === false

    const handleHide = () => {
        if (hasSub) setShow(false)
        if (accordionUnico) setOpenAccordion(finalParentId, '')
        if (handleParentHide) handleParentHide()
    }

    const handleShow = () => {
        if (hasSub) setShow(true)
        if (accordionUnico) setOpenAccordion(finalParentId, finalId)
    }

    const handleMouseEnter = (e) => {
        if (isMenuDisabled) return
        // Cancel any previously set hide timeout
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
        if (propTrigger === 'hover') {
            setShow(true)
            containerProps.onMouseEnter?.(e)
        }
    }

    const handleMouseLeave = (e) => {
        if (isMenuDisabled || propTrigger !== 'hover') return
        // Hide the dropdown after `dropdownTimeout` delay
        hideTimeoutRef.current = setTimeout(() => {
            setShow(false)
            containerProps.onMouseLeave?.(e)
            hideTimeoutRef.current = null
        }, dropdownTimeout)
    }

    const handleToggle = (e) => {
        if (isMenuDisabled || disabled) return
        if (propToggle === 'accordion') setAccordionEnter(true)
        if (show) {
            handleHide()
        } else {
            handleShow()
        }
        onClick?.(e, props)
    }

    const handleClick = (e) => {
        if (disabled) return
        handleHide()
        onClick?.(e, props)
    }

    const handleEntered = () => setTransitioning(true)
    const handleExited = () => {
        setTransitioning(false)
        setAccordionEnter(true)
    }

    // VALORES MAIS RECENTES DO RENDER PARA OS EFFECTS ABAIXO (MESMO PAPEL DO useEffectEvent DO REACT).
    // OS EFFECTS SÃO "QUANDO X MUDA, FAÇA Y": DISPARAM SÓ COM show / accordionShow / rotaAtual, MAS
    // PRECISAM LER children, onShow, handleHide... ATUAIS. COLOCAR ESSES VALORES NAS DEPENDÊNCIAS FARIA
    // OS EFFECTS RODAREM A CADA RENDER (children E CALLBACKS SÃO NOVOS A CADA RENDER DO PAI), FECHANDO
    // ACCORDIONS ABERTOS À MÃO E DISPARANDO onShow SEM PARAR.
    const atual = useRef({})
    useLayoutEffect(() => {
        atual.current = { show, onShow, onHide, handleShow, handleHide, children, highlight, propToggle, multipleExpand, hasSub, location, open }
    })

    useImperativeHandle(
        ref,
        () => ({
            current: menuItemRef.current,
            show: () => atual.current.handleShow(),
            hide: () => atual.current.handleHide(),
            isOpen: () => atual.current.show,
        }),
        []
    )

    useEffect(() => {
        const { onShow: aoAbrir, onHide: aoFechar } = atual.current
        if (show) {
            aoAbrir?.()
        } else {
            aoFechar?.()
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
            const ativo = hasMenuActiveChild(local, filhos)
            //open = ABERTO DE FORA (ex.: GRUPO COM RESULTADO DA BUSCA DA SIDEBAR): NÃO FECHA SÓ POR NÃO TER O ITEM ATUAL
            if (modo === 'accordion' && (ativo || !abertoPorProp)) {
                setShow(ativo)
            }
            setHere(ativo)
        }
        if (mudouDePagina && temSub && modo === 'dropdown') {
            esconde()
        }
    }, [rotaAtual])

    // Cleanup: ensure that any timeouts are cleared when the component unmounts
    useEffect(() => () => clearTimeout(hideTimeoutRef.current), [])

    return {
        menuItemRef,
        propToggle,
        propDropdownProps,
        hasSub,
        active,
        here,
        show,
        transitioning,
        accordionEnter,
        finalId,
        handleShow,
        handleHide,
        handleToggle,
        handleClick,
        handleMouseEnter,
        handleMouseLeave,
        handleEntered,
        handleExited,
    }

}

export { useMenuItem }
