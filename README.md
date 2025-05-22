# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ba24e32c-3f89-4f07-b69e-47bbf3985558

## Problema de Execução de Scripts no PowerShell

Se você está enfrentando o erro:

```
O arquivo C:\Program Files\nodejs\npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada neste sistema.
```

Este erro ocorre porque a política de execução do PowerShell está configurada para não permitir a execução de scripts. Para resolver este problema, foram criados arquivos batch que contornam esta restrição.

### Arquivos de Solução

Foram criados dois arquivos batch para ajudar a executar os comandos npm sem problemas:

#### 1. start.bat

Um arquivo simples que inicia o servidor de desenvolvimento Vite.

- Para usar: Dê um duplo clique no arquivo `start.bat`

#### 2. npm-comandos.bat

Um menu interativo que oferece várias opções:

- **Iniciar servidor de desenvolvimento**: Equivalente ao comando `npm start`
- **Construir projeto (build)**: Equivalente ao comando `npm run build`
- **Visualizar versão de produção**: Equivalente ao comando `npm run preview`

- Para usar: Dê um duplo clique no arquivo `npm-comandos.bat` e escolha a opção desejada

### Solução Alternativa (Permanente)

Se você preferir resolver o problema de forma permanente, pode alterar a política de execução do PowerShell. Para isso:

1. Abra o PowerShell como administrador
2. Execute o comando: `Set-ExecutionPolicy RemoteSigned`
3. Confirme a alteração digitando "S" ou "Y"

Após isso, você poderá executar os comandos npm normalmente no PowerShell.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ba24e32c-3f89-4f07-b69e-47bbf3985558) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ba24e32c-3f89-4f07-b69e-47bbf3985558) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
