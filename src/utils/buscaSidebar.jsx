// BUSCA DA SIDEBAR (CAMPO "Busca"): COMPARTILHADA PELO MENU NORMAL (SidebarMenuPrimary) E PELA ÁRVORE DO MODO EDIÇÃO
// (SidebarEditorTree). SEM ACENTO E SEM DIFERENCIAR MAIÚSCULA: "formas de doar" ACHA "Formas de Doar", "secao" ACHA "Seção"

export const normalizarBusca = (texto) => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

//NOME COM O TRECHO BUSCADO MARCADO (O ÍNDICE VEM DO TEXTO SEM ACENTO, QUE TEM O MESMO TAMANHO DO ORIGINAL). COR NO
//.editor-tree-busca DO globals.css
export const DestaqueBusca = ({ texto, termo }) => {

    const valor  = String(texto ?? '')
    const inicio = termo ? normalizarBusca(valor).indexOf(termo) : -1
    if (inicio < 0) return valor

    return (
        <>
            {valor.slice(0, inicio)}
            <mark className="editor-tree-busca">{valor.slice(inicio, inicio + termo.length)}</mark>
            {valor.slice(inicio + termo.length)}
        </>
    )

}
