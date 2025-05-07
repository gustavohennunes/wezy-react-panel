
    import { SidebarMenuPrimary } from './'

    const SidebarMenu = ({ height = 0, search, setSearch }) => {

        return (
            <div
                className="flex my-5 scrollable-y-auto light:[--tw-scrollbar-thumb-color:var(--tw-content-scrollbar-color)] grow"
                
            >
                <SidebarMenuPrimary 
                    search={search}
                    setSearch={setSearch}
                />
            </div>
        )

    }

    export { SidebarMenu }
