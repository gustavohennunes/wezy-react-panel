import { cleanUrl } from '@/utils/urlHelper'

const Tabs = ({ activeTab, setActiveTab, className, tabs }) => {

    if (!tabs || !Array.isArray(tabs)) {
        return null
    }

    return (
        <div
            data-tabs="true"
            className={className ? className : `tabs w-f mb-3`}
        >
            {tabs?.map((tab, i) => {
                
                const isInvalidUrl = !tab.url || tab.url === 'javascript:;'

                return isInvalidUrl ? (
                    <button
                        key={i}
                        className={`active tab`}
                    >
                        {tab.content}
                    </button>
                ) : (
                    <a
                        key={i}
                        className={`tab`}
                        href={cleanUrl(tab.url)}
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
