import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
    import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
    import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
    import { DatePicker } from '@mui/x-date-pickers/DatePicker';
    import dayjs from 'dayjs';
    import utc from 'dayjs/plugin/utc'; 
    import customParseFormat from 'dayjs/plugin/customParseFormat';

    dayjs.extend(customParseFormat);
    dayjs.extend(utc);

    const FormDate = ({ title, idx, fieldName, fieldClass, combinedClass, rowAttr, fieldData, formState, handleDateChange, ampm = false }) => {
        
        let requiredField = false
        if ((fieldClass + fieldData.class).indexOf('obg') !== -1) {
            requiredField = true
        }

        // FUNÇÃO PARA INTERPRETAR O VALOR DA DATA CORRETAMENTE
        const parseDate = (dateStr) => {
            
            if (!dateStr || dateStr === '') return null;

            try {
                // Se já for um objeto dayjs
                if (dayjs.isDayjs(dateStr)) {
                    return dateStr;
                }
                
                // Se for um objeto Date
                if (dateStr instanceof Date) {
                    return dayjs(dateStr);
                }
                
                // Se for string
                if (typeof dateStr === 'string') {
                    // Verifica se é uma data no formato DD/MM/YYYY
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                        const [day, month, year] = dateStr.split('/');
                        // Criar a data usando ano-mês-dia para evitar problemas de timezone
                        const jsDate = new Date(`${year}-${month}-${day}T12:00:00`);
                        return dayjs(jsDate);
                    }
                    
                    // Verifica se é uma data no formato YYYY-MM-DD (formato ISO)
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                        return dayjs(dateStr + 'T12:00:00');
                    }
                    
                    // Para datas com hora no formato brasileiro
                    if (/^\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}$/.test(dateStr)) {
                        const parts = dateStr.split(' - ');
                        const [day, month, year] = parts[0].split('/');
                        const time = parts[1];
                        return dayjs(`${year}-${month}-${day}T${time}:00`);
                    }
                    
                    // Tentativa com formato padrão
                    const parsedDate = dayjs(dateStr);
                    return parsedDate.isValid() ? parsedDate : null;
                }
                
                return null;
            } catch (e) {
                console.error("Erro ao processar data:", e);
                return null;
            }
        };
        
        return (
            <div className={combinedClass} {...rowAttr}>

                <label className="form-label flex items-center gap-1 max-w-56">
                    <b>
                        {fieldData.title || title}
                        {requiredField && (
                            <span className="text-danger"> *</span>
                        )}
                    </b>
                </label>

                <LocalizationProvider dateAdapter={AdapterDayjs}>

                    {ampm === false ? (

                        <DatePicker 
                            key={`${fieldName}-${idx}`}
                            format='DD/MM/YYYY'                        
                            name={fieldName}
                            value={parseDate(formState[fieldName])}
                            required={requiredField}
                            onChange={(newValue) => {
                                const utcValue = newValue ? newValue.utc(true).format('YYYY-MM-DD') : null;
                                handleDateChange(fieldName, utcValue);
                            }}
                        />

                    ) : (

                        <DateTimePicker
                            key={`${fieldName}-${idx}`}
                            format='DD/MM/YYYY - HH:mm'
                            ampm={false}                            
                            name={fieldName}
                            value={parseDate(formState[fieldName])}
                            required={requiredField}
                            onChange={(newValue) => {
                                const utcValue = newValue ? newValue.utc(true).format('YYYY-MM-DD HH:mm') : null;
                                handleDateChange(fieldName, utcValue);
                            }}   
                        />

                    )}

                </LocalizationProvider>

            </div>
        )

    }

    export { FormDate }
