import { cleanUrl } from '@/utils/urlHelper'
const Tabs = ({ activeTab, setActiveTab, className, tabs }) => {
    if (!tabs || !Array.isArray(tabs)) {
        return null
    }

    return (
        <div
            data-tabs="true"
            className={`flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-2.5 border-gray-300 ${className}`}
        >
            {tabs?.map((tab, i) => {
                let tabSelected =
                    activeTab === tab.content || (i === 0 && activeTab === '')
                const isInvalidUrl = !tab.url || tab.url === 'javascript:;'

                return isInvalidUrl ? (
                    <button
                        key={i}
                        className={`${tabSelected ? 'active' : ''} group btn btn-primary px-3 hover:text-secundary tab-active:bg-secundary-light tab-active:border-secundary-clarity tab-active:text-secundary ${tab.class}`}
                        onClick={() => setActiveTab(tab.content)}
                    >
                        {tab.content}
                    </button>
                ) : (
                    <a
                        key={i}
                        className={`${tabSelected ? 'active' : ''} group btn btn-primary px-3 hover:text-secundary tab-active:bg-secundary-light tab-active:border-secundary-clarity tab-active:text-secundary ${tab.class}`}
                        href={cleanUrl(tab.url)}
                        onClick={() => setActiveTab(tab.content)}
                        target={tab.target ?? '_self'}
                    >
                        {tab.content}
                    </a>
                )
            })}
        </div>
    )
}

export { Tabs }
