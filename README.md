# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# Observações

src\components\keenicons\assets - tem um demo.html para ver os icones disponiveis no projeto

AuthPage - tem AuthLayout que tem a versão branded e padrão, possivelmente local de limpeza para retirar o branded se não for usar

<React.StrictMode> no arquivo main.jsx faz com que no modo de desenvolvimento local ele renderize os componentes duas vezes
