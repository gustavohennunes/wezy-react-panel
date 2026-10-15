    import React, { useId } from 'react'
    import { IMaskInput } from "react-imask";
    import { CurrencyInput } from 'react-currency-mask'
    import { FormFile } from './'
    import { FormColorPicker } from './FormColorPicker'
    import { FormIconSelector } from './FormIconSelector'
    import { isLegacyIconField } from '@/utils/legacyIcons'
    import { LegacyHtml } from '@/components/legacy/LegacyHtml'

    //CAMPOS NÃO OCUPAM A LINHA TODA: O CONTEÚDO É CURTO E O INPUT GIGANTE FICAVA VAZIO.
    //O TEXTAREA É MAIS LARGO; O EDITOR DE CÓDIGO (ace) CONTINUA 100% PORQUE NASCE NO WRAPPER
    const LARGURA_CAMPO = 'max-w-[420px]'
    const LARGURA_TEXTO = 'max-w-[700px]'

    const FormInput = ({ type, title, subtitle = '', combinedClass, rowAttr, fieldName, fieldMask, fieldClass = '', fieldData, formState, required = false, handleInputChange }) => {

        let inputElement

        //LIGA O <label> DO TÍTULO AO CONTROLE DO CAMPO (LEITOR DE TELA E CLIQUE NO TÍTULO FOCAM O INPUT)
        const inputId = useId()

        if (fieldMask == 'Number'){
            fieldMask = Number;
        }

        //FORMATOS PERMITIDOS ENVIADOS PELA PONTE (panel/module) VIRAM O accept DO INPUT
        const buildAccept = (fallback) => {

            if (Array.isArray(fieldData.formats) && fieldData.formats.length > 0) {
                return fieldData.formats.map((format) => `.${format}`).join(',')
            }

            return fallback

        }

        //EXTRAI O maxlength DO attr LEGADO (STRING HTML) QUANDO EXISTIR
        const attrMaxLength = (() => {
            const match = /maxlength="(\d+)"/.exec(fieldData.attr || '')
            return match ? parseInt(match[1], 10) : undefined
        })()
        
        switch (type) {
            case 'Frm':

                inputElement = (
                    <IMaskInput
                        mask={fieldMask}
                        className={`input w-full ${LARGURA_CAMPO} ${fieldClass} ${fieldData.class}`}
                        name={fieldName}
                        id={inputId}
                        value={formState[fieldName] || ''}
                        required={required}
                        onChange={(e) =>
                            handleInputChange(fieldName, e.target.value)
                        }
                    />
                );

            break
            case 'Val':

                inputElement = (
                    <CurrencyInput
                        hideSymbol={true}
                        onChangeValue={(event, originalValue, maskedValue) =>
                            handleInputChange(fieldName, maskedValue)
                        }
                        value={formState[fieldName] || 0}
                        InputElement={
                            <input
                                type={fieldData.type}
                                className={`input w-full ${LARGURA_CAMPO} ${fieldClass} ${fieldData.class}`}
                                name={fieldName}
                                id={inputId}
                                required={required}
                                maxLength={attrMaxLength || 13}
                            />
                        }
                    />
                )

            break
            case 'Psw':

                inputElement = (
                    <div
                        className={`input w-full ${LARGURA_CAMPO} ${fieldClass} ${fieldData.class}`}
                        data-toggle-password="true"
                    >
                        <input
                            name={fieldName}
                            id={inputId}
                            type="password"
                            required={required}
                            onChange={(e) =>
                                handleInputChange(fieldName, e.target.value)
                            }
                        />
                        <div
                            className="btn btn-icon"
                            data-toggle-password-trigger="true"
                        >
                            <i className="ki-outline ki-eye toggle-password-active:hidden"></i>
                            <i className="ki-outline ki-eye-slash hidden toggle-password-active:block"></i>
                        </div>
                    </div>
                )

            break
            case 'Hdn':

                inputElement = (
                    <input
                        type="hidden"
                        className={`input ${fieldClass}`}
                        name={fieldName}
                        value={formState[fieldName] || ''}
                        required={required}
                        onChange={(e) =>
                            handleInputChange(fieldName, e.target.value)
                        }
                    />
                )

            break
            case 'Txt':

                inputElement = (
                    <textarea
                        className={`input w-full ${LARGURA_TEXTO} min-h-[140px] py-2 leading-relaxed ${fieldClass} ${fieldData.class}`}
                        name={fieldName}
                        id={inputId}
                        value={formState[fieldName] || ''}
                        required={required}
                        onChange={(e) =>
                            handleInputChange(fieldName, e.target.value)
                        }
                    />
                )

            break
            case 'Lis':
            case 'Cod':
            case 'Din':

                //A PONTE PODE MANDAR HTML NO VALOR (LINKS DE DOWNLOAD, <br>) — RENDERIZA COMO HTML
                inputElement = (
                    <LegacyHtml
                        className={fieldData.class + ' text-[13px]'}
                        html={(fieldData.value || '') + (fieldData.extra_html || '')}
                    />
                )

            break
            case 'Fto':

                inputElement = (
                    <FormFile
                        id={inputId}
                        fieldName={fieldName}
                        multiple={true}
                        value={formState[fieldName] || ''}
                        accept={buildAccept('image/*')}
                        maxSize={5 * 1024 * 1024}
                    />
                )

            break
            case 'Arq':

                inputElement = (
                    <FormFile
                        id={inputId}
                        fieldName={fieldName}
                        multiple={true}
                        accept={buildAccept('*')}
                        maxSize={5 * 1024 * 1024}
                    />
                )

            break
            case 'aut':

                //GRADE DE SPRITES DO CARTÃO DE MÓDULOS VIRA O SELETOR DE KEENICONS (MESMOS HIDDEN FrmIconeX/FrmIconeY)
                if (isLegacyIconField(fieldData.extra_html)) {
                    inputElement = (
                        <FormIconSelector className={fieldData.class} html={fieldData.extra_html} />
                    )
                    break
                }

                inputElement = (
                    <div className={fieldData.class + ' text-[13px] w-full'}>
                        <LegacyHtml
                            style={{ display: 'contents' }}
                            html={fieldData.extra_html}
                        />
                    </div>
                )

            break
            case 'Cor':

                inputElement = (
                    <FormColorPicker
                        fieldName={fieldName}
                        color={formState[fieldName]}
                        onChange={(color) => handleInputChange(fieldName, color)}
                    />
                )

            break
            default:
                inputElement = null
            break
        }

        let requiredField = false
        if ((fieldClass + fieldData.class).indexOf('obg') !== -1) {
            requiredField = true
        }
        
        return (
            <div className={combinedClass} {...rowAttr}>

                {title !== false && (
                    <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
                        <label htmlFor={inputId}>
                            <b>
                                {title}
                                {requiredField && (
                                    <span className="text-danger"> *</span>
                                )}
                            </b>
                        </label>
                        {subtitle && <span className="text-[10px] text-gray-600"> {subtitle} </span>}
                    </div>
                )}

                <div className="w-full lg:flex-1 min-w-0">
                    {inputElement}
                </div>

            </div>
        )

    }

    export { FormInput }
