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

            const initial = (fieldData.options || []).map((option) => ({
                ...option,
                selected: option.selected === true || option.selected === 'selected',
            }))

            setOptions(initial)
            setSelected(initial.filter((option) => option.selected).map((option) => String(option.value)))

        }, [fieldData])

        const handleChange = (values) => {

            //TAG CRIADA PELO USUÁRIO ENTRA NA LISTA DE OPÇÕES PARA CONTINUAR APARECENDO NA BUSCA
            if (isTags) {
                setOptions((prev) => {
                    const novas = values.filter((value) => !prev.some((option) => String(option.value) === value))
                    return novas.length ? [...prev, ...novas.map((value) => ({ label: value, value }))] : prev
                })
            }

            setSelected(values)

        }

        return (
            <div className={combinedClass} {...rowAttr}>

                {title !== false && (
                    <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
                        <label>
                            <b>
                                {title}
                                {required && <span className="text-danger"> *</span>}
                            </b>
                        </label>
                        {subtitle && <span className="text-[10px]"> {subtitle} </span>}
                    </div>
                )}

                <div className="w-full min-w-0">

                    <Combobox
                        multiple
                        creatable={isTags}
                        options={options}
                        value={selected}
                        onChange={handleChange}
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
