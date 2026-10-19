import * as React from 'react'
import Tooltip from '@mui/material/Tooltip'
import { cn } from '@/lib/utils'

// Tooltip component that applies utility classes and custom styles
const DefaultTooltip = ({ className = '', tooltipClassName = '', ...props }) => (
    <Tooltip
        TransitionProps={{
            timeout: 300,
        }}
        {...props}
        classes={{
            popper: className,
            tooltip: cn(
                '!text-white !rounded-md !text-xs !font-normal !bg-[--tw-tooltip-background-color] !box-shadow[--tw-tooltip-box-shadow] !border[--tw-tooltip-border] !px-2 !py-1.5',
                tooltipClassName
            ),
        }}
    />
)
export { DefaultTooltip }
