import { SidebarMenuPrimary } from './'
const SidebarMenu = ({ height = 0 }) => {
    return (
        <div className="flex items-stretch grow shrink-0 justify-center my-5">
            <div
                className="scrollable-y-auto light:[--tw-scrollbar-thumb-color:var(--tw-content-scrollbar-color)] grow"
                style={{
                    ...(height > 0 && {
                        height: `${height}px`,
                    }),
                }}
            >
                <SidebarMenuPrimary />
            </div>
        </div>
    )
}
export { SidebarMenu }
