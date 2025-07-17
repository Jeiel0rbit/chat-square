// server.ts
// Versão final com lista de usuários online.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";

const MESSAGE_COOLDOWN_MS = 1500;
const MAX_MESSAGE_LENGTH = 500;

const ADJETIVOS = ["Rápido", "Curioso", "Feliz", "Esperto", "Sábio", "Valente", "Astuto", "Amigo"];
const ANIMAIS = ["Lobo", "Gato", "Leão", "Tigre", "Coruja", "Águia", "Raposa", "Urso"];

function gerarApelidoAleatorio(): string {
    const adjetivo = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)];
    const animal = ANIMAIS[Math.floor(Math.random() * ANIMAIS.length)];
    const numero = Math.floor(Math.random() * 900) + 100;
    return `${animal}${adjetivo}${numero}`;
}

const io = new Server({
  cors: {
    origin: "*",
  },
});

const users = new Map<string, { nickname: string; lastMessageTime: number }>();

// Função para obter e transmitir a lista de usuários atualizada
function updateAndBroadcastUserList() {
    const userList = Array.from(users.values()).map(u => u.nickname);
    io.emit("update-user-list", userList);
}

io.on("connection", (socket) => {
  const nickname = gerarApelidoAleatorio();
  users.set(socket.id, { nickname, lastMessageTime: 0 });
  
  console.log(`[CONECTADO] ${nickname} (${socket.id})`);

  socket.emit("nickname-assigned", nickname);
  socket.broadcast.emit("user-connected", `👋 ${nickname} entrou no chat.`);
  
  // Envia a lista de usuários atualizada para todos
  updateAndBroadcastUserList();

  socket.on("chat-message", (message: string) => {
    const userData = users.get(socket.id);
    if (!userData) return;

    const now = Date.now();
    const trimmedMessage = message.trim();

    if (now - userData.lastMessageTime < MESSAGE_COOLDOWN_MS) {
      socket.emit("rate-limit-error", "Você está enviando mensagens muito rápido.");
      return;
    }

    if (trimmedMessage.length === 0 || trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    userData.lastMessageTime = now;
    
    io.emit("chat-message", {
      nickname: userData.nickname,
      message: trimmedMessage,
    });
  });

  socket.on("disconnect", () => {
    const userData = users.get(socket.id);
    if (userData) {
      console.log(`[DESCONECTADO] ${userData.nickname}`);
      users.delete(socket.id); // Remove o usuário da lista
      io.emit("user-disconnected", `🏃 ${userData.nickname} saiu do chat.`);
      // Envia a lista de usuários atualizada para todos
      updateAndBroadcastUserList();
    }
  });
});

const staticFileHandler = (req: Request) => {
  return serveDir(req, { fsRoot: "public", urlRoot: "", quiet: true });
};

const handler = io.handler(staticFileHandler);

console.log("🚀 Servidor de Chat com Lista de Usuários rodando em http://localhost:8000");
await serve(handler, { port: 8000 });
