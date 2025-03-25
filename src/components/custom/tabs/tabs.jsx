import { cleanUrl } from '@/utils/urlHelper'
const Tabs = ({ activeTab, setActiveTab, className, tabs }) => {
    if (!tabs || !Array.isArray(tabs)) {
        return null
    }

    return (
        <div
            data-tabs="true"
            className={`tabs w-f mb-3`}
        >
            {tabs?.map((tab, i) => {

                let tabSelected = activeTab === tab.content || (i === 0 && activeTab === '')

                const isInvalidUrl = !tab.url || tab.url === 'javascript:;'

                return isInvalidUrl ? (
                    <button
                        key={i}
                        className={`${tabSelected ? 'active' : ''} tab`}
                        onClick={() => setActiveTab(tab.content)}
                    >
                        {tab.content}
                    </button>
                ) : (
                    <a
                        key={i}
                        className={`${tabSelected ? 'active' : ''} tab`}
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
