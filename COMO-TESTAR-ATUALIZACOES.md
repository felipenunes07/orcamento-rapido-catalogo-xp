# 🧪 Como Testar o Sistema de Atualizações

## 📋 O Que Foi Corrigido

### ❌ Problema Anterior

- Service Worker chamava `skipWaiting()` automaticamente
- Página recarregava SEM mostrar notificação ao usuário
- Usuário não tinha controle sobre quando atualizar
- Cache era limpo sem aviso prévio

### ✅ Solução Implementada

- Service Worker aguarda comando do usuário
- Toast de notificação aparece com nova versão
- Usuário escolhe quando atualizar
- Cache só é limpo após confirmação do usuário
- Feedback visual durante todo o processo

---

## 🎯 Fluxo Correto de Atualização

```
1. Deploy Nova Versão (v4)
   └─> Service Worker v4 disponível no servidor

2. Usuário Acessa Site (ainda com v3)
   └─> SW detecta nova versão
   └─> Baixa e instala v4 em background
   └─> v4 fica AGUARDANDO (não ativa automaticamente)

3. Toast Aparece 🎉
   ┌────────────────────────────────────┐
   │ 🎉 Nova versão disponível!         │
   │ Há uma atualização com novas       │
   │ funcionalidades.                   │
   │                                    │
   │              [Atualizar Agora] [X] │
   └────────────────────────────────────┘

4. Usuário Clica em "Atualizar Agora"
   └─> Mensagem SKIP_WAITING enviada ao SW
   └─> SW v4 recebe comando
   └─> SW v4 ativa imediatamente

5. Evento 'activate' Dispara
   └─> Cache v3 é deletado
   └─> Cache v4 é mantido
   └─> Logs mostram limpeza

6. Evento 'controllerchange' Dispara
   └─> Página recarrega automaticamente
   └─> Nova versão (v4) está ativa
   └─> Novas funcionalidades disponíveis
```

---

## 🧪 Como Testar Localmente

### Passo 1: Preparação

```bash
# 1. Certifique-se de estar na branch com as correções
git status

# 2. Inicie o servidor de desenvolvimento
npm run dev
# ou
npm start
```

### Passo 2: Primeiro Acesso

1. Abra o navegador em modo normal
2. Acesse `http://localhost:5173` (ou sua porta)
3. Abra DevTools (F12) > Console
4. Procure pelos logs:
   ```
   [SW] Página carregada, iniciando registro do SW...
   [SW] Registrado com sucesso: /
   [SW] Cache aberto: orcamento-facil-xp-v4
   ```
5. Verifique que o app funciona normalmente

### Passo 3: Simular Nova Versão

**Opção A: Mudar versão do cache manualmente**

1. Abra `public/sw.js`
2. Mude a versão:
   ```javascript
   const CACHE_VERSION = 'v5' // era v4
   ```
3. Salve o arquivo (Vite recarrega automaticamente)

**Opção B: Fazer uma mudança no SW**

1. Abra `public/sw.js`
2. Adicione um comentário ou log diferente
3. Salve o arquivo

### Passo 4: Verificar Detecção de Atualização

**IMPORTANTE:** Não recarregue a página! Aguarde 60 segundos.

1. No Console, aguarde até ver:

   ```
   [SW] Verificando atualizações...
   [SW] Nova versão encontrada!
   [SW] Estado alterado: installing
   [SW] Estado alterado: installed
   [SW] Nova versão instalada e aguardando ativação
   [SW] Mostrando notificação de atualização ao usuário
   ```

2. **Verifique o Toast** aparecer na tela:

   ```
   🎉 Nova versão disponível!
   Há uma atualização com novas funcionalidades.
   Clique para atualizar agora.

   [Atualizar Agora] [X]
   ```

### Passo 5: Testar Atualização Manual

1. **NÃO CLIQUE** ainda no botão "Atualizar Agora"
2. Abra DevTools > Application > Service Workers
3. Você deve ver:

   - **Ativo:** `/sw.js` (versão antiga v4)
   - **Aguardando:** `/sw.js` (nova versão v5)

4. **Agora clique** em "Atualizar Agora" no toast
5. Observe os logs:

   ```
   [SW] Usuário clicou em atualizar
   [SW] Enviando mensagem SKIP_WAITING para o SW
   [SW] Mensagem recebida: {type: 'SKIP_WAITING'}
   [SW] Comando SKIP_WAITING recebido, ativando nova versão...
   [SW] Ativando nova versão...
   [SW] Caches encontrados: ['orcamento-facil-xp-v4', 'orcamento-facil-xp-v5']
   [SW] Deletando cache antigo: orcamento-facil-xp-v4
   [SW] Nova versão ativada, assumindo controle...
   [SW] Novo SW assumiu controle, recarregando página...
   ```

6. **Página recarrega automaticamente**

7. Após recarregar, verifique:
   ```
   [App] Iniciando renderização do React...
   [App] React renderizado com sucesso
   [SW] Cache aberto: orcamento-facil-xp-v5
   ```

### Passo 6: Verificar Limpeza de Cache

1. Abra DevTools > Application > Cache Storage
2. Você deve ver APENAS:
   - `orcamento-facil-xp-v5` ✅
3. O cache `v4` foi deletado ✅

---

## 🔧 Testes Avançados

### Teste 1: Múltiplas Abas Abertas

1. Abra a aplicação em 2 abas
2. Faça uma mudança no SW
3. Aguarde 60s
4. **Ambas as abas** devem mostrar o toast
5. Clique em "Atualizar" em UMA aba
6. **Ambas as abas** devem recarregar

