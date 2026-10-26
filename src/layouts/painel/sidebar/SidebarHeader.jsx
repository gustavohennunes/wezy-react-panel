    /* eslint-disable no-unused-vars */
    import React, { forwardRef, useEffect, useRef, useState } from 'react'
    import { PanelLogo } from '@/layouts/painel/PanelLogo'
    import { KeenIcon } from '@/components'
    import { Link } from 'react-router-dom'

    const SidebarHeader = forwardRef(({ search, setSearch, ...props }, ref) => {
    
        const inputRef = useRef(null)

        const handleInputChange = (event) => {
            setSearch(event.target.value)
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
                    <Link to="/?pag=dashboard">
                        <PanelLogo />
                    </Link>
                </div>

                <div className="pt-2.5 px-3.5 mb-1">
                    <div className="input">
                        <KeenIcon icon="magnifier" style="outline" />
                        <input
                            ref={inputRef}
                            placeholder="Busca"
                            aria-label="Buscar no menu"
                            type="text"
                            className="min-w-0"
                            value={search}
                            onChange={handleInputChange}
                        />
                        {search ? (
                            <button
                                type="button"
                                aria-label="Limpar busca"
                                className="flex size-5 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                                onClick={() => {
                                    setSearch('')
                                    inputRef.current.focus()
                                }}
                            >
                                <KeenIcon icon="cross" />
                            </button>
                        ) : (
                            <span className="text-2sm text-gray-700 text-nowrap">
                                Ctrl + /
                            </span>
                        )}
                    </div>
                </div>
            </div>
        )
    })

    SidebarHeader.displayName = 'SidebarHeader'

    export { SidebarHeader }
