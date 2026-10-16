export const resolveFormMask = (mask, fieldName) => {
    // Telefone aceita fixo e celular; o IMask escolhe pelo total de dígitos.
    // O WhatsApp continua usando a máscara recebida da API.
    if (fieldName === 'FrmTelefone') {
        return [
            { mask: '(00) 0000-0000' },
            { mask: '(00) 00000-0000' },
        ]
    }

    return mask === 'Number' ? Number : mask
}
