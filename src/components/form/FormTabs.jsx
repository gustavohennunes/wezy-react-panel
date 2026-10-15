
    import React from 'react'
    import { Tabs } from '@/components/custom/tabs/tabs'
    import { cleanUrl } from '@/utils/urlHelper'

    export const FormTabs = ({ tabs, activeTab, setActiveTab }) => {

        return (
            <div className="w-f">

                {tabs?.before && Array.isArray(tabs?.before) && tabs.before.length > 0 ? (
                    <div className="card-header flex-wrap gap-2 border-b-0 p-0">
                        <Tabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            tabs={tabs?.before}
                        />
                    </div>
                ) : null}

                {tabs?.after && Array.isArray(tabs?.after) && tabs.after.length > 0 ? (

                    <div className="card-header justify-start flex-wrap gap-2 border-b-0 p-0">

                        {tabs?.after?.map((afterTab, i) => {

                            return (
                                <a
                                    key={i}
                                    className="btn btn-primary"
                                    href={
                                        !afterTab.url || afterTab.url === 'javascript:;' ? '' : cleanUrl(afterTab.url)
                                    }
                                    target={afterTab.target ?? '_self'}
                                >
                                    {afterTab.content}
                                </a>
                            )

                        })}

                    </div>

                ) : null}

            </div>
        )

    }
