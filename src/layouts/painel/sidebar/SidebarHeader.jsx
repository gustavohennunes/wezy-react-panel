/* eslint-disable no-unused-vars */
import React, { forwardRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
import { Menu, MenuItem, MenuLabel } from '@/components/menu';
import { KeenIcon } from '@/components';
import { useLanguage } from '@/i18n';
const SidebarHeader = forwardRef((props, ref) => {
  const {
    pathname
  } = useLocation();
  const {
    isRTL
  } = useLanguage();
  const handleInputChange = () => {};
  useEffect(() => {
  }, [pathname]);
  return <div ref={ref}>
      <div className="flex items-center gap-2.5 px-3.5 h-[70px]">
        <Link to="/">
          <img src={toAbsoluteUrl('/media/app/mini-logo-circle.svg')} className="dark:hidden h-[42px]" />
          <img src={toAbsoluteUrl('/media/app/mini-logo-circle-dark.svg')} className="hidden dark:inline-block h-[42px]" />
        </Link>

        <Menu className="menu-default grow">
          <MenuItem className="grow" toggle="dropdown" trigger="hover" dropdownProps={{
          placement: isRTL() ? 'bottom-end' : 'bottom-start',
          modifiers: [{
            name: 'offset',
            options: {
              offset: [0, 15] // [skid, distance]
            }
          }]
        }}>
            <MenuLabel className="text-gray-900 font-medium grow justify-between">
              <span className="text-base font-medium text-gray-900 grow justify-start">
                Wezy
              </span>
            </MenuLabel>
          </MenuItem>
        </Menu>
      </div>

      <div className="pt-2.5 px-3.5 mb-1">
        <div className="input">
          <KeenIcon icon="magnifier" />
          <input placeholder="Search" type="text" onChange={handleInputChange} className="min-w-0" value="" />
          <span className="text-2sm text-gray-700 text-nowrap">cmd + /</span>
        </div>
      </div>
    </div>;
});
export { SidebarHeader };