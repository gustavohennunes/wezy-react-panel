
    import { useState, useEffect, useMemo } from 'react'
    import { toast } from 'sonner'
    import { FormInput, FormSelect, FormMultiSelect, FormDate } from './'
    import { CustomCheckbox, CustomRadio } from './CustomFields'

    //CHAVE DO CONTROLADOR DE LINHAS CONDICIONAIS: CLASSE "valid valid-xxx" -> "xxx"
    export const chaveValid = (className) => /(?:^|\s)valid-([^\s]+)/.exec(className || '')?.[1] || null

    //validRows/setValidRows/controladores VÊM DO FormContext: SÃO DO FORMULÁRIO INTEIRO, COMO NO painel.js LEGADO
    //(ajustaValidFromTr) — O CONTROLADOR (ex.: "Copiar Section") PODE ESTAR EM OUTRA SEÇÃO DAS LINHAS QUE ELE MOSTRA
    //categoriaAtiva: ABA DE CATEGORIA DO FormContext (Javascript:openCategory('x') DO CARTÃO projetos-css-padrao). LINHA COM
    //data-category DE OUTRA ABA FICA ESCONDIDA (NO DOM, PARA O VALOR IR NO ENVIO, COMO O .hide() DO LEGADO); "url" APARECE EM TODAS
    const FormSection = ({ data, index, button, form, loading, validRows = {}, setValidRows = () => {}, controladores = new Set(), oculta = false, categoriaAtiva = null }) => {

        const [formState, setFormState] = useState({})

        useEffect(() => {

            const initialFormState = {}
            
            data.fields.forEach((field) => {

                const fieldName = field.field?.name || field.name

                initialFormState[fieldName] = field.field?.value || ''

                //Man/Ico NÃO RECEBEM value DA PONTE — O VALOR ATUAL VEM NO selected DAS OPTIONS.
                //SEM ISSO, ABRIR O "ALTERAR" E SALVAR SEM TOCAR APAGARIA O VALOR GRAVADO.
                if (!initialFormState[fieldName] && Array.isArray(field.field?.options)) {

                    const selectedOption = field.field.options.find(
                        (option) => option.selected === true || option.selected === 'selected'
                    )

                    if (selectedOption) {
                        initialFormState[fieldName] = selectedOption.value
                    }

                }
                
                //Dtm (DATA E HORA) CHEGA NO FORMATO DO LEGADO "dd/mm/aaaa - hh:mm"
                if ((field.type === 'Frm' || field.type === 'Dtm') && (field.field?.class || '').indexOf('data-hora') !== -1) {
                    
                    if(!field.field?.value || field.field?.value === '0000-00-00 00:00:00' || field.field?.value == ''){
                        initialFormState[fieldName] = null
                    } else {

                        const parseDate = field?.field?.value?.replace(' - ', ' ').split(' ');
                        const dateValue = parseDate[0].split('/');
                        const timeValue = parseDate[1].split(':');
                        
                        const parsedDate = new Date(dateValue[2] + '-' + dateValue[1] + '-' + dateValue[0] + 'T' + timeValue[0] + ':' + timeValue[1] + ':00Z');
                        
                        if (!isNaN(parsedDate)) {
                            initialFormState[fieldName] = parsedDate
                        }

                    }

                }

                if (field.type === 'Dta') {
                    
                    const dateValue = field.field?.value
                    
                    if (dateValue && dateValue !== '00/00/0000' && dateValue != '') {
                         
                        const parseDate = dateValue?.split('/');
                        
                        const parsedDate = new Date(parseDate[2] + '-' + parseDate[1] + '-' + parseDate[0]+'T12:00:00Z');
                        
                        if (!isNaN(parsedDate)) {
                            initialFormState[fieldName] = parsedDate
                        }

                    }

                }

                if (field.type === 'Ckb') {
                    
                    field.field.forEach((item) => {
                        
                        if (!initialFormState[item.name]){
                            initialFormState[item.name] = [];
                        }

                        if (item.value && item.checked){
                            
                            initialFormState[item.name].push(item.value);
                            

                        }


                    });

                }

                if(field.type === 'Rdo'){
                    
                    field.field.forEach((item) => {
                        
                        if(item.checked){
                            
                            initialFormState[item.name] = item.value || 0;
                            

                        }


                    });
                    
                }

                if (field.type === 'Cor') {
                    initialFormState[fieldName] = initialFormState[fieldName] || '#aabbcc'
                }

            })
            
            setFormState(initialFormState);
                
        }, [ data ]);

        const handleInputChange = (name, value) => {
            
            setFormState((prev) => ({
                ...prev,
                [name]: value,
            }))

        }

        // ----- BUSCA DE CEP (jscripts/framework.js DO LEGADO: triggerBuscarCep) -----
        //O CARTÃO MARCA OS CAMPOS COM data-buscar-cep="cep|rua|bairro|cidade|estado|complemento" NO attr. O CAMPO cep
        //GANHA O BOTÃO "Buscar endereço" (E O ENTER); A RESPOSTA DO viacep PREENCHE OS OUTROS CAMPOS DESTA SEÇÃO
        const camposCep = useMemo(() => {
            const mapa = {}
            ;(data?.fields || []).forEach((field) => {
                const papel = /data-buscar-cep="(\w+)"/.exec(field.field?.attr || '')?.[1]
                if (papel && !mapa[papel]) mapa[papel] = field
            })
            return mapa
        }, [data])

        const [buscandoCep, setBuscandoCep] = useState(false)

        const buscarCep = async () => {

            const campoCep = camposCep.cep
            if (!campoCep || buscandoCep) return

            const cep = String(formState[campoCep.field?.name || campoCep.name] || '').replace(/\D/g, '')
            if (cep === '') return

            if (cep.length !== 8) {
                toast.error('Formato de CEP inválido!')
                return
            }

            setBuscandoCep(true)

            try {

                const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
                if (!resposta.ok) throw new Error()
                const endereco = await resposta.json()

                if (endereco.erro) {
                    toast.error('CEP inexistente!')
                    return
                }

                const valores = {
                    rua: endereco.logradouro,
                    bairro: endereco.bairro,
                    complemento: endereco.complemento,
                    cidade: endereco.localidade,
                    estado: endereco.uf,
                }

                setFormState((prev) => {

                    const proximo = { ...prev }

                    Object.entries(valores).forEach(([papel, valor]) => {

                        const campo = camposCep[papel]
                        if (!campo) return

                        const nome = campo.field?.name || campo.name
                        let usar = valor ?? ''

                        //ESTADO EM SELECT: A OPÇÃO PODE TER A SIGLA ("SC") OU O NOME ("Santa Catarina") COMO VALOR OU RÓTULO
                        if (Array.isArray(campo.field?.options)) {
                            const alvo = [endereco.uf, endereco.estado].filter(Boolean).map((t) => String(t).toLowerCase())
                            const opcao = campo.field.options.find((o) =>
                                alvo.includes(String(o.value ?? '').toLowerCase()) || alvo.includes(String(o.label ?? '').trim().toLowerCase())
                            )
                            if (!opcao) return
                            usar = opcao.value
                        }

                        proximo[nome] = usar

                    })

                    return proximo

                })

            } catch {
                toast.error('Formato de CEP inválido!')
            } finally {
                setBuscandoCep(false)
            }

        }

        const handleSelectChange = (name, value) => {

            if(value == ''){
                return;
            }

            //'-1' É O PLACEHOLDER "Selecione uma opção" DO FormSelect — GRAVA VAZIO, NÃO '-1'
            if (value === '-1') {
                value = ''
            }

            //SELECT CONTROLADOR DE LINHAS (classe valid valid-xxx)
            const campoSelect = data.fields.find((f) => (f.field?.name || f.name) === name)
            const keySelect = chaveValid(campoSelect?.field?.class)
            if (keySelect) {
                setValidRows((prev) => ({ ...prev, [keySelect]: value }));
            }

            setFormState((prev) => ({
                ...prev,
                [name]: value,
            }))

        }

        const handleDateChange = (name, date) => {
            
            setFormState((prev) => ({
                ...prev,
                [name]: date,
            }))

        }

        const handleRadioChange = (name, value, className) => {
            
            const key = chaveValid(className)
            if (key) {
                setValidRows((prev) => ({ ...prev, [key]: value }));
            }
            
            setFormState((prev) => ({
                ...prev,
                [name]: value,
            }))

        }

        const handleCheckBoxChange = (fieldName, value, checked, className) => {

            //CHECKBOX CONTROLADOR: MARCADO VALE O value, DESMARCADO VALE '' (painel.js)
            const key = chaveValid(className)
            if (key) {
                setValidRows((prev) => ({ ...prev, [key]: checked ? value : '' }));
            }
            
            setFormState((prev) => {

                const prevValues = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
        
                return {
                    ...prev,
                    [fieldName]: checked ? [...prevValues, value] : prevValues.filter((v) => v !== value),
                };

            });

        };

        //ATRIBUTOS DA LINHA (row_attr). ANTES SEPARAVA POR ESPAÇO E QUEBRAVA VALOR COM ESPAÇO: data-style="Primária Hover"
        //VIRAVA data-style="Primária" (O "Abrir parâmetros" DA FOLHA DE ESTILO NÃO ACHAVA AS LINHAS DO ESTILO)
        const parseAttributes = (attrString) => {

            const attributes = {};

            for (const [, key, aspasDuplas, aspasSimples, semAspas] of String(attrString || '').matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
                attributes[key] = aspasDuplas ?? aspasSimples ?? semAspas ?? '';
            }

            return attributes;

        };
        
        //NUMERAÇÃO DA SEÇÃO (campo Cab) — a ponte já envia a contagem incremental
        const temNumero       = data.number || data.number === 0
        const numeroFormatado = temNumero ? String(data.number).padStart(2, '0') : ''

        //SEÇÃO SEM TÍTULO NEM NÚMERO (ex.: CARTÃO SÓ COM CAMPOS aut, COMO O relatorio-vendas): SEM A FAIXA DO CABEÇALHO VAZIA
        const temCabecalho = temNumero || Boolean(String(data.title ?? '').trim()) || Boolean(data.subTitle)

        return (
            <div className={`card mb-3${oculta ? ' !hidden' : ''}`}>

                {temCabecalho && (
                <div className="card-header !min-h-[46px] !py-2.5 bg-[color:var(--form-header-bg)] rounded-t-[8px]" id="general_settings">

                    <div className="flex items-center gap-2.5">

                        {/* NUMERAÇÃO DA SEÇÃO — compacta para não disputar atenção com o título */}
                        {temNumero && (
                            <span className="flex size-[22px] shrink-0 items-center justify-center rounded bg-primary text-[11px] font-semibold tabular-nums text-primary-inverse">
                                {numeroFormatado}
                            </span>
                        )}

                        <div className="flex flex-col gap-px">

                            <h3 className="text-[13px] font-semibold leading-tight text-gray-900">
                                {data.title}
                            </h3>

                            {data.subTitle && (
                                <p className="text-[11px] font-normal leading-tight text-gray-500">
                                    {data.subTitle}
                                </p>
                            )}

                        </div>

                    </div>

                </div>
                )}

                {/* CADA CAMPO GANHA UMA LINHA SEPARADORA ACIMA (EXCETO O PRIMEIRO).
                    O padding lateral SAI do container e vai para cada linha, senão a borda
                    ficaria recuada nas laterais em vez de atravessar o card inteiro. */}
                <div className="card-body !px-0 grid gap-4 [&>*+*]:border-t [&>*+*]:border-[color:var(--form-divider)] [&>*+*]:pt-4">

                    {data?.fields.map((field, idx) => {
                        
                        let { type, title, subtitle, field: fieldData, required, name, fieldClass, row_attr } = field
                        const fieldName = fieldData?.name || name

                        const parsedAttributes = parseAttributes(row_attr);

                        //px-4 = mesmo recuo que o .card-body tinha (custom.components.card.px)
                        let combinedClassName = `flex items-start flex-wrap lg:flex-nowrap gap-2.5 lg:gap-4 px-4 ${parsedAttributes.class || ''}`;
                        delete parsedAttributes.class; 

                        const categoriaLinha = parsedAttributes['data-category']
                        if (categoriaAtiva && categoriaLinha && categoriaLinha !== 'url' && categoriaLinha !== categoriaAtiva) {
                            combinedClassName += ' !hidden'
                        }
                        
                        //LINHA CONDICIONAL: TODOS OS data-valid-* PRECISAM CASAR (ex.: "Métodos liberados" EXIGE
                        //data-valid-ativar-api="ok" E data-valid-limitar-metodos="ok"). ANTES SÓ O PRIMEIRO
                        //ERA CONFERIDO E A LINHA APARECIA COM APENAS UMA DAS CONDIÇÕES ATIVA.
                        const condicoesValid = Object.keys(parsedAttributes).filter((attr) => attr.startsWith('data-valid-'))

                        //COMO O ajustaValidFromTr DO painel.js: "1|2" ACEITA QUALQUER UM DOS VALORES, E CONDIÇÃO SEM CAMPO
                        //CONTROLADOR NO FORMULÁRIO NÃO ESCONDE A LINHA
                        const condicaoFalha = (attr) => {
                            const chave = attr.replace('data-valid-', '')
                            if (!controladores.has(chave)) return false
                            const permitidos = String(parsedAttributes[attr] ?? '').split('|')
                            return !permitidos.includes(String(validRows[chave] ?? ''))
                        }

                        if (condicoesValid.some(condicaoFalha)) {
                            return;
                        }
                        
                        if (!fieldData) return null

                        if(fieldData?.class && fieldData?.class.includes('date-picker')){
                            type = 'Dta';
                        }
                        
                        switch (type) {
                            //Hdn NÃO RENDERIZA LINHA — OS VALORES VÊM EM form.hidden_fields (FormContext)
                            case 'Hdn':
                                return null

                            case 'Frm':
                            case 'Dtm':
                            case 'Psw':
                            case 'Val':
                            case 'Txt':
                            case 'Lis':
                            case 'Arq':
                            case 'Fto':
                            case 'Din':
                            case 'Cod':
                            case 'aut':
                            case 'Cor':
                                
                                if (fieldData.class.indexOf('data-hora') !== -1){

                                    return (
                                        <FormDate
                                            key={`${fieldName}-${idx}`}
                                            title={title}
                                            idx={idx}
                                            ampm={true}
                                            fieldName={fieldName}
                                            fieldData={fieldData}
                                            formState={formState}
                                            fieldClass={fieldClass}
                                            combinedClass={combinedClassName}
                                            parsedAttributes={parsedAttributes}
                                            handleDateChange={handleDateChange}
                                        />
                                    )

                                } else {

                                    return (
                                        <FormInput
                                            key={`${fieldName}-${idx}`}
                                            type={type}
                                            title={title}
                                            subtitle={subtitle}
                                            fieldMask={fieldData.mask}
                                            fieldName={fieldName}
                                            fieldClass={fieldClass}
                                            fieldData={fieldData}
                                            formState={formState}
                                            required={required}
                                            combinedClass={combinedClassName}
                                            rowAttr={parsedAttributes}
                                            handleInputChange={handleInputChange}
                                            buscaCep={camposCep.cep === field ? { buscar: buscarCep, buscando: buscandoCep } : null}
                                        />
                                    )

                                }
                                
                            case 'Rdo':

                                return (
                                    <div
                                        key={`${fieldName}-${idx}`}
                                        className={combinedClassName}
                                        {...parsedAttributes}
                                    >
                                        <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
                                            <b>
                                                {title}
                                                {required && (
                                                    <span className="text-danger"> {' '} *</span>
                                                )}
                                            </b>
                                            {subtitle && (
                                                <span className="text-[10px] text-gray-600">
                                                    {' '}
                                                    {subtitle}{' '}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">

                                            {fieldData.map((item, index) => (

                                                <CustomRadio
                                                    key={`${fieldName}-${index}-${idx}`}
                                                    name={item.name}
                                                    value={item.value}
                                                    checked={formState[item.name] === item.value}
                                                    className={item.class}
                                                    onChange={(e) =>
                                                        handleRadioChange(fieldName, e.target.value, item.class)
                                                    }
                                                    label={item.title}
                                                />

                                            ))}

                                        </div>

                                    </div>
                                )

                            case 'Ckb':
                                
                                return (
                                    <div
                                        key={`${fieldName}-${idx}`}
                                        className={combinedClassName} 
                                        {...parsedAttributes}
                                    >

                                        <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
                                            <b>
                                                {title}
                                                {required && (
                                                    <span className="text-danger"> {' '} *</span>
                                                )}
                                            </b>
                                            {subtitle && (
                                                <span className="text-[10px] text-gray-600">
                                                    {' '}
                                                    {subtitle}{' '}
                                                </span>
                                            )}
                                        </div>

                                        <div className={'flex flex-col gap-1 text-[13px]'}>

                                            {fieldData.map((item, index) => (

                                                <CustomCheckbox
                                                    key={`${item.name}-${index}-${idx}`}
                                                    name={item.name}
                                                    value={item.value}
                                                    checked={(formState[item.name] || []).includes(item.value)}
                                                    onChange={(e) =>
                                                        handleCheckBoxChange(item.name, item.value, e.target.checked, item.class)
                                                    }
                                                    label={item.title}
                                                />

                                            ))}

                                        </div>

                                    </div>
                                )

                            case 'Qnt':
                            case 'Sel':
                            case 'Man':
                            case 'Ico':

                                return (
                                    <FormSelect
                                        key={`${fieldName}-${idx}`}
                                        field={field}
                                        fieldName={fieldName}
                                        fieldData={fieldData}
                                        formState={formState}
                                        required={required}
                                        combinedClass={combinedClassName}
                                        rowAttr={parsedAttributes}
                                        handleSelectChange={handleSelectChange}
                                    />
                                )

                            case 'Dta':

                                return (
                                    <FormDate
                                        key={`${fieldName}-${idx}`}
                                        title={title}
                                        idx={idx}
                                        fieldName={fieldName}
                                        fieldData={fieldData}
                                        formState={formState}
                                        fieldClass={fieldClass}
                                        combinedClass={combinedClassName}
                                        parsedAttributes={parsedAttributes}
                                        handleDateChange={handleDateChange}
                                    />
                                )

                            case 'Mul':

                                return (
                                    <FormMultiSelect
                                        key={`${fieldName}-${idx}`}
                                        title={title}
                                        subtitle={subtitle}
                                        fieldName={fieldName}
                                        fieldData={fieldData}
                                        required={required}
                                        combinedClass={combinedClassName}
                                        rowAttr={parsedAttributes}
                                    />
                                )

                            case 'Tab':

                                //TABELA READ-ONLY ({header, rows}) — A PONTE ATUAL NÃO ENVIA OS DADOS
                                //DO Tab (field chega vazio); NESSE CASO NÃO RENDERIZA NADA
                                if (!(fieldData.header?.length || fieldData.rows?.length)) {
                                    return null
                                }

                                return (
                                    <div key={`${fieldName}-${idx}`} className={combinedClassName} {...parsedAttributes}>

                                        {title !== false && (
                                            <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
                                                <b>{title}</b>
                                                {subtitle && (<span className="text-[10px] text-gray-600"> {subtitle} </span>)}
                                            </div>
                                        )}

                                        <div className="w-full overflow-x-auto">
                                            <table className="table table-auto w-full text-[13px]">

                                                {(fieldData.header || []).length > 0 && (
                                                    <thead>
                                                        {fieldData.header.map((headerRow, hIdx) => (
                                                            <tr key={`tab-h-${hIdx}`}>
                                                                {(headerRow.columns || []).map((col, cIdx) => (
                                                                    <th
                                                                        key={`tab-h-${hIdx}-${cIdx}`}
                                                                        style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}
                                                                        dangerouslySetInnerHTML={{ __html: col.content }}
                                                                    />
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </thead>
                                                )}

                                                <tbody>
                                                    {(fieldData.rows || []).map((row, rIdx) => (
                                                        <tr key={`tab-r-${rIdx}`}>
                                                            {(row.columns || []).map((col, cIdx) => (
                                                                <td
                                                                    key={`tab-r-${rIdx}-${cIdx}`}
                                                                    dangerouslySetInnerHTML={{ __html: col.content }}
                                                                />
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>

                                            </table>
                                        </div>

                                    </div>
                                )

                            //Cab CONDICIONAL DENTRO DA SEÇÃO (VER FormContext) — TÍTULO EM LINHA, COM OS ATRIBUTOS
                            //DA PONTE PARA O JS DO CARD (ex.: useLegacyModoCriacao) PODER ESCONDÊ-LO
                            case 'Cab': {

                                const numero = fieldData?.value?.number
                                const titulo = String(fieldData?.value?.title || '').split('//')[0].trim()

                                return (
                                    <div
                                        key={`${fieldName}-${idx}`}
                                        className="flex items-center gap-2.5 px-4"
                                        {...parsedAttributes}
                                    >
                                        {(numero || numero === 0) && (
                                            <span className="flex size-[22px] shrink-0 items-center justify-center rounded bg-primary text-[11px] font-semibold tabular-nums text-primary-inverse">
                                                {String(numero).padStart(2, '0')}
                                            </span>
                                        )}
                                        <h3 className="text-[13px] font-semibold leading-tight text-gray-900">{titulo}</h3>
                                    </div>
                                )

                            }

                            default:
                                return null
                        }
                    })}

                    {button && form.submit_button && (

                        // ALINHADO COM A COLUNA DOS CAMPOS (O SEPARADOR VEM DO CONTAINER)
                        <div className="flex flex-wrap lg:flex-nowrap gap-2.5 lg:gap-4 px-4">

                            <div className="hidden lg:block lg:w-56 lg:min-w-56 lg:shrink-0"></div>

                            <div className="w-full lg:flex-1">
                                <button type="submit" className="btn btn-success" disabled={loading ? true : false}>
                                    {loading ? (
                                        <>
                                            Carregando...
                                        </>
                                    ) : (
                                        <>
                                            {form.submit_button}
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>

                    )}

                </div>

            </div>
        )

    }

    export { FormSection }
