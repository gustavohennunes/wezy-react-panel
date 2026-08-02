    import React, { useEffect, useState } from 'react'
    import { CustomCheckbox } from './CustomFields'

    // CAMPO Mul DO PAINEL LEGADO — A PONTE (panel/module) ENVIA type 'select-multiple'
    // COM name JÁ SUFIXADO COM [] E options [{label, value, selected}].
    // MODO TAGS LIVRES: A CLASSE CONTÉM 'select-tag' E O USUÁRIO PODE CRIAR NOVOS VALORES.
    // OS VALORES SELECIONADOS VIRAM INPUTS COM O name DO CAMPO, ENTÃO O FormData
    // NATIVO DO FormContext JÁ OS ENVIA NO FORMATO QUE O BACKEND ESPERA.
    const FormMultiSelect = ({ title, subtitle = '', combinedClass, rowAttr, fieldName, fieldData, required = false }) => {

        const isTags = (fieldData.class || '').includes('select-tag')

        const [options, setOptions] = useState([])
        const [selected, setSelected] = useState([])
        const [tagText, setTagText] = useState('')

        useEffect(() => {

            const initial = (fieldData.options || []).map((option) => ({
                ...option,
                selected: option.selected === true || option.selected === 'selected',
            }))

            setOptions(initial)
            setSelected(initial.filter((option) => option.selected).map((option) => String(option.value)))

        }, [fieldData])

        const toggleValue = (value, checked) => {

            const useValue = String(value)

            setSelected((prev) =>
                checked ? [...prev, useValue] : prev.filter((item) => item !== useValue)
            )

        }

        const addTag = () => {

            const tag = tagText.trim()
            if (tag === '') return

            setOptions((prev) =>
                prev.some((option) => String(option.value) === tag)
                    ? prev
                    : [...prev, { label: tag, value: tag, selected: true }]
            )

            setSelected((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
            setTagText('')

        }

        const removeTag = (value) => {
            setSelected((prev) => prev.filter((item) => item !== String(value)))
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

                {isTags ? (

                    <div className="w-full">

                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {selected.map((value) => (
                                <span
                                    key={value}
                                    className="badge badge-sm badge-outline flex items-center gap-1"
                                >
                                    {value}
                                    <button
                                        type="button"
                                        className="cursor-pointer"
                                        onClick={() => removeTag(value)}
                                    >
                                        &times;
                                    </button>
                                    <input type="hidden" name={fieldName} value={value} />
                                </span>
                            ))}
                        </div>

                        <input
                            type="text"
                            className="input"
                            placeholder="Digite e pressione Enter para adicionar"
                            value={tagText}
                            onChange={(e) => setTagText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addTag()
                                }
                            }}
                            onBlur={addTag}
                        />

                    </div>

                ) : (

                    <div className="flex flex-col gap-1 text-[13px] w-full max-h-56 overflow-y-auto">

                        {options.map((option, index) => (
                            <CustomCheckbox
                                key={`${fieldName}-${option.value}-${index}`}
                                name={fieldName}
                                value={option.value}
                                checked={selected.includes(String(option.value))}
                                onChange={(e) => toggleValue(option.value, e.target.checked)}
                                label={option.label}
                            />
                        ))}

                        {options.length === 0 && (
                            <span className="text-gray-600">Nenhuma opção disponível</span>
                        )}

                    </div>

                )}

            </div>
        )

    }

    export { FormMultiSelect }
