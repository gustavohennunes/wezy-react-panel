    import { useCallback, useRef, useState } from 'react'
    import { HexColorPicker } from 'react-colorful'

    import useClickOutside from './useClickOutside'
    import './style/formColorPicker.css'

    const corHex = (value) => {
        const texto = String(value || '').trim()
        const hex = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(texto)
        if (hex) {
            const valor = hex[1].length === 3 ? [...hex[1]].map((parte) => parte + parte).join('') : hex[1]
            return `#${valor.toLowerCase()}`
        }

        const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(texto)
        if (!rgb) return null
        const canais = rgb.slice(1).map(Number)
        if (canais.some((canal) => canal > 255)) return null
        return `#${canais.map((canal) => canal.toString(16).padStart(2, '0')).join('')}`
    }

    const corRgb = (hex) => `rgb(${[1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16)).join(', ')})`

    export const FormColorPicker = ({ color, fieldName, onChange }) => {
        
        const popover = useRef()
        const [isOpen, toggle] = useState(false)
        const [rascunho, setRascunho] = useState(null)
        const hexadecimal = corHex(color) || '#ffffff'

        const close = useCallback(() => {
            toggle(false)
            setRascunho(null)
        }, [])

        const editarCor = (formato, valor) => {
            setRascunho({ formato, valor })
            const novaCor = corHex(valor)
            if (novaCor) onChange(novaCor)
        }

        const aoDigitar = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault()
                setRascunho(null)
            }
            if (event.key === 'Escape') {
                event.stopPropagation()
                close()
            }
        }

        useClickOutside(popover, close)

        return (
            <div className="picker">

                <button
                    type="button"
                    className="swatch p-0"
                    style={{ backgroundColor: color }}
                    onClick={() => toggle(true)}
                    aria-label="Escolher cor"
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                />

                {isOpen && (
                    <div className="popover" ref={popover} role="dialog" aria-label="Selecionar cor">
                        <HexColorPicker color={hexadecimal} onChange={(novaCor) => {
                            setRascunho(null)
                            onChange(novaCor)
                        }} />
                        {['HEX', 'RGB'].map((formato) => (
                            <label className="color-picker-value" key={formato}>
                                <span>{formato}</span>
                                <input
                                    type="text"
                                    className="input w-full font-mono text-xs"
                                    aria-label={`Cor ${formato}`}
                                    value={rascunho?.formato === formato ? rascunho.valor : formato === 'HEX' ? hexadecimal : corRgb(hexadecimal)}
                                    onChange={(event) => editarCor(formato, event.target.value)}
                                    onBlur={() => setRascunho(null)}
                                    onKeyDown={aoDigitar}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </label>
                        ))}
                    </div>
                )}

                <input type="hidden" name={fieldName} value={color || ''} />

            </div>
        )

    }
