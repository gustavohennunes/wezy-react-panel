import React from 'react'
import { Tabs } from '@/components/custom/tabs/tabs'

export const FormTabs = ({ tabs }) => {
    return (
        <div className="w-f mx-1">
            {tabs?.before && Array.isArray(tabs?.before) ? (
                <div className="card-header flex-wrap gap-2 border-b-0 px-5">
                    <Tabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        tabs={tabs?.before}
                    />
                </div>
            ) : null}

            {tabs?.after && Array.isArray(tabs?.after) ? (
                <div className="card-header justify-start flex-wrap gap-2 border-b-0 px-5">
                    {tabs?.after?.map((afterTab, i) => {
                        return (
                            <a
                                key={i}
                                className="btn btn-primary"
                                href={
                                    !afterTab.url ||
                                    afterTab.url === 'javascript:;'
                                        ? ''
                                        : cleanUrl(afterTab.url)
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
