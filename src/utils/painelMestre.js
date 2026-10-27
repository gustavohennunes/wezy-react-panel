// LINK PARA O PAINEL MESTRE A PARTIR DO PAINEL DO CLIENTE: MESMO HOST SEM O "sub." (sub.app.wezy.com.br -> app.wezy.com.br),
// COMO O "Acessar painel" DO MESTRE FAZ NO SENTIDO CONTRÁRIO. path NO FORMATO "?pag=modulos&cliente=10"
export const urlDoPainelMestre = (path) => {
    const { protocol, host } = window.location
    return `${protocol}//${host.replace(/^sub\./, '')}/${String(path || '').replace(/^\/+/, '')}`
}
