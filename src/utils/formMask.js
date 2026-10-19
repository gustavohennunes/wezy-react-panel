export const resolveFormMask = (mask, fieldName) => {
    // Telefone aceita fixo e celular; o IMask escolhe pelo total de dígitos.
    // O WhatsApp continua usando a máscara recebida da API.
    if (fieldName === 'FrmTelefone') {
        return [
            { mask: '(00) 0000-0000' },
            { mask: '(00) 00000-0000' },
        ]
    }

    //Site NÃO É PADRÃO DO IMask: O FormInput FORMATA NO onChange (VER formatarSite)
    if (mask === 'Site') return undefined

    return mask === 'Number' ? Number : mask
}

// MÁSCARA Site DO LEGADO (jscripts/mascaras.js): O ENDEREÇO SEMPRE COMEÇA COM "https://". DIGITAR "h" VIRA "https://h";
// COLAR "http://site.com" OU "https://site.com" FICA "https://site.com"; APAGAR TUDO DEIXA O CAMPO VAZIO
export const formatarSite = (valor) => {
    const semProtocolo = String(valor ?? '').trim().replace(/^(https?:\/{0,2})+/i, '')
    return semProtocolo === '' ? '' : 'https://' + semProtocolo
}
