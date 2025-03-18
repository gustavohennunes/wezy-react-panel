/* eslint-disable no-unused-vars */
import React, { forwardRef, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toAbsoluteUrl } from '@/utils'
import { Menu, MenuItem, MenuLabel } from '@/components/menu'
import { KeenIcon } from '@/components'
import { useLanguage } from '@/i18n'

const SidebarHeader = forwardRef((props, ref) => {
    
    const { pathname } = useLocation()
    const { isRTL } = useLanguage()
    const handleInputChange = () => {}

    return (
        <div ref={ref}>

            <div className="flex gap-3 mb-5 items-center px-6 mt-8">
                <img src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg" className="dark:hidden" style={{width: '135px'}} />
                <img src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg" className="hidden dark:block" style={{filter: "brightness(100)", width: '135px'}} />
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
                        placeholder="Busca"
                        type="text"
                        onChange={handleInputChange}
                        className="min-w-0"
                        value=""
                    />
                    <span className="text-2sm text-gray-700 text-nowrap">
                        Ctrl + /
                    </span>
                </div>
            </div>

        </div>

    );

});

export { SidebarHeader }
