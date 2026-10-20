
    import { Tabs } from '@/components/custom/tabs/tabs'
    import { BotoesDasAbas } from '@/components/custom/tabs/BotoesDasAbas'

    export const FormTabs = ({ tabs }) => {

        return (
            <div className="w-f">

                {tabs?.before && Array.isArray(tabs?.before) && tabs.before.length > 0 ? (
                    <div className="card-header flex-wrap gap-2 border-b-0 p-0">
                        <Tabs tabs={tabs.before} />
                    </div>
                ) : null}

                {Array.isArray(tabs?.after) && tabs.after.length > 0 ? (
                    <BotoesDasAbas botoes={tabs.after} className="p-0" />
                ) : null}

            </div>
        )

    }