### Teste 2: Usuário Ignora Atualização

1. Aguarde o toast aparecer
2. Clique no [X] para fechar
3. Continue usando a aplicação
4. A aplicação continua funcionando com versão antiga
5. Recarregue manualmente (F5)
6. Nova versão ainda está aguardando
7. Toast aparece novamente

### Teste 3: Atualização em Background

1. Deixe a aplicação aberta
2. Faça deploy de nova versão
3. Aguarde até 60 segundos
4. Toast deve aparecer automaticamente
5. Não precisa recarregar manualmente

### Teste 4: Sem Conexão

1. Abra a aplicação
2. Ative modo offline (DevTools > Network > Offline)
3. Faça mudança no SW
4. Aguarde 60s
5. Logs mostram:
   ```
   [SW] Erro ao verificar atualização: Failed to fetch
   ```
6. Aplicação continua funcionando offline
7. Reative conexão
8. Toast aparece no próximo check (60s)

---

## 📊 Checklist de Verificação

Após cada deploy, verifique:

- [ ] **Toast aparece** quando há nova versão
- [ ] **Texto do toast** está claro e informativo
- [ ] **Botão "Atualizar Agora"** está visível
- [ ] **Clicar no botão** ativa a atualização
- [ ] **Feedback "Atualizando..."** aparece
- [ ] **Página recarrega** automaticamente
- [ ] **Cache antigo** é deletado
- [ ] **Cache novo** está ativo
- [ ] **Logs no console** são informativos
- [ ] **Múltiplas abas** são sincronizadas

---

## 🐛 Solução de Problemas

### Toast não aparece

**Causa:** SW não detectou mudança

**Solução:**

1. Verifique se mudou a versão do cache
2. Aguarde pelo menos 60 segundos
3. Recarregue manualmente e aguarde novamente
4. Verifique logs de erro no console

### Página não recarrega após clicar

**Causa:** Listener de `controllerchange` não disparou

**Solução:**

1. Verifique console para erros
2. Recarregue manualmente (F5)
3. Verifique se está em localhost (pode ter comportamento diferente)

### Cache antigo não é deletado

**Causa:** Evento `activate` falhou

**Solução:**

1. DevTools > Application > Service Workers
2. Clique em "Unregister" em todos os SWs
3. DevTools > Application > Cache Storage
4. Delete todos os caches manualmente
5. Recarregue a página (Ctrl+Shift+R)

### "Nenhum SW em espera encontrado"

**Causa:** SW ativou antes de detectar

**Solução:**

1. Aguarde 60 segundos
2. Toast deve aparecer novamente
3. Se não aparecer, recarregue manualmente

---

## 📝 Logs Importantes

### Logs Esperados (Sucesso)

```
[SW] Página carregada, iniciando registro do SW...
[SW] Registrado com sucesso: /
[SW] Cache aberto: orcamento-facil-xp-v4
[SW] Verificando atualizações...
[SW] Nova versão encontrada!
[SW] Estado alterado: installing
[SW] Estado alterado: installed
[SW] Nova versão instalada e aguardando ativação
[SW] Mostrando notificação de atualização ao usuário
[SW] Usuário clicou em atualizar
[SW] Enviando mensagem SKIP_WAITING para o SW
[SW] Mensagem recebida: {type: 'SKIP_WAITING'}
[SW] Comando SKIP_WAITING recebido, ativando nova versão...
[SW] Ativando nova versão...
[SW] Deletando cache antigo: orcamento-facil-xp-v4
[SW] Nova versão ativada, assumindo controle...
[SW] Novo SW assumiu controle, recarregando página...
```

### Logs de Erro (Investigar)

```
❌ [SW] Falha ao registrar SW
❌ [SW] Erro ao verificar atualização
❌ [SW] Nenhum SW em espera encontrado
❌ [SW] Falha ao cachear: <arquivo>
❌ Erro capturado pelo Error Boundary
```

---

## 🚀 Deploy em Produção

### Antes de Fazer Deploy

1. Teste localmente seguindo este guia
2. Incremente a versão do cache:
   ```javascript
   const CACHE_VERSION = 'v5' // ou próxima versão
   ```
3. Commit e push
4. Aguarde deploy completar

### Após Deploy

1. Abra o site em janela anônima (teste novo usuário)
2. Abra o site em janela normal (teste usuário existente)
3. Aguarde 60 segundos
4. Verifique se toast aparece
5. Clique em "Atualizar Agora"
6. Confirme que página recarrega e nova versão está ativa

### Monitoramento

Monitore por 24-48h:

- Taxa de usuários que atualizaram
- Relatos de problemas
- Erros no console (use ferramentas como Sentry)
- Feedback dos usuários

---

## 💡 Dicas

1. **Sempre incremente a versão do cache** a cada deploy
2. **Teste em modo anônimo** para simular novo usuário
3. **Use `console.log`** liberalmente para debug
4. **Aguarde 60 segundos** para o SW verificar atualizações
5. **Não force skipWaiting()** automaticamente
6. **Deixe o usuário escolher** quando atualizar
7. **Dê feedback visual** durante todo o processo

---

## 📚 Referências

- [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
- [Handling Service Worker Updates](https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68)
- [skipWaiting Best Practices](https://web.dev/service-worker-lifecycle/#skip-the-waiting-phase)

---

**Versão:** 1.0  
**Data:** Outubro 2025  
**Status:** ✅ Sistema de atualização corrigido e testado
