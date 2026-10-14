    import React, { useCallback, useRef, useState } from 'react'
    import { HexColorPicker } from 'react-colorful'

    import useClickOutside from './useClickOutside'
    import './style/formColorPicker.css'

    export const FormColorPicker = ({ color, fieldName, onChange }) => {
        
        const popover = useRef()
        const [isOpen, toggle] = useState(false)

        const close = useCallback(() => toggle(false), [])

        useClickOutside(popover, close)

        return (
            <div className="picker">

                <button
                    type="button"
                    className="swatch p-0"
                    style={{ backgroundColor: color }}
                    onClick={() => toggle(true)}
                    aria-label="Escolher cor"
                />

                {isOpen && (
                    <div className="popover" ref={popover}>
                        <HexColorPicker color={color} onChange={onChange} />
                    </div>
                )}

                <input type="hidden" name={fieldName} value={color} />

            </div>
        )

    }
