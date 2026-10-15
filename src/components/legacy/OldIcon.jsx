    import clsx from 'clsx'
    import {
        ALargeSmall, ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowUpFromLine, Asterisk, Badge, Ban, Baseline, Camera,
        CirclePlay, Crosshair, Download, Expand, FastForward, Film, Flame, Forward, Globe,
        HardDrive, Headphones, Inbox, IndentDecrease, IndentIncrease, LayoutList, Leaf, Magnet, Martini,
        Maximize2, Megaphone, Minimize2, Music, Pause, Pointer, Power, QrCode,
        Rewind, RotateCw, Server, Signal, SkipBack, SkipForward, Square, Tags, TriangleAlert,
        Video, Volume1, Volume2, VolumeX, ZoomIn, ZoomOut,
    } from 'lucide-react'
    import { KeenIcon } from '@/components/keenicons'

    //ÍCONES DO lucide-react USADOS NO OLD_ICON_MAP ("lucide:Nome") — IMPORT NOMEADO PARA NÃO PUXAR A LIB INTEIRA
    const LUCIDE = {
        ALargeSmall, ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowUpFromLine, Asterisk, Badge, Ban, Baseline, Camera,
        CirclePlay, Crosshair, Download, Expand, FastForward, Film, Flame, Forward, Globe,
        HardDrive, Headphones, Inbox, IndentDecrease, IndentIncrease, LayoutList, Leaf, Magnet, Martini,
        Maximize2, Megaphone, Minimize2, Music, Pause, Pointer, Power, QrCode,
        Rewind, RotateCw, Server, Signal, SkipBack, SkipForward, Square, Tags, TriangleAlert,
        Video, Volume1, Volume2, VolumeX, ZoomIn, ZoomOut,
    }

    // ÍCONE CONVERTIDO DO SPRITE ANTIGO (RESULTADO DE transformOldIcon): KEENICON OU, SEM EQUIVALENTE NELE, lucide.
    // O lucide USA 1em PARA SEGUIR O font-size DO PAI, COMO O KEENICON (FONTE)
    const OldIcon = ({ icon, className = '' }) => {

        const Lucide = icon?.lib === 'lucide' ? LUCIDE[icon.icon] : null

        if (Lucide) {
            return <Lucide className={clsx('inline-block shrink-0', className)} width="1em" height="1em" strokeWidth={1.75} aria-hidden="true" />
        }

        return <KeenIcon icon={icon?.icon || 'html'} style={icon?.type} className={className} />

    }

    export { OldIcon }
