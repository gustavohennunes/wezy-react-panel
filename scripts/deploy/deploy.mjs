// yarn deploy — BUILD DE PRODUÇÃO E ENVIO POR FTP PARA O app.wezy.com.br
//
// - O BUILD VAI PARA UMA PASTA TEMPORÁRIA, NÃO PARA O dist/: O dist É DO yarn build:watch (SEM MINIFICAR E COM OS
//   ARQUIVOS ANTIGOS ACUMULADOS) E UM BUILD NELE CONCORRERIA COM O WATCHER
// - CREDENCIAIS DO .vscode/sftp.json (NO .gitignore — A SENHA NÃO VAI PARA O GIT NEM PARA O BUNDLE)
// - ORDEM DO ENVIO: assets/ E media/ PRIMEIRO, index.html E .htaccess POR ÚLTIMO — QUEM ABRIR O SITE NO MEIO DO
//   DEPLOY CONTINUA NO index.html ANTERIOR, QUE APONTA PARA ASSETS QUE AINDA EXISTEM
// - NO FIM, APAGA DO SERVIDOR OS assets/ QUE NÃO SÃO DESTE BUILD (HASH ANTIGO)
//
// --sem-build: SÓ ENVIA O ÚLTIMO BUILD DA PASTA TEMPORÁRIA

import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'basic-ftp'

const raiz   = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const saida  = join(tmpdir(), 'wezy-react-panel-deploy')
const config = join(raiz, '.vscode', 'sftp.json')

const semBuild = process.argv.includes('--sem-build')

if (!existsSync(config)) {
    console.error('Faltou o .vscode/sftp.json com host, username, password e remotePath do FTP.')
    process.exit(1)
}

const ftpConfig = JSON.parse(readFileSync(config, 'utf-8'))
const remoto    = (ftpConfig.remotePath || '/').replace(/\/+$/, '') || ''

// ----- BUILD -----

if (!semBuild) {

    rmSync(saida, { recursive: true, force: true })

    console.log('Build de produção em', saida)

    //vite PELO PRÓPRIO node (SEM shell: O npx NO WINDOWS PRECISARIA DE shell, QUE NÃO ESCAPA OS ARGUMENTOS)
    const build = spawnSync(process.execPath, [join(raiz, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--outDir', saida, '--emptyOutDir', '--logLevel', 'warn'], {
        cwd: raiz,
        stdio: 'inherit',
    })

    if (build.status !== 0) {
        console.error('Build falhou, nada foi enviado.')
        process.exit(build.status || 1)
    }

}

if (!existsSync(join(saida, 'index.html'))) {
    console.error('Não há build em', saida, '— rode sem --sem-build.')
    process.exit(1)
}

copyFileSync(join(raiz, 'scripts', 'deploy', '.htaccess'), join(saida, '.htaccess'))

// ----- ENVIO -----

const cliente = new Client(60000)

try {

    await cliente.access({
        host: ftpConfig.host,
        port: ftpConfig.port || 21,
        user: ftpConfig.username,
        password: ftpConfig.password,
        secure: ftpConfig.protocol === 'ftps',
    })

    let enviados = 0

    //PASTAS PRIMEIRO
    for (const item of readdirSync(saida, { withFileTypes: true })) {
        if (!item.isDirectory()) continue
        console.log(`Enviando ${item.name}/`)
        await cliente.ensureDir(`${remoto}/${item.name}`)
        await cliente.uploadFromDir(join(saida, item.name))
        await cliente.cd('/')
    }

    //ARQUIVOS SOLTOS (vite.svg...) E POR ÚLTIMO .htaccess E index.html
    const soltos = readdirSync(saida, { withFileTypes: true })
        .filter((item) => item.isFile())
        .map((item) => item.name)
        .sort((a, b) => (a === 'index.html') - (b === 'index.html') || (a === '.htaccess') - (b === '.htaccess'))

    for (const nome of soltos) {
        await cliente.uploadFrom(join(saida, nome), `${remoto}/${nome}`)
        enviados++
    }

    //LIMPA OS assets/ DE BUILDS ANTERIORES
    const atuais  = new Set(readdirSync(join(saida, 'assets')))
    const antigos = (await cliente.list(`${remoto}/assets`)).filter((item) => item.isFile && !atuais.has(item.name))

    for (const item of antigos) {
        await cliente.remove(`${remoto}/assets/${item.name}`)
    }

    console.log(`Deploy concluído: ${enviados} arquivos na raiz, assets/ e media/ enviados, ${antigos.length} assets antigos removidos.`)

} catch (erro) {

    console.error('Falha no deploy:', erro.message)
    process.exitCode = 1

} finally {

    cliente.close()

}
