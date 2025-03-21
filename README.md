# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Observações

src\components\keenicons\assets - tem um demo.html para ver os icones disponiveis no projeto

AuthPage - tem AuthLayout que tem a versão branded e padrão, possivelmente local de limpeza para retirar o branded se não for usar

<React.StrictMode> no arquivo main.jsx faz com que no modo de desenvolvimento local ele renderize os componentes duas vezes

# TODO

    Preciso saber como vem esses itens atualmente,
    exemplos de modulos ou formularios que foram montados e os retornos deles
    Listagem
        componentes de listagem

    formularios
        componentes de formularios

    Componentes HTML
        nos dois casos quando forem itens personalizados que requerem ser passados por HTML

    Models.jsx
        Fazer requisição para configurar a listagem que ira ser montada
            Configurar as colunas da tabela

    Estrutura de exemplo:
        (não é necessariamente a URL)
        Pag/listagem/produto
        Pag/Formulario/produto
        Pag/Formulario/produto/Alterar/{id}

        Onde
            Pag é o layout geral, nele vai ter o tipo que então é onde vai ler se sera uma listagem ou formulario
                listagem nessa parte ele vai controlar onde traz os dados dependendo da pagina que vai ser, exemplo produto
                    com base na requisição da listagem que vai precisar ser montada ele configura e monta os dados na tabela

                forumlario a principio mesmo conceito inicial da listagem, vai fazer a requisição para configurar e montar o formulario dependendo do que for, exemplo produto
                    caso ele seja de inserir, vai somente montar a estrutura do formulario sem precisar preencher os dados
                    caso ele for se alteração, tras os dados para preencher no formulario conforme o id passado

        configurações de URL, passar com query params

    Conferir
    https://github.com/awssat/tailwindo
    Ferramenta para converter bootstrap para tailwind, talvez seja util no novo painel já que o modelo antigo utilizava se de bootstrap

    ponto de observação conferir os valors que vem do painel atualmente e sua conversão atual, alguns valores provavelmente não irão vir definidos e podem não apresentar css do tailwind corretamente, caso ocorra isso tem que incluir na safelist no tailind.config.js ou varificar outro modo e incluir como style diretamente.

## Plugins de terceiros ou complementares ao Metronic

    https://keenthemes.com/metronic/tailwind/docs/plugins/apexcharts
    https://lucide.dev/guide/packages/lucide-react
    https://www.radix-ui.com/
    https://mui.com/
    https://daypicker.dev
    https://omgovich.github.io/react-colorful/ (Adicionado)
