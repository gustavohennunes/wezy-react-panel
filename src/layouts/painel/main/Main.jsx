
    import { Fragment, useState, useEffect, useRef } from 'react'
    import { Helmet } from 'react-helmet-async'
    import { Outlet, useLocation } from 'react-router'
    import { useMenuCurrentItem } from '@/components/menu'
    import { Footer, Header, Sidebar, Toolbar, ToolbarHeading } from '../'
    import { useMenus } from '@/providers'
    import { useResponsive } from '@/hooks'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { resolveModuleTitle, resolveModuleBreadcrumbs } from '@/utils/moduleHeading'
    import { api } from '@/services/api'
    import { usePageData } from '@/context/PageDataContext'
    import { Alert } from '@/components/alert'
    import { toast } from 'sonner'
    import { LegacyHtml } from '@/components/legacy/LegacyHtml'
    import { installLegacyBridge } from '@/utils/legacyBridge'

    //MENSAGENS QUE O CARTÃO DEFINE ($setMsgAlerta, $setMsgFormErro...) OU QUE A PONTE GERA (alterado=ok, inserido=erro...).
    //A PONTE AS ENVIA EM params.messages.{general|list|form}.{success|error|alert}
    const VARIANTE_MENSAGEM = { success: 'success', error: 'danger', alert: 'warning' }

    const mensagensDaPagina = (messages) => {

        const lista = []

        if (!messages || typeof messages !== 'object') {
            return lista
        }

        ;['general', 'list', 'form'].forEach((grupo) => {

            const itens = messages[grupo]
            if (!itens || typeof itens !== 'object') return

            Object.entries(itens).forEach(([tipo, texto]) => {
                if (typeof texto === 'string' && texto.trim() !== '' && VARIANTE_MENSAGEM[tipo]) {
                    lista.push({ variant: VARIANTE_MENSAGEM[tipo], html: texto })
                }
            })

        })

        return lista

    }

    //BASE64 DE UM TEXTO UTF-8 (O btoa SOZINHO SÓ ACEITA latin1). EM BLOCOS PARA NÃO ESTOURAR A PILHA
    //COM CSS GRANDE NO String.fromCharCode
    const utf8ParaBase64 = (texto) => {
        const bytes = new TextEncoder().encode(texto)
        let binario = ''
        for (let i = 0; i < bytes.length; i += 0x8000) {
            binario += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
        }
        return btoa(binario)
    }

    const Main = () => {

        const mobileMode        = useResponsive('down', 'lg');
        const { pathname, search } = useLocation();
        const { getMenuConfig } = useMenus();
        const menuConfig        = getMenuConfig('primary');
        const menuItem          = useMenuCurrentItem(pathname, menuConfig);
        const { pageData }      = usePageData();
        //slug/action SAEM DA URL ATUAL DO ROUTER (ANTES VINHAM DO AuthProvider, QUE FICA FORA DO
        //ROUTER E MANTINHA O VALOR ANTIGO DEPOIS DE UMA NAVEGAÇÃO SEM RELOAD)
        const urlParams         = new URLSearchParams(search);
        const slug              = urlParams.get('slug') ?? urlParams.get('pag') ?? '';
        const action            = urlParams.get('action') ?? '';
        const containerRef      = useRef(null);

        const [ pageMessage, setPageMessage ]     = useState('');
        const [ title, setTitle ]                 = useState('');
        const [ breadcrumbs, setBreadcrumbs ]     = useState('');
        const [ headerContent, setHeaderContent ] = useState('');
        const [ headerAfterContent, setHeaderAfterContent ] = useState('');
        const [ footerContent, setFooterContent ] = useState('');
        const [ pageCss, setPageCss ]             = useState('');
        const [ pageJs, setPageJs ]               = useState('');

        const [ titleMetatag, setTitleMetatag ]             = useState('Cayman Sistemas');
        const [ descriptionMetatag, setDescriptionMetatag ] = useState('');
        const [ faviconMetatag, setFaviconMetatag ]         = useState('https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/90426c66d0ad4e8318e8a9fba07dd9cb/favicon.png');
        
        const [ pageTitle, setPageTitle ] = useState(titleMetatag);
        
        useEffect(() => {

            //DIRECIONA A PÁGINA
            if(pageData?.params?.redirect) {
                window.location.href = pageData.params.redirect;
            }

            //A PONTE NÃO RESOLVE O NOME DOS SUBMÓDULOS (VER utils/moduleHeading.js),
            //ENTÃO TÍTULO E MIGALHAS SÃO COMPLETADOS PELA ÁRVORE DO panel/menus
            const slugAtual = slug || new URLSearchParams(window.location.search).get('pag') || '';
            const acaoAtual = new URLSearchParams(window.location.search).get('acao') || '';

            const tituloPagina = resolveModuleTitle(pageData?.params?.title, menuConfig, slugAtual);

            //SETA O TÍTULO DA METATAG
            let useTitle = titleMetatag;
            if(tituloPagina){
                useTitle = tituloPagina + ' - ' + titleMetatag;
            }

            setPageTitle(useTitle);

            //SETA O TÍTULO PRINCIPAL DA PÁGINA
            setTitle(tituloPagina);

            //SETA O BREADCRUMBS DA PÁGINA
            setBreadcrumbs(
                resolveModuleBreadcrumbs(pageData?.params?.breadcrumbs, menuConfig, slugAtual, acaoAtual)
                    .replaceAll('index.php', '')
                    .replaceAll('class="', 'class="text-[13px] ')
                    .replaceAll(' > ', '<i class="ki-filled ki-right text-gray-500 !text-[11px] mx-1"></i>')
            );

            //VERIFICA SE PRECISA MOSTRAR ALGUMA MENSAGEM
            if(pageData?.params?.message) {
                setPageMessage(pageData.params.message);
            } else if (action == 'finalizar-cadastro'){
                setPageMessage('Você está quase lá! Complete seu cadastro!');
            } else {
                setPageMessage('');
            }

            //VERIFICA CONTEÚDO ADICIONAL PARA CABEÇALHO E RODAPÉ
            if(pageData?.params?.extra_content?.header?.before){
                setHeaderContent(pageData?.params?.extra_content?.header.before);
            } else {
                setHeaderContent('');
            }
            //$cabecalhoPagina DO CARTÃO (HTML ANTES DA LISTAGEM — MUITAS VEZES OS FILTROS)
            if(pageData?.params?.extra_content?.header?.after){
                setHeaderAfterContent(pageData?.params?.extra_content?.header.after);
            } else {
                setHeaderAfterContent('');
            }
            if (pageData?.params?.extra_content?.footer) {
                setFooterContent(pageData?.params?.extra_content?.footer);
            } else {
                setFooterContent('');
            }

            //CSS VAI COMO data: URI EM BASE64 (UTF-8 SEGURO); O JS VAI COMO TEXTO. ANTES OS DOIS PASSAVAM
            //POR btoa(), QUE QUEBRA COM QUALQUER CARACTERE FORA DO latin1 (ç, é, emoji...)
            setPageCss(pageData?.css ? utf8ParaBase64(pageData.css) : '');
            setPageJs(pageData?.javascript || '');

        //menuConfig ENTRA NA LISTA PORQUE O MENU PODE CHEGAR DEPOIS DO MÓDULO
        }, [ pageData, menuConfig, slug, action, titleMetatag ]);

        //JS DOS CARTÕES CHAMA index.php?...&layout=false — REESCRITO PARA A API (VER utils/legacyBridge.js)
        useEffect(() => {
            installLegacyBridge();
        }, []);

        const mensagens = mensagensDaPagina(pageData?.params?.messages);

        useEffect(() => {
            
            const handleFormSubmit = async (event) => {
                
                if (event.target.classList.contains('custom-form')) {

                    event.preventDefault();

                    // Trate os dados do formulário
                    const formData = new FormData(event.target);
                    const data = Object.fromEntries(formData.entries());

                    const urlFormulario = window.location.search
                    
                    try{

                        let response = await api.post(
                            buildApiUrl(urlFormulario),
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                }
                            }
                        );

                        if(response?.data?.success?.response?.data?.params?.redirect) {
                            window.location.href = response?.data?.success?.response?.data?.params?.redirect;
                        } else {

                            toast(`❌ Erro: `, {
                                description: <span style={{ 'color': 'white' }}> {'Não foi possível realizar filtro!'}</span>,
                                style: {
                                    color: 'white',
                                    background: 'var(--tw-danger)',
                                    border: 'none',
                                    fontWeight: 'bold'
                                }
                            });

                        }

                    } catch (error) {
                        
                        toast(`❌ Erro: `, {
                            description: <span style = {{ 'color': 'white' }}> {'Não foi possível realizar filtro!'}</span>,
                            style: {
                                color: 'white',
                                background: 'var(--tw-danger)',
                                border: 'none',
                                fontWeight: 'bold'
                            }
                        })
                        
                    }
                    
                }

            };

            const containers = document.querySelectorAll('.custom-form');
            containers.forEach((container) => {
                container.addEventListener('submit', handleFormSubmit);
            });

            return () => {
                containers.forEach((container) => {
                    container.removeEventListener('submit', handleFormSubmit);
                });
            };

        });

        return (
            <Fragment>

                <Helmet>

                    <title>{pageTitle}</title>

                    <link rel="icon" type="image/png" href={faviconMetatag} />
                    <meta name="title" content={pageTitle} />
                    <meta name="description" content={descriptionMetatag} />                    

                    <script src="data:text/javascript;base64,DQpmdW5jdGlvbiBNYXNjYXJhKG8sZil7DQogICAgdl9vYmo9bw0KICAgIHZfZnVuPWYNCiAgICBzZXRUaW1lb3V0KCJleGVjbWFzY2FyYSgpIiwxKQ0KfQ0KDQovKkZ1bsOnw6NvIHF1ZSBFeGVjdXRhIG9zIG9iamV0b3MqLw0KZnVuY3Rpb24gZXhlY21hc2NhcmEoKXsNCiAgICB2X29iai52YWx1ZT12X2Z1bih2X29iai52YWx1ZSkNCn0NCg0KLypGdW7Dp8OjbyBxdWUgRGV0ZXJtaW5hIGFzIGV4cHJlc3PDtWVzIHJlZ3VsYXJlcyBkb3Mgb2JqZXRvcyovDQpmdW5jdGlvbiBsZWVjaCh2KXsNCiAgICB2PXYucmVwbGFjZSgvby9naSwiMCIpDQogICAgdj12LnJlcGxhY2UoL2kvZ2ksIjEiKQ0KICAgIHY9di5yZXBsYWNlKC96L2dpLCIyIikNCiAgICB2PXYucmVwbGFjZSgvZS9naSwiMyIpDQogICAgdj12LnJlcGxhY2UoL2EvZ2ksIjQiKQ0KICAgIHY9di5yZXBsYWNlKC9zL2dpLCI1IikNCiAgICB2PXYucmVwbGFjZSgvdC9naSwiNyIpDQogICAgcmV0dXJuIHYNCn0NCg0KLypGdW7Dp8OjbyBxdWUgcGVybWl0ZSBhcGVuYXMgbnVtZXJvcyovDQpmdW5jdGlvbiBJbnRlZ2VyKHYpew0KICAgIHJldHVybiB2LnJlcGxhY2UoL1xEL2csIiIpDQp9DQoNCmZ1bmN0aW9uIFNsdWdVcmwodikgew0KICAgIC8vIFJlbW92ZSBodHRwIG5vIGluw61jaW8sIHNlIGV4aXN0aXINCiAgICB2ID0gdi5yZXBsYWNlKC9eaHR0cDovaSwgJycpLnJlcGxhY2UoL15odHRwczovaSwgJycpOw0KICAgIC8vIEdhcmFudGUgcXVlIG7Do28gY29tZWNlIGNvbSAiLyINCiAgICB2ID0gdi5yZXBsYWNlKC9eXC8vLCAnJyk7DQogICAgdiA9IHYucmVwbGFjZSgvXC9cLy8sICdcLycpOw0KICAgIC8vIFBlcm1pdGUgYXBlbmFzIGxldHJhcyBtaW7DunNjdWxhcywgbsO6bWVyb3MsIHRyYcOnbyAiLSIgZSBiYXJyYSAiLyINCiAgICB2ID0gdi5yZXBsYWNlKC9bXmEtejAtOVwtXC9dL2csICcnKTsNCiAgICByZXR1cm4gdjsNCn0NCg0KZnVuY3Rpb24gU2x1Z1F1ZXJ5KHYpIHsNCiAgICAvLyBSZW1vdmUgaHR0cCBubyBpbsOtY2lvLCBzZSBleGlzdGlyDQogICAgdiA9IHYucmVwbGFjZSgvXmh0dHA6L2ksICcnKS5yZXBsYWNlKC9eaHR0cHM6L2ksICcnKTsNCiAgICAvLyBHYXJhbnRlIHF1ZSBuw6NvIGNvbWVjZSBjb20gIi8iDQogICAgdiA9IHYucmVwbGFjZSgvXlwvLywgJycpOw0KICAgIHYgPSB2LnJlcGxhY2UoL1wvXC8vLCAnXC8nKTsNCiAgICAvLyBQZXJtaXRlIGFwZW5hcyBsZXRyYXMgbWluw7pzY3VsYXMsIG7Dum1lcm9zLCB0cmHDp28gIi0iIGUgYmFycmEgIi8iDQogICAgdiA9IHYucmVwbGFjZSgvW15hLXowLTlcLVwvXD9cJlw9XS9nLCAnJyk7DQogICAgcmV0dXJuIHY7DQp9DQoNCi8qRnVuw6fDo28gcXVlIHBhZHJvbml6YSB0ZWxlZm9uZSAoMTEpIDQxODQtMTI0MSovDQpmdW5jdGlvbiBUZWxlZm9uZSh2KXsNCiAgICB2PXYucmVwbGFjZSgvXEQvZywiIik7DQogICAgdj12LnJlcGxhY2UoL14oXGRcZCkoXGQpL2csIigkMSkgJDIiKTsNCiAgICBpZih2Lmxlbmd0aD09MTQpew0KICAgICAgICB2PXYucmVwbGFjZSgvKFxkezV9KShcZCkvLCIkMS0kMiIpOyANCiAgICB9IGVsc2Ugew0KICAgICAgICB2PXYucmVwbGFjZSgvKFxkezR9KShcZCkvLCIkMS0kMiIpOyAgICANCiAgICB9DQogICAgcmV0dXJuIHY7DQp9DQoNCmZ1bmN0aW9uIFJlYWwodikgew0KICAgIHYgPSB2LnJlcGxhY2UoL1xEL2csICIiKTsNCiAgICB2ID0gdi5yZXBsYWNlKC8oXGQpKFxkezJ9KSQvLCAiJDEsJDIiKTsNCiAgICB2ID0gdi5yZXBsYWNlKC8oPz0oXGR7M30pKyhcRCkpXEIvZywgIi4iKTsNCiAgICByZXR1cm4gdjsNCn0NCg0KLypGdW7Dp8OjbyBxdWUgcGFkcm9uaXphIHRlbGVmb25lICgxMSkgNDE4NC0xMjQxIC0gKDExKSA0MTg0LTEyNDEgLSAoMTEpIDQxODQtMTI0MSovDQpmdW5jdGlvbiBNdWx0aVRlbGVmb25lKHYpew0KDQogICAgdiA9IHYucmVwbGFjZSgvXC8kL2dtaSwiIik7DQoNCiAgICB2ID0gdi5yZXBsYWNlKC9bXjAtOVwvXS9nLCIiKTsNCiAgICB2ID0gdi5yZXBsYWNlKC8oXGQpKFwvKS9nLCIkMSAkMiAiKTsNCg0KICAgIHYgPSB2LnJlcGxhY2UoLyhcZFxkKShcZCkvLCIoJDEpICQyIik7DQogICAgdiA9IHYucmVwbGFjZSgvIFwvIChcZFxkKShcZCkvZywiIC8gKCQxKSAkMiIpOw0KICAgIA0KICAgIHYgPSB2LnJlcGxhY2UoLyggWzldXGR7NH0pKFxkezR9KS9nLCIkMS0kMiIpOyANCiAgICB2ID0gdi5yZXBsYWNlKC8oXGR7NH0pKFxkezR9KS9nLCIkMS0kMiIpOyAgICANCiAgICB2ID0gdi5yZXBsYWNlKC8oXC1cZHs0fSkoXGQpL2csIiQxIC8gJDIiKTsgICAgDQogICAgDQogICAgdiA9IHYucmVwbGFjZSgvKFwoXGR7Mn1cKSBcZHs0LDV9XC1cZHs0fSBcLyBcKFxkezJ9XCkgXGR7NCw1fVwtXGR7NH0gXC8gXChcZHsyfVwpIFxkezQsNX1cLVxkezR9KSguKikvLCIkMSIpOw0KDQogICAgcmV0dXJuIHY7DQoNCn0NCg0KLypGdW7Dp8OjbyBxdWUgcGFkcm9uaXphIHRlbGVmb25lICgxMSkgNDE4NDEyNDEqLw0KZnVuY3Rpb24gVGVsZWZvbmVDYWxsKHYpew0KICAgIHY9di5yZXBsYWNlKC9cRC9nLCIiKSAgICAgICAgICAgICAgICAgDQogICAgdj12LnJlcGxhY2UoL14oXGRcZCkoXGQpL2csIigkMSkgJDIiKSAgICANCiAgICByZXR1cm4gdg0KfQ0KDQovKkZ1bsOnw6NvIHF1ZSBwYWRyb25pemEgQ1BGKi8NCmZ1bmN0aW9uIENwZih2KXsNCiAgICB2PXYucmVwbGFjZSgvXEQvZywiIikgICAgICAgICAgICAgICAgICAgIA0KICAgIHY9di5yZXBsYWNlKC8oXGR7M30pKFxkKS8sIiQxLiQyIikgICAgICAgDQogICAgdj12LnJlcGxhY2UoLyhcZHszfSkoXGQpLywiJDEuJDIiKSAgICAgICANCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA0KICAgIHY9di5yZXBsYWNlKC8oXGR7M30pKFxkezEsMn0pJC8sIiQxLSQyIikgDQogICAgcmV0dXJuIHYNCn0NCg0KLypGdW7Dp8OjbyBxdWUgcGFkcm9uaXphIENQRiovDQpmdW5jdGlvbiBQbGFjYSh2KXsNCg0KICAgIHYgPSB2LnJlcGxhY2UoL1wtL2csIiIpOw0KDQogICAgdmFyIGluaWNpbyAgPSB2LnN1YnN0cigwLDMpLnRvVXBwZXJDYXNlKCk7DQogICAgdmFyIGZpbmFsMSAgPSB2LnN1YnN0cigzLDEpOw0KICAgIHZhciBmaW5hbDIgID0gdi5zdWJzdHIoNCwgMSkudG9VcHBlckNhc2UoKTsNCiAgICB2YXIgZmluYWwzICA9IHYuc3Vic3RyKDUpOw0KDQogICAgaW5pY2lvID0gaW5pY2lvLnJlcGxhY2UoL1teQS1aXS9nLCIiKSAgICAgICAgICAgICAgICAgICAgDQogICAgDQogICAgZmluYWwxICA9IGZpbmFsMS5yZXBsYWNlKC9bXjAtOV0vZywiIikgICAgICAgICAgICAgICAgICAgIA0KICAgIGZpbmFsMiAgPSBmaW5hbDIucmVwbGFjZSgvW14wLTlBLVpdXS9nLCIiKSAgICAgICAgICAgICAgICAgICAgDQogICAgZmluYWwzICA9IGZpbmFsMy5yZXBsYWNlKC9bXjAtOV0vZywiIikgICAgICAgICAgICAgICAgICAgIA0KDQogICAgaWYgKGZpbmFsMS5sZW5ndGggPiAwKXsNCiAgICAgICAgcmV0dXJuIGluaWNpbysnLScrZmluYWwxK2ZpbmFsMitmaW5hbDM7DQogICAgfSBlbHNlIHsNCiAgICAgICAgcmV0dXJuIGluaWNpbzsNCiAgICB9DQoNCn0NCg0KLypGdW7Dp8OjbyBxdWUgcGFkcm9uaXphIENFUCovDQpmdW5jdGlvbiBDZXAodil7DQogICAgdj12LnJlcGxhY2UoL1xEL2csIiIpICAgICAgICAgICAgICAgIA0KICAgIHY9di5yZXBsYWNlKC9eKFxkezV9KShcZCkvLCIkMS0kMiIpIA0KICAgIHJldHVybiB2DQp9DQoNCi8qRnVuw6fDo28gcXVlIHBhZHJvbml6YSBDTlBKKi8NCmZ1bmN0aW9uIENucGoodil7DQogICAgdj12LnJlcGxhY2UoL1xEL2csIiIpICAgICAgICAgICAgICAgICAgIA0KICAgIHY9di5yZXBsYWNlKC9eKFxkezJ9KShcZCkvLCIkMS4kMiIpICAgICANCiAgICB2PXYucmVwbGFjZSgvXihcZHsyfSlcLihcZHszfSkoXGQpLywiJDEuJDIuJDMiKSANCiAgICB2PXYucmVwbGFjZSgvXC4oXGR7M30pKFxkKS8sIi4kMS8kMiIpICAgICAgICAgICANCiAgICB2PXYucmVwbGFjZSgvKFxkezR9KShcZCkvLCIkMS0kMiIpICAgICAgICAgICAgICANCiAgICByZXR1cm4gdg0KfQ0KDQovKkZ1bsOnw6NvIHF1ZSBwZXJtaXRlIGFwZW5hcyBudW1lcm9zIFJvbWFub3MqLw0KZnVuY3Rpb24gUm9tYW5vcyh2KXsNCiAgICB2PXYudG9VcHBlckNhc2UoKSAgICAgICAgICAgICANCiAgICB2PXYucmVwbGFjZSgvW15JVlhMQ0RNXS9nLCIiKSANCiAgICANCiAgICB3aGlsZSh2LnJlcGxhY2UoL15NezAsNH0oQ018Q0R8RD9DezAsM30pKFhDfFhMfEw/WHswLDN9KShJWHxJVnxWP0l7MCwzfSkkLywiIikhPSIiKQ0KICAgICAgICB2PXYucmVwbGFjZSgvLiQvLCIiKQ0KICAgIHJldHVybiB2DQp9DQoNCi8qRnVuw6fDo28gcXVlIHBhZHJvbml6YSBvIFNpdGUqLw0KZnVuY3Rpb24gU2l0ZSh2KXsNCiAgICB2PXYucmVwbGFjZSgvXmh0dHBzOlwvXC8/LywiIikNCiAgICBkb21pbmlvPXYNCiAgICBjYW1pbmhvPSIiDQogICAgaWYodi5pbmRleE9mKCIvIik+LTEpDQogICAgICAgIGRvbWluaW89di5zcGxpdCgiLyIpWzBdDQogICAgICAgIGNhbWluaG89di5yZXBsYWNlKC9bXlwvXSovLCIiKQ0KICAgICAgICBkb21pbmlvPWRvbWluaW8ucmVwbGFjZSgvW15cd1wuXCstOkBdL2csIiIpDQogICAgICAgIGNhbWluaG89Y2FtaW5oby5yZXBsYWNlKC9bXlx3XGRcKy1AOlw/Jj0lXChcKVwuXS9nLCIiKQ0KICAgICAgICBjYW1pbmhvPWNhbWluaG8ucmVwbGFjZSgvKFtcPyZdKT0vLCIkMSIpDQogICAgaWYoY2FtaW5obyE9IiIpZG9taW5pbz1kb21pbmlvLnJlcGxhY2UoL1wuKyQvLCIiKQ0KICAgICAgICB2PSJodHRwczovLyIrZG9taW5pbytjYW1pbmhvDQogICAgcmV0dXJuIHYNCn0NCg0KLypGdW7Dp8OjbyBxdWUgcGFkcm9uaXphIERBVEEqLw0KZnVuY3Rpb24gRGF0YSh2KXsNCiAgICB2PXYucmVwbGFjZSgvXEQvZywiIikgDQogICAgdj12LnJlcGxhY2UoLyhcZHsyfSkoXGQpLywiJDEvJDIiKSANCiAgICB2PXYucmVwbGFjZSgvKFxkezJ9KShcZCkvLCIkMS8kMiIpIA0KICAgIHJldHVybiB2DQp9DQoNCmZ1bmN0aW9uIEZvcm1hUGd0byh2KXsNCiAgICB2ID0gdi5yZXBsYWNlKC9bXjAtOVwvXS9nLCAiIik7DQogICAgdiA9IHYucmVwbGFjZSgvXC8rL2csICIvIik7DQogICAgdiA9IHYucmVwbGFjZSgvXlwvKy8sICIiKTsNCiAgICByZXR1cm4gdjsNCn0NCg0KLypGdW7Dp8OjbyBxdWUgcGFkcm9uaXphIEhPUkEqLw0KZnVuY3Rpb24gSG9yYSh2KXsNCiAgICB2PXYucmVwbGFjZSgvXEQvZywiIikgDQogICAgdj12LnJlcGxhY2UoLyhcZHsyfSkoXGQpLywiJDE6JDIiKSAgDQogICAgcmV0dXJuIHYNCn0NCg0KZnVuY3Rpb24gVmFsb3Iodil7DQogICAgdj12LnJlcGxhY2UoL1xEL2csIiIpIC8vUmVtb3ZlIHR1ZG8gbyBxdWUgbsOjbyDDqSBkw61naXRvDQogICAgdj12LnJlcGxhY2UoL14oWzAtOV17M31cLD8pezN9LVswLTldezJ9JC8sIiQxLCQyIik7DQogICAgLy92PXYucmVwbGFjZSgvKFxkezN9KShcZCkvZywiJDEsJDIiKQ0KICAgIHY9di5yZXBsYWNlKC8oXGQpKFxkezJ9KSQvLCIkMSwkMiIpIC8vQ29sb2NhIHBvbnRvIGFudGVzIGRvcyAyIMO6bHRpbW9zIGRpZ2l0b3MNCiAgICByZXR1cm4gdg0KfQ0KDQpmdW5jdGlvbiBBcmVhKHYpew0KICAgIHY9di5yZXBsYWNlKC9cRC9nLCIiKSANCiAgICB2PXYucmVwbGFjZSgvKFxkKShcZHsyfSkkLywiJDEuJDIiKSANCiAgICByZXR1cm4gdg0KICAgIA0KfQ0KDQpmdW5jdGlvbiBGb3JtYXRhUmVhaXMoZmxkLCBtaWxTZXAsIGRlY1NlcCwgZSkgew0KCXZhciBzZXAgPSAwOw0KCXZhciBrZXkgPSAnJzsNCgl2YXIgaSA9IGogPSAwOw0KCXZhciBsZW4gPSBsZW4yID0gMDsNCgl2YXIgc3RyQ2hlY2sgPSAnMDEyMzQ1Njc4OSc7DQoJdmFyIGF1eCA9IGF1eDIgPSAnJzsNCgl2YXIgd2hpY2hDb2RlID0gKHdpbmRvdy5FdmVudCkgPyBlLndoaWNoIDogZS5rZXlDb2RlOw0KCWlmICh3aGljaENvZGUgPT0gMTMpIHJldHVybiB0cnVlOw0KCWtleSA9IFN0cmluZy5mcm9tQ2hhckNvZGUod2hpY2hDb2RlKTsgIC8vIFZhbG9yIHBhcmEgbyBjw7NkaWdvIGRhIENoYXZlDQoJaWYgKHN0ckNoZWNrLmluZGV4T2Yoa2V5KSA9PSAtMSkgcmV0dXJuIGZhbHNlOyAgLy8gQ2hhdmUgaW52w6FsaWRhDQoJbGVuID0gZmxkLnZhbHVlLmxlbmd0aDsNCglmb3IoaSA9IDA7IGkgPCBsZW47IGkrKykNCg0KCWlmICgoZmxkLnZhbHVlLmNoYXJBdChpKSAhPSAnMCcpICYmIChmbGQudmFsdWUuY2hhckF0KGkpICE9IGRlY1NlcCkpIGJyZWFrOw0KCWF1eCA9ICcnOw0KCWZvcig7IGkgPCBsZW47IGkrKykNCglpZiAoc3RyQ2hlY2suaW5kZXhPZihmbGQudmFsdWUuY2hhckF0KGkpKSE9LTEpIGF1eCArPSBmbGQudmFsdWUuY2hhckF0KGkpOw0KCWF1eCArPSBrZXk7DQoJbGVuID0gYXV4Lmxlbmd0aDsNCglpZiAobGVuID09IDApIGZsZC52YWx1ZSA9ICcnOw0KCWlmIChsZW4gPT0gMSkgZmxkLnZhbHVlID0gJzAnKyBkZWNTZXAgKyAnMCcgKyBhdXg7DQoJaWYgKGxlbiA9PSAyKSBmbGQudmFsdWUgPSAnMCcrIGRlY1NlcCArIGF1eDsNCglpZiAobGVuID4gMikgew0KCQlhdXgyID0gJyc7DQoJCWZvciAoaiA9IDAsIGkgPSBsZW4gLSAzOyBpID49IDA7IGktLSkgew0KCQkJaWYgKGogPT0gMykgew0KCQkJCWF1eDIgKz0gbWlsU2VwOw0KCQkJCWogPSAwOw0KCQkJfQ0KCQkJYXV4MiArPSBhdXguY2hhckF0KGkpOw0KCQkJaisrOw0KCQl9DQoJCWZsZC52YWx1ZSA9ICdSJCc7DQoJCWxlbjIgPSBhdXgyLmxlbmd0aDsNCgkJZm9yIChpID0gbGVuMiAtIDE7IGkgPj0gMDsgaS0tKQ0KCQlmbGQudmFsdWUgKz0gYXV4Mi5jaGFyQXQoaSk7DQoJCWZsZC52YWx1ZSArPSBkZWNTZXAgKyBhdXguc3Vic3RyKGxlbiAtIDIsIGxlbik7DQoJfQ0KCXJldHVybiBmYWxzZTsNCn0NCmZ1bmN0aW9uIE1hc2NhcmFNb2VkYShvYmpUZXh0Qm94LCBTZXBhcmFkb3JNaWxlc2ltbywgU2VwYXJhZG9yRGVjaW1hbCwgZSl7DQogICAgdmFyIHNlcCA9IDA7DQogICAgdmFyIGtleSA9ICcnOw0KICAgIHZhciBpID0gaiA9IDA7DQogICAgdmFyIGxlbiA9IGxlbjIgPSAwOw0KICAgIHZhciBzdHJDaGVjayA9ICcwMTIzNDU2Nzg5JzsNCiAgICB2YXIgYXV4ID0gYXV4MiA9ICcnOw0KICAgIHZhciB3aGljaENvZGUgPSAod2luZG93LkV2ZW50KSA/IGUud2hpY2ggOiBlLmtleUNvZGU7DQogICAgaWYgKHdoaWNoQ29kZSA9PSAxMykgcmV0dXJuIHRydWU7DQogICAga2V5ID0gU3RyaW5nLmZyb21DaGFyQ29kZSh3aGljaENvZGUpOyAvLyBWYWxvciBwYXJhIG8gY8OzZGlnbyBkYSBDaGF2ZQ0KICAgIGlmIChzdHJDaGVjay5pbmRleE9mKGtleSkgPT0gLTEpIHJldHVybiBmYWxzZTsgLy8gQ2hhdmUgaW52w6FsaWRhDQogICAgbGVuID0gb2JqVGV4dEJveC52YWx1ZS5sZW5ndGg7DQogICAgZm9yKGkgPSAwOyBpIDwgbGVuOyBpKyspDQogICAgICAgIGlmICgob2JqVGV4dEJveC52YWx1ZS5jaGFyQXQoaSkgIT0gJzAnKSAmJiAob2JqVGV4dEJveC52YWx1ZS5jaGFyQXQoaSkgIT0gU2VwYXJhZG9yRGVjaW1hbCkpIGJyZWFrOw0KICAgIGF1eCA9ICcnOw0KICAgIGZvcig7IGkgPCBsZW47IGkrKykNCiAgICAgICAgaWYgKHN0ckNoZWNrLmluZGV4T2Yob2JqVGV4dEJveC52YWx1ZS5jaGFyQXQoaSkpIT0tMSkgYXV4ICs9IG9ialRleHRCb3gudmFsdWUuY2hhckF0KGkpOw0KICAgIGF1eCArPSBrZXk7DQogICAgbGVuID0gYXV4Lmxlbmd0aDsNCiAgICBpZiAobGVuID09IDApIG9ialRleHRCb3gudmFsdWUgPSAnJzsNCiAgICBpZiAobGVuID09IDEpIG9ialRleHRCb3gudmFsdWUgPSAnMCcrIFNlcGFyYWRvckRlY2ltYWwgKyAnMCcgKyBhdXg7DQogICAgaWYgKGxlbiA9PSAyKSBvYmpUZXh0Qm94LnZhbHVlID0gJzAnKyBTZXBhcmFkb3JEZWNpbWFsICsgYXV4Ow0KICAgIGlmIChsZW4gPiAyKSB7DQogICAgICAgIGF1eDIgPSAnJzsNCiAgICAgICAgZm9yIChqID0gMCwgaSA9IGxlbiAtIDM7IGkgPj0gMDsgaS0tKSB7DQogICAgICAgICAgICBpZiAoaiA9PSAzKSB7DQogICAgICAgICAgICAgICAgYXV4MiArPSBTZXBhcmFkb3JNaWxlc2ltbzsNCiAgICAgICAgICAgICAgICBqID0gMDsNCiAgICAgICAgICAgIH0NCiAgICAgICAgICAgIGF1eDIgKz0gYXV4LmNoYXJBdChpKTsNCiAgICAgICAgICAgIGorKzsNCiAgICAgICAgfQ0KICAgICAgICBvYmpUZXh0Qm94LnZhbHVlID0gJyc7DQogICAgICAgIGxlbjIgPSBhdXgyLmxlbmd0aDsNCiAgICAgICAgZm9yIChpID0gbGVuMiAtIDE7IGkgPj0gMDsgaS0tKQ0KICAgICAgICBvYmpUZXh0Qm94LnZhbHVlICs9IGF1eDIuY2hhckF0KGkpOw0KICAgICAgICBvYmpUZXh0Qm94LnZhbHVlICs9IFNlcGFyYWRvckRlY2ltYWwgKyBhdXguc3Vic3RyKGxlbiAtIDIsIGxlbik7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0=" />   

                    {pageCss && (
                        <link rel="stylesheet" href={"data:text/css;charset=utf-8;base64," + pageCss} />
                    )}

                    {pageJs && (
                        <script>  
                            {pageJs}
                        </script>
                    )}

                </Helmet>

                <div className="flex grow">

                    <Sidebar />

                    {mobileMode && <Header />}

                    <div className="flex flex-col lg:flex-row grow pt-[--tw-header-height] lg:pt-0">

                        <div className="flex flex-col grow items-stretch rounded-xl bg-[--tw-content-bg] dark:bg-[--tw-content-bg-dark] border border-gray-300 dark:border-gray-200 lg:ms-[--tw-sidebar-width] mt-0 lg:mt-[15px] m-[15px]">

                            <div className="flex flex-col grow lg:scrollable-y-auto lg:[scrollbar-width:auto] lg:light:[--tw-scrollbar-thumb-color:var(--tw-content-scrollbar-color)] pt-5">

                                <main className="grow">

                                    <Toolbar>

                                        {title && <ToolbarHeading title={title} />}

                                        {breadcrumbs && (
                                            //HOVER SÓ NOS ITENS NAVEGÁVEIS — O ÚLTIMO (PÁGINA ATUAL) VEM COM href="javascript:void(0);"
                                            <div
                                                className="breadcrumbs mt-0.5 [&_a]:transition-colors [&_a:not([href^='javascript']):hover]:text-primary [&_a:not([href^='javascript']):hover]:underline [&_a:not([href^='javascript']):hover]:underline-offset-2 [&_a[href^='javascript']]:cursor-default"
                                                dangerouslySetInnerHTML={{ __html: breadcrumbs }}
                                            />
                                        )}

                                        {pageMessage && (
                                            <Alert variant="warning" className="mt-4 w-full">
                                                {pageMessage}
                                            </Alert>
                                        )}

                                        {mensagens.map((mensagem, i) => (
                                            <Alert key={`mensagem-${i}`} variant={mensagem.variant} className="mt-4 w-full">
                                                <span dangerouslySetInnerHTML={{ __html: mensagem.html }} />
                                            </Alert>
                                        ))}

                                        {headerContent && (
                                            <LegacyHtml html={headerContent} className="w-full" />
                                        )}

                                    </Toolbar>

                                    {/* px-5 = MESMO RECUO DO .container-fluid (TOOLBAR E CONTEÚDO). mb-5: A LISTAGEM (ABAS) COMEÇA
                                        SEM ESPAÇO NO TOPO E O CABEÇALHO FICAVA GRUDADO NELA. SÓ RENDERIZA COM CONTEÚDO */}
                                    {String(headerAfterContent).trim() && (
                                        <LegacyHtml html={headerAfterContent} className="w-full px-5 mb-5" />
                                    )}

                                    <Outlet />

                                    {footerContent && (
                                        <LegacyHtml html={footerContent} className="w-full" style={{padding: '10px 30px'}} />
                                    )}

                                </main>

                                <Footer />

                            </div>

                        </div>

                    </div>

                </div>

            </Fragment>
        )
    }

    export { Main }
