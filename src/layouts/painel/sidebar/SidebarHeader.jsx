/* eslint-disable no-unused-vars */
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { KeenIcon } from '@/components'

const SidebarHeader = forwardRef((props, ref) => {
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef(null)

    const handleInputChange = (event) => {
        setInputValue(event.target.value)
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === '/') {
                event.preventDefault()
                inputRef.current.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <div ref={ref}>
            <div className="flex gap-3 mb-5 items-center px-6 mt-8">
                <img
                    src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg"
                    className="dark:hidden"
                    style={{ width: '135px' }}
                />
                <img
                    src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg"
                    className="hidden dark:block"
                    style={{ filter: 'brightness(100)', width: '135px' }}
                />
                <div className="text-2sm text-gray-600 leading-none flex items-center">
                    |
                </div>
                <div className="text-2sm text-gray-600 leading-none font-medium flex items-center">
                    Revenda
                </div>
            </div>

            <div className="pt-2.5 px-3.5 mb-1">
                <div className="input">
                    <KeenIcon icon="magnifier" style="outline" />
                    <input
                        ref={inputRef}
                        placeholder="Busca"
                        type="text"
                        className="min-w-0"
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <span className="text-2sm text-gray-700 text-nowrap">
                        Ctrl + /
                    </span>
                </div>
            </div>
        </div>
    )
})

export { SidebarHeader }
