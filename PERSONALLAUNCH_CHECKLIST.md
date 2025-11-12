# 🧰 Script Pessoal – Início de Projeto sem Clonar Repo

> Objetivo: iniciar um projeto limpo (ex: Next.js/React) e evitar perder versões e staged changes.

---

## 1. Criar pasta do projeto

`ash
mkdir meu-projeto && cd meu-projeto
`

## 2. Inicializar versionamento imediatamente

`ash
git init
`

> Nunca espere para rodar git init. Isso mantém snapshot do estado inicial.

## 3. Criar projeto

Exemplo Next.js com TypeScript:

`ash
npx create-next-app@latest . --typescript --use-npm
`

## 4. Travar versões críticas (remover ^ e ~)

Edite package.json e ajuste dependências sensíveis:

`
"next": "14.0.4",
"react": "18.2.0",
"react-dom": "18.2.0",
"tailwindcss": "3.4.1",
"postcss": "8.4.31",
"autoprefixer": "10.4.14",
"typescript": "5.2.2"
`

> Sempre salve com versões exatas. Não use caret para libs core.

## 5. Limpar instalações prévias

`ash
rm -rf node_modules package-lock.json
`

## 6. Instalar dependências com versões fixas

`ash
npm install --save-exact
`

> Garante que o lock file reflita as versões que você travou.

## 7. Configurar Tailwind

`ash
npx tailwindcss init -p
`

Verifique postcss.config.js:

`js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`

## 8. Criar commit base

`ash
git add .
git commit -m "chore: base project"
`

> Agora há um checkpoint seguro. Se algo quebrar, git reset --hard HEAD recupera o estado.

## 9. Regras para não perder staged changes

- **Sempre** cheque git status antes de rodar scripts npm.
- Evite 
pm install sem necessidade; use 
pm ci quando for apenas instalar.
- Antes de testar bibliotecas novas:
  `ash
  git checkout -b feat/test-lib
  `
- Use git stash para guardar alterações temporárias:
  `ash
  git stash push -m "WIP"
  git stash pop
  `
- Configure core.autocrlf e core.safecrlf se estiver no Windows:
  `ash
  git config core.autocrlf true
  git config core.safecrlf warn
  `

## 10. Sequência padrão quando algo quebrar

1. git status
2. Se estiver tudo limpo, git reset --hard HEAD
3. m -rf node_modules package-lock.json
4. 
pm install --save-exact

## 11. Boas práticas extras

- Documente dependências “sensíveis” no README.
- Mantenha .env.example atualizado.
- Crie um docs/ com tudo que descobrir (erros, workarounds).
- Antes de sair do dia: git status deve estar limpo ou com commit/stash.

---

> Atualize este script sempre que aprender algo novo. Ele é sua checklist pessoal para não repetir dores antigas.
