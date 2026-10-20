// BUSCA DA SIDEBAR (CAMPO "Busca"): COMPARTILHADA PELO MENU NORMAL (SidebarMenuPrimary) E PELA ÁRVORE DO MODO EDIÇÃO
// (SidebarEditorTree). SEM ACENTO E SEM DIFERENCIAR MAIÚSCULA: "formas de doar" ACHA "Formas de Doar", "secao" ACHA "Seção"
export const normalizarBusca = (texto) => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
