
    import { SidebarMenuPrimary } from './'

    const SidebarMenu = ({ height = 0, search, setSearch }) => {

        return (
            <div className="flex items-stretch grow shrink-0 justify-center my-5">
                <div
                    className="scrollable-y-auto light:[--tw-scrollbar-thumb-color:var(--tw-content-scrollbar-color)] grow"
                    
                >
                    <SidebarMenuPrimary 
                        search={search}
                        setSearch={setSearch}
                    />
                </div>
            </div>
        )

    }

    export { SidebarMenu }
