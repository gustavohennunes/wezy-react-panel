    
    import { useMemo, useRef } from 'react'
    import { Combobox } from './FormCombobox'

    //FOLHA DE ESTILO (projetos-css-padrao): OS SELECTS DE COR ("Background", "Background hover"...) LISTAM OS ESTILOS DE COR
    //PELO ÍNDICE ("3:526" = "[COR-2]"). A COR DO ESTILO É O CAMPO CorColor_<índice>_color DO MESMO FORMULÁRIO E A OPACIDADE O
    //FrmColor_<índice>_opacity — LIDOS NA HORA, ENTÃO A AMOSTRA JÁ MOSTRA O QUE FOI MEXIDO E AINDA NÃO SALVO
    const corDoEstiloDaFolha = (option) => {

        const indice = String(option?.value ?? '')
        if (indice === '' || typeof document === 'undefined') return null

        const cor = document.querySelector(`input[name="CorColor_${CSS.escape(indice)}_color"]`)?.value
        if (!cor) return null

        const opacidade = parseFloat(String(document.querySelector(`input[name="FrmColor_${CSS.escape(indice)}_opacity"]`)?.value ?? '').replace(',', '.'))

        return { cor, opacidade: Number.isFinite(opacidade) ? Math.min(1, Math.max(0, opacidade)) : 1 }

    }

    const FormSelect = ({ field, fieldData, formState, handleSelectChange, combinedClass, rowAttr = '', required }) => {

        //OPÇÕES DERIVADAS DAS PROPS (useMemo): ANTES FICAVAM EM STATE PREENCHIDO POR useEffect, E O
        //CAMPO RENDERIZAVA UMA VEZ VAZIO ANTES DE MOSTRAR AS OPÇÕES
        const options = useMemo(() => {

            if (field.type === 'Qnt') {

                const maxValue = 12
                const step = 1
                const generatedOptions = []
                if (fieldData.options.length == 1) {

                    generatedOptions.push({
                        value: 0,
                        label: fieldData.options[0].label,
                    })

                    for (let i = 1; i <= maxValue; i += step) {
                        generatedOptions.push({ value: i, label: i })
                    }

                } else {

                    for (let i = 0; i <= maxValue; i += step) {
                        generatedOptions.push({ value: i, label: i })
                    }

                }

                return generatedOptions

            }

            if (field.type === 'Sel') {
                return fieldData.options || []
            }

            if (field.type === 'Man' || field.type === 'Ico') {
                return fieldData.options || []
            }

            return []

        }, [field.type, fieldData.options]);

        const nomeCampo = fieldData.name || field.name

        //O <select> LEGADO TINHA id = NOME DO CAMPO (ex.: #Selid_email) E O <script> DO CARTÃO (output-html) FAZ
        //$('#Selid_email').change(...) — ex.: emails-disparos RECARREGA COM &parametros= DO TEMPLATE ESCOLHIDO. O COMBOBOX
        //NÃO É UM <select>, ENTÃO O HIDDEN LEVA O id E RECEBE UM change NATIVO (O jQuery ESCUTA) QUANDO O USUÁRIO ESCOLHE.
        //SÓ NA ESCOLHA DO USUÁRIO: NO PREENCHIMENTO INICIAL O HANDLER DO CARTÃO RECARREGARIA A PÁGINA EM LOOP
        const hiddenRef = useRef(null)
        const avisarScriptsDoCartao = (valor) => {
            const hidden = hiddenRef.current
            if (!hidden) return
            hidden.value = valor
            hidden.dispatchEvent(new Event('change', { bubbles: true }))
        }
        
        return (
            <div className={combinedClass} {...rowAttr}>

                <div className="form-label flex flex-col w-full lg:w-56 lg:min-w-56 lg:shrink-0 h-full justify-center">
                    <b>
                        {fieldData.title || field.title}
                        {required && (
                            <span className="text-danger"> {' '} *</span>
                        )}
                    </b>
                    {(fieldData.subtitle || field.subtitle) && (
                        <span className="text-[10px]">
                            {' '}
                            {fieldData.subtitle || field.subtitle}{' '}
                        </span>
                    )}
                </div>

                <div className="w-full lg:flex-1 min-w-0 max-w-[420px]">

                    <Combobox
                        ariaLabel={fieldData.title || field.title || undefined}
                        options={options}
                        value={formState[nomeCampo] ?? ''}
                        placeholder={options[0]?.label}
                        corExtra={corDoEstiloDaFolha}
                        onChange={(value) => {
                            const vazio = value === '' || value === null || value === undefined
                            //OPÇÃO SEM VALOR ("Selecione uma opção") VAI COMO '-1', QUE O handleSelectChange GRAVA VAZIO
                            handleSelectChange(nomeCampo, vazio ? '-1' : String(value))
                            avisarScriptsDoCartao(vazio ? '' : String(value))
                        }}
                    />

                </div>

                <input
                    ref={hiddenRef}
                    type="hidden"
                    id={nomeCampo}
                    name={nomeCampo}
                    value={formState[nomeCampo] || ''}
                />

            </div>
        )
    }

    export { FormSelect }
