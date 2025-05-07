
    import { useState, useEffect } from 'react'
    import { FormInput, FormSelect, FormDate } from './'

    const FormSection = ({ data, index, button, form, loading }) => {

        const [formState, setFormState] = useState({})
        const [validRows, setValidRows] = useState({})
        
        useEffect(() => {
        
            const initialFormState = {}
            const initialValidRows = {}
            
            data.fields.forEach((field) => {

                const fieldName = field.field?.name || field.name
                
                initialFormState[fieldName] = field.field?.value || ''
                
                if (field.type === 'Frm' && field.field?.class.indexOf('data-hora') !== -1) {
                    
                    if(field.field?.value === '0000-00-00 00:00:00'){
                        initialFormState[fieldName] = null
                    } else {

                        const parseDate = field.field.value.split(' ');
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
                    
                    if (dateValue && dateValue !== '00/00/0000') {
                         
                        const parseDate = dateValue.split('/');
                        
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
                            
                            if (item.class.includes('valid valid-')) {
        
                                const key = item.class.split('valid valid-')[1];
        
                                initialValidRows[key] = item.value;
        
                            }

                        }


                    });

                }

                if(field.type === 'Rdo'){
                    
                    field.field.forEach((item) => {
                        
                        if(item.checked){
                            
                            initialFormState[item.name] = item.value || 0;
                            
                            if (item.class.includes('valid valid-')) {
        
                                const key = item.class.split('valid valid-')[1];
        
                                initialValidRows[key] = item.value;
        
                            }

                        }


                    });
                    
                }

                if (field.type === 'Cor') {
                    initialFormState[fieldName] = initialFormState[fieldName] || '#aabbcc'
                }

            })
            
            setFormState(initialFormState);
            setValidRows(initialValidRows);
                
        }, [ data ]);

        const handleInputChange = (name, value) => {
            
            setFormState((prev) => ({
                ...prev,
                [name]: value,
            }))

        }

        const handleSelectChange = (name, value) => {

            if(value == ''){
                return;
            }
            
            setFormState((prev) => ({
                ...prev,
                [name]: value,
            }))

        }

        const handleDateChange = (name, date) => {
            console.log(date);
            setFormState((prev) => ({
                ...prev,
                [name]: date,
            }))

        }

        const handleRadioChange = (name, value, className) => {
            
            if(className.includes('valid valid-')){
                
                const key = className.split('valid valid-')[1];
                const newItem = { [key]: value };

                setValidRows((prev) => ({ ...prev, ...newItem }));

            }
            
            setFormState((prev) => ({
                ...prev,
                [name]: value,
            }))

        }

        const handleCheckBoxChange = (fieldName, value, checked, className) => {

            if (className.includes('valid valid-')) {

                const key = className.split('valid valid-')[1];
                if (validRows[key]) {

                    const newValidRows = { ...validRows };
                    delete newValidRows[key];

                    setValidRows(newValidRows);

                } else {

                    const newItem = { [key]: value };

                    setValidRows((prev) => ({ ...prev, ...newItem }));

                }

            }
            
            setFormState((prev) => {

                const prevValues = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
        
                return {
                    ...prev,
                    [fieldName]: checked ? [...prevValues, value] : prevValues.filter((v) => v !== value),
                };

            });

        };

        const parseAttributes = (attrString) => {

            const attributes = {};
            const attrArray = attrString.split(' ');

            attrArray.forEach(attr => {

                const [key, value] = attr.split('=');
                if (key && value) {
                    attributes[key] = value.replace(/['"]/g, '');
                }

            });

            return attributes;

        };
        
        return (
            <div className="card pb-2.5 mb-6">

                <div className="card-header justify-center flex-col items-start" id="general_settings">
                    <h3 className="card-title">{data.title}</h3>
                    {data.subTitle && (<p className="text-2sm text-gray-700">{data.subTitle}</p>)}
                </div>

                <div className="card-body grid gap-5">

                    {data?.fields.map((field, idx) => {
                        
                        let { type, title, subtitle, field: fieldData, required, name, fieldClass, row_attr } = field
                        const fieldName = fieldData?.name || name

                        const parsedAttributes = parseAttributes(row_attr);

                        let combinedClassName = `flex items-center flex-wrap lg:flex-nowrap gap-2.5 ${parsedAttributes.class || ''}`;
                        delete parsedAttributes.class; 
                        
                        //VERIFICA SE EXISTE UMA KEY COMEÇANDO COM OS CARACTERES 'data-valid-' NO parsedAttributes
                        if(parsedAttributes && Object.keys(parsedAttributes).length > 0 && Object.keys(parsedAttributes).some(key => key.startsWith('data-valid-'))){
                                    
                            const key = Object.keys(parsedAttributes).find(key => key.startsWith('data-valid-')).replace('data-valid-', '');
                            
                            if (parsedAttributes['data-valid-' + key] != validRows[key]){
                                return;
                            }
                                
                        }
                        
                        if (!fieldData) return null

                        if(fieldData?.class && fieldData?.class.includes('date-picker')){
                            type = 'Dta';
                        }
                        
                        switch (type) {
                            case 'Frm':
                            case 'Psw':
                            case 'Val':
                            case 'Hdn':
                            case 'Txt':
                            case 'Lis':
                            case 'Arq':
                            case 'Fto':
                            case 'Din':
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
                                        <div className="form-label max-w-56">
                                            <b>
                                                {title}
                                                {required && (
                                                    <span className="text-danger"> {' '} *</span>
                                                )}
                                            </b>
                                            {subtitle && (
                                                <span className="text-[10px]">
                                                    {' '}
                                                    {subtitle}{' '}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-3.5">

                                            {fieldData.map((item, index) => (                                                
                                                
                                                <label
                                                    key={`${fieldName}-${index}-${idx}`}
                                                    className="form-label flex items-center gap-2.5"
                                                >
                                                    <input
                                                        className={"radio radio-sm " + item.class}
                                                        name={item.name}
                                                        id={item.id}
                                                        checked={
                                                            formState[item.name] === item.value
                                                        }
                                                        onChange={(e) =>
                                                            handleRadioChange(fieldName, e.target.value, item.class)
                                                        }
                                                        type="radio"
                                                        value={item.value}
                                                    />

                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="text-[13px] font-semibold text-gray-900">
                                                            {item.title}
                                                        </div>
                                                    </div>

                                                </label>

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

                                        <div className="form-label max-w-56">
                                            <b>
                                                {title}
                                                {required && (
                                                    <span className="text-danger"> {' '} *</span>
                                                )}
                                            </b>
                                            {subtitle && (
                                                <span className="text-[10px]">
                                                    {' '}
                                                    {subtitle}{' '}
                                                </span>
                                            )}
                                        </div>

                                        <div className={'flex flex-col gap-2 text-[13px]'}>

                                            {fieldData.map((item, index) => (

                                                <div
                                                    key={`${item.name}-${index}-${idx}`}
                                                    className="flex"
                                                >
                                                    <label className="form-label gap-2 items-center">

                                                        <input
                                                            type="checkbox"
                                                            className="checkbox"
                                                            name={item.name}
                                                            value={item.value}
                                                            checked={(formState[item.name] || []).includes(item.value)}
                                                            onChange={(e) =>
                                                                handleCheckBoxChange(item.name, item.value, e.target.checked, item.class)
                                                            }
                                                        />

                                                        {item.title}

                                                    </label>
                                                </div>

                                            ))}

                                        </div>

                                    </div>
                                )

                            case 'Qnt':
                            case 'Sel':
                            case 'Man':

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

                            case 'Cod':
                                return fieldData?.value || '-'
                            break;
                            case 'Tab':
                            case 'Mul':
                            default:
                                return null
                        }
                    })}

                    {button && form.submit_button && (

                        <div className="flex justify-start">
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
                        
                    )}

                </div>

            </div>
        )

    }

    export { FormSection }
