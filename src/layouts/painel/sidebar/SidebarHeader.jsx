    /* eslint-disable no-unused-vars */
    import React, { forwardRef, useEffect, useRef, useState } from 'react'
    import { PANEL_LOGO } from '@/config/branding'
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
                        <img
                            src={PANEL_LOGO}
                            alt="Logo"
                            className="dark:hidden"
                            style={{ width: '135px' }}
                        />
                        <img
                            src={PANEL_LOGO}
                            alt="Logo"
                            className="hidden dark:block"
                            style={{ filter: 'brightness(100)', width: '135px' }}
                        />
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
                        <span className="text-2sm text-gray-700 text-nowrap">
                            Ctrl + /
                        </span>
                    </div>
                </div>
            </div>
        )
    })

    export { SidebarHeader }
