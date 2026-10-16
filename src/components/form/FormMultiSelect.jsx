    import { useEffect, useState } from 'react'
    import { Combobox } from './FormCombobox'

    // CAMPO Mul DO PAINEL LEGADO — A PONTE (panel/module) ENVIA type 'select-multiple'
    // COM name JÁ SUFIXADO COM [] E options [{label, value, selected}].
    // MODO TAGS LIVRES: A CLASSE CONTÉM 'select-tag' E O USUÁRIO PODE CRIAR NOVOS VALORES.
    // OS VALORES SELECIONADOS VIRAM INPUTS COM O name DO CAMPO, ENTÃO O FormData
    // NATIVO DO FormContext JÁ OS ENVIA NO FORMATO QUE O BACKEND ESPERA.
    const FormMultiSelect = ({ title, subtitle = '', combinedClass, rowAttr, fieldName, fieldData, required = false }) => {

        const isTags = (fieldData.class || '').includes('select-tag')

        const [options, setOptions]   = useState([])
        const [selected, setSelected] = useState([])

        useEffect(() => {

            //MODO TAGS: A PONTE MANDA COMO OPÇÕES SÓ OS VALORES JÁ SALVOS NO REGISTRO (PanelModule, Mul SEM TABELA) —
            //TODOS PODEM SAIR PELO X DA LISTA; AO SALVAR, SAEM DO REGISTRO
            const initial = (fieldData.options || []).map((option) => ({
                ...option,
                selected: option.selected === true || option.selected === 'selected',
                removable: isTags,
            }))

            setOptions(initial)
            setSelected(initial.filter((option) => option.selected).map((option) => String(option.value)))

        }, [fieldData])

        const handleChange = (values) => {

            //TAG CRIADA PELO USUÁRIO ENTRA NA LISTA DE OPÇÕES PARA CONTINUAR APARECENDO NA BUSCA (COM O X, COMO AS SALVAS)
            if (isTags) {
                setOptions((prev) => {
                    const novas = values.filter((value) => !prev.some((option) => String(option.value) === value))
                    return novas.length ? [...prev, ...novas.map((value) => ({ label: value, value, removable: true }))] : prev
                })
            }

            setSelected(values)

        }

        //X NA LISTA: A TAG SAI DAS OPÇÕES E DA SELEÇÃO (O HIDDEN DELA SOME E NÃO VAI NO ENVIO)
        const removeOpcao = (option) => {
            const valor = String(option.value)
            setOptions((prev) => prev.filter((item) => String(item.value) !== valor))
            setSelected((prev) => prev.filter((item) => item !== valor))
        }

        return (
            <div className={combinedClass} {...rowAttr}>

                {title !== false && (
                    <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
                        {/* span E NÃO label: O CAMPO É UM COMBOBOX (NÃO UM INPUT NATIVO); O NOME CHEGA NELE PELO ariaLabel */}
                        <span>
                            <b>
                                {title}
                                {required && <span className="text-danger"> *</span>}
                            </b>
                        </span>
                        {subtitle && <span className="text-[10px]"> {subtitle} </span>}
                    </div>
                )}

                {/* max-width:500px VEM DO PRÓPRIO CARD LEGADO (ex.: Domínios adicionais em ?pag=clientes) */}
                <div className="w-full min-w-0">

                    <Combobox
                        ariaLabel={title || undefined}
                        multiple
                        creatable={isTags}
                        options={options}
                        value={selected}
                        onChange={handleChange}
                        onRemoveOption={removeOpcao}
                        placeholder={isTags ? 'Digite para adicionar' : options.length ? 'Selecione' : 'Nenhuma opção disponível'}
                    />

                    {selected.map((value) => (
                        <input key={value} type="hidden" name={fieldName} value={value} />
                    ))}

                </div>

            </div>
        )

    }

    export { FormMultiSelect }
