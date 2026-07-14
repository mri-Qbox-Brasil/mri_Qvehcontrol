# mri_Qvehcontrol — Manual

Painel NUI e comandos de chat para controlar portas, vidros, bancos, motor e luz interna do veículo em que o jogador está.

---

## Sumário

1. [Dependências](#dependências)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Comandos](#comandos)
5. [Índices de portas, vidros e bancos](#índices-de-portas-vidros-e-bancos)
6. [Comportamentos automáticos](#comportamentos-automáticos)
7. [Entrypoints para outros recursos](#entrypoints-para-outros-recursos)
8. [Estrutura de arquivos](#estrutura-de-arquivos)

---

## Dependências

| Recurso | Obrigatório | Observação |
|---|---|---|
| `qb-core` | Sim | `QBCore.Functions.Progressbar` no ligar/desligar motor e na troca de banco |

O recurso é apenas client-side (`client_script` no manifest); não há server script.

---

## Instalação

1. Copie a pasta `mri_Qvehcontrol` para `resources/`.
2. Adicione ao `server.cfg`, depois do `qb-core`:
   ```
   ensure mri_Qvehcontrol
   ```
3. Opcional — registre um atalho para abrir o painel. O recurso **não** registra `RegisterKeyMapping`; se quiser uma tecla, mapeie o comando `vehcontrol` pelas configurações de teclado do FiveM ou por outro recurso.

Não há SQL nem itens de inventário.

---

## Configuração

Arquivo: `config.lua` (variáveis globais, sem tabela `Config`)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `UseCommands` | bool | Sim | Quando `true`, registra os comandos de chat de porta, banco, vidro, capô e porta-malas. Quando `false`, só restam `/vehcontrol` e `/vehcontrolclose` |
| `DisableSeatShuffle` | bool | Sim | Impede que o ped deslize do banco do passageiro para o do motorista automaticamente |
| `LeaveRunning` | bool | Sim | Mantém o motor ligado ao sair do veículo segurando a tecla de sair (F) |

---

## Comandos

| Comando | Permissão | Descrição |
|---|---|---|
| `/vehcontrol` | Todos | Abre o painel NUI (só funciona dentro de um veículo e fora do menu de pausa) |
| `/vehcontrolclose` | Todos | Fecha o painel à força |
| `/door [1-4]` | Todos | Abre/fecha a porta indicada |
| `/seat [1-4]` | Todos | Troca para o banco indicado (com barra de progresso de 3s) |
| `/window [1-4]` | Todos | Sobe/desce o vidro indicado |
| `/windowfront` | Todos | Sobe/desce os dois vidros dianteiros |
| `/windowback` | Todos | Sobe/desce os dois vidros traseiros |
| `/windowall` | Todos | Sobe/desce todos os vidros |
| `/hood` | Todos | Abre/fecha o capô |
| `/trunk` | Todos | Abre/fecha o porta-malas |

Todos os comandos acima (exceto `/vehcontrol` e `/vehcontrolclose`) só existem se `UseCommands = true`.

> O recurso registra a sugestão de chat `/engine`, mas **o comando em si está comentado no código** — ligar/desligar o motor só funciona pelo botão de ignição do painel NUI.

Argumento inválido em `/door`, `/seat` ou `/window` faz o script imprimir a mensagem de uso no chat.

---

## Índices de portas, vidros e bancos

O argumento `1-4` dos comandos é traduzido para os índices nativos do GTA:

| Argumento | Porta / Vidro | Banco |
|---|---|---|
| `1` | Motorista (índice 0) | Motorista (índice -1) |
| `2` | Passageiro (índice 1) | Passageiro (índice 0) |
| `3` | Traseiro esquerdo (índice 2) | Traseiro esquerdo (índice 1) |
| `4` | Traseiro direito (índice 3) | Traseiro direito (índice 2) |

O capô usa o índice de porta `4` e o porta-malas o `5` — por isso têm comandos próprios (`/hood` e `/trunk`) em vez de entrar na numeração acima.

A troca de banco só ocorre se o assento de destino estiver livre (`IsVehicleSeatFree`).

---

## Comportamentos automáticos

Uma thread client roda continuamente enquanto o recurso está ativo:

- **`LeaveRunning`** — ao segurar a tecla de sair do veículo (control 75) por ~150 ms, o motor é forçado a ficar ligado antes do ped sair.
- **`DisableSeatShuffle`** — se o jogador está no banco do motorista e a task de shuffle (165) fica ativa, o ped é reposicionado no assento 0, cancelando o deslize.

O motor, quando alternado pelo painel, passa por uma barra de progresso do QBCore de 1500 ms com a label "Ligando Motor" / "Desligando Motor".

---

## Entrypoints para outros recursos

### Export `openExternal`

Abre o painel NUI se o jogador estiver dentro de um veículo.

```lua
exports['mri_Qvehcontrol']:openExternal()
```

### Evento `vehcontrol:openExternal`

Mesmo efeito do export, disparável por evento.

```lua
TriggerEvent('vehcontrol:openExternal')
```

---

## Estrutura de arquivos

```
mri_Qvehcontrol/
├── client.lua           — comandos, callbacks da NUI, controle de portas/vidros/bancos/motor/luz, threads de seat shuffle e leave running
├── config.lua           — UseCommands, DisableSeatShuffle, LeaveRunning
├── html/
│   ├── vehui.html       — painel NUI
│   ├── style.css        — estilos do painel
│   └── img/             — ícones PNG das portas, vidros, bancos, capô, porta-malas, ignição e luz interna
└── fxmanifest.lua
```
