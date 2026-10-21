
    import { Tabs } from '@/components/custom/tabs/tabs'
    import { BotoesDasAbas } from '@/components/custom/tabs/BotoesDasAbas'

    export const FormTabs = ({ tabs }) => {

        const grupos = []
        for (const aba of tabs?.before || []) {
            const indice = aba.grupo || 0
            if (!grupos[indice]) grupos[indice] = []
            grupos[indice].push(aba)
        }
        const separarGrupos = grupos.filter(Boolean).length > 1

        return (
            <div className="w-f flex flex-col gap-3">

                {grupos.map((abas, indice) => (
                    <div
                        key={indice}
                        className={separarGrupos ? 'w-fit max-w-full' : 'card-header flex-wrap gap-2 border-b-0 p-0'}
                    >
                        <Tabs tabs={abas} className={separarGrupos ? 'tabs w-f mb-0' : undefined} />
                    </div>
                ))}

                {Array.isArray(tabs?.after) && tabs.after.length > 0 ? (
                    <BotoesDasAbas botoes={tabs.after} className="p-0" />
                ) : null}

            </div>
        )

    }
