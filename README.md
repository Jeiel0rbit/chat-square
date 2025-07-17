# Chat-Square

Um projeto de chat em tempo real simples e moderno construído com Deno, TypeScript e WebSockets (Socket.IO). Demonstra a criação de uma aplicação web interativa com um backend em Deno, sem a necessidade de `node_modules` ou `package.json`.



## ✨ Características

*   **Chat em Tempo Real**: Mensagens enviadas e recebidas instantaneamente usando WebSockets.
*   **Apelidos Aleatórios**: Cada usuário recebe um apelido anônimo e divertido ao se conectar (ex: `LoboRápido451`).
*   **Lista de Usuários Online**: Uma barra lateral exibe todos os usuários conectados no momento, com atualização em tempo real.
*   **Design Responsivo**: A interface se adapta a telas de desktop e mobile, com uma lista de usuários otimizada para cada visualização.
*   **Notificações do Sistema**: Mensagens automáticas informam quando um usuário entra ou sai do chat.
*   **Prevenção de Spam (Rate Limiting)**: Limita a frequência com que os usuários podem enviar mensagens para evitar flood.
*   **Validação de Mensagens**: Mensagens vazias ou excessivamente longas são ignoradas pelo servidor.
*   **Segurança Básica**: As mensagens são sanitizadas no frontend para prevenir ataques de Cross-Site Scripting (XSS) simples.

## ⚙️ Tecnologias Utilizadas

*   **Backend**:
    *   Deno como runtime de JavaScript/TypeScript.
    *   Socket.IO para comunicação via WebSocket.
    *   Servidor de arquivos nativo do Deno (`serveDir`).
*   **Frontend**:
    *   HTML5.
    *   Tailwind CSS para estilização (via CDN).
    *   Font Awesome para ícones (via CDN).
    *   Socket.IO Client.

## 🚀 Como Executar o Projeto

Siga os passos abaixo para executar o chat na sua máquina local.

### 1. Pré-requisitos

Você precisa ter o Deno instalado. Se ainda não o tiver, você pode instalá-lo com um dos seguintes comandos:

**Shell (Mac, Linux):**
```sh
curl -fsSL https://deno.land/x/install/install.sh | sh
```

**PowerShell (Windows):**
```powershell
irm https://deno.land/x/install/install.ps1 | iex
```

### 2. Executar o Servidor

Navegue até o diretório raiz do projeto e execute o seguinte comando no seu terminal:

```sh
deno run --allow-net --allow-read server.ts
```

**Explicação das flags:**
*   `--allow-net`: Permite que o código acesse a rede. Necessário para criar o servidor web, fazer requisições e para o funcionamento do WebSocket.
*   `--allow-read`: Permite que o código leia arquivos do sistema. Necessário para que o servidor sirva os arquivos estáticos da pasta `public`.

O terminal deverá exibir a seguinte mensagem:
```
🚀 Servidor de Chat com Lista de Usuários rodando em http://localhost:8000
```

### 3. Acessar o Chat

Abra seu navegador e acesse http://localhost:8000. Abra em várias abas ou navegadores para simular múltiplos usuários.

## 🔧 Como Funciona

A aplicação é dividida em duas partes principais: o backend (servidor) e o frontend (cliente).

### Backend (`server.ts`)

O servidor, escrito em TypeScript e executado pelo Deno, é o cérebro da aplicação.
*   **Servidor HTTP e de Arquivos**: Utiliza a função `serve` do Deno para criar um servidor HTTP. A função `serveDir` é usada para servir os arquivos estáticos (HTML, CSS, imagens) que estão na pasta `public`.
*   **Servidor WebSocket (Socket.IO)**: Integrado ao servidor HTTP, o `Socket.IO` gerencia as conexões WebSocket. Ele é responsável por receber e transmitir eventos em tempo real.
*   **Gerenciamento de Usuários**: Quando um novo cliente se conecta, o servidor:
    1.  Gera um apelido aleatório.
    2.  Armazena o apelido e o ID do socket em um `Map` na memória.
    3.  Emite um evento `nickname-assigned` para o novo cliente.
    4.  Transmite (broadcast) um evento `update-user-list` para todos os clientes com a lista atualizada de usuários.
*   **Gerenciamento de Mensagens**: Quando recebe uma mensagem (`chat-message`), o servidor a retransmite para **todos** os clientes conectados, incluindo o remetente. Ele também aplica as regras de *rate limiting*.
*   **Gerenciamento de Desconexão**: Quando um cliente se desconecta, o servidor o remove do `Map` de usuários e notifica todos os outros clientes para que a lista de online seja atualizada.

### Frontend (`public/index.html`)

O frontend é uma página HTML única que se comunica com o servidor.
*   **Conexão com o Servidor**: Utiliza a biblioteca cliente do Socket.IO (importada via CDN) para estabelecer uma conexão WebSocket com o servidor em `http://localhost:8000`.
*   **Interface Dinâmica**: O JavaScript no arquivo `index.html` manipula o DOM para exibir mensagens e atualizar a lista de usuários.
*   **Escuta de Eventos**: O cliente fica "ouvindo" eventos vindos do servidor:
    *   `nickname-assigned`: Exibe o apelido recebido no cabeçalho.
    *   `update-user-list`: Renderiza a lista de usuários online na barra lateral.
    *   `chat-message`: Cria um novo elemento na lista de mensagens.
    *   `user-connected` / `user-disconnected`: Exibe as notificações do sistema.
*   **Emissão de Eventos**: Quando o usuário digita uma mensagem e clica em "Enviar", o cliente emite um evento `chat-message` para o servidor, enviando o conteúdo da mensagem.

> [!warning]
> Integração que se pode ser feita em sua página, então esteja ciente que todos terão acesso ao mesmo chat não sabendo de qual origem estão se comunicando. Exemplo: SiteX com SiteY.

```
<!-- Exemplo de como integrar o chat em outra página -->
<h3>Nosso Chat ao Vivo</h3>
<p>Converse com outros visitantes do site (ou outros)!</p>

<iframe 
    src="http://localhost:8000" 
    style="width: 100%; max-width: 450px; height: 600px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
</iframe>
```