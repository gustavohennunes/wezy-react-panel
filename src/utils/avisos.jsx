import { toast } from 'sonner'

// TOASTS VERDE/VERMELHO DO FORMULÁRIO (MESMO VISUAL DO BOTÃO "Salvar" NO FormContext), PARA O Ctrl+S E O criaMsg DOS
// CARTÕES FICAREM IGUAIS AO SALVAR PELO BOTÃO
const estilo = (cor) => ({
    color: 'white',
    background: cor,
    border: 'none',
    fontWeight: 'bold',
})

export const avisoSucesso = (mensagem) =>
    toast('✅ Sucesso!', {
        description: <span style={{ color: 'white' }}>{mensagem}</span>,
        style: estilo('var(--tw-success)'),
    })

export const avisoErro = (mensagem) =>
    toast('❌ Erro: ', {
        description: <span style={{ color: 'white' }}>{mensagem}</span>,
        style: estilo('var(--tw-danger)'),
    })
