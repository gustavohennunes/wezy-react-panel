import { forwardRef } from 'react'
import { TabsList as MuiTabsList } from '@mui/base/TabsList'

// Define the extended tab component
const TabsList = forwardRef((props, ref) => {
    return (
        <MuiTabsList
            slotProps={{
                root: () => ({
                    className: 'tabs',
                }),
            }}
            {...props}
            ref={ref}
        />
    )
})
TabsList.displayName = 'TabsList'
export { TabsList }
