# mri_Qvehcontrol | Vehicle Control NUI Panel | QBX

> Painel NUI moderno para controle de veículos no FiveM, construído com **React + TypeScript + Vite**.

## 📌 TODO

- [ ] Implementar controle individual de janelas na NUI (atualmente só temos toggle de todas as janelas de uma vez, falta controle por janela: Motorista, Passageiro, Tras. Esq., Tras. Dir.)

## ✨ Features

- **React NUI** — Interface moderna com componentes React, substituindo o HTML/jQuery legado
- **Painel de Controle** — Hood, Trunk, Motor, Luz Interior, Autopiloto
- **Portas** — Grid interativo com visualização top-down do veículo
- **Janelas** — Controle individual por janela
- **Assentos** — Troca de assento com indicação de ocupação em tempo real
- **Extras** — Toggle dinâmico de extras do veículo (detecta automaticamente os disponíveis)
- **Liveries/Plotagens** — Seletor de plotagens com indicação da ativa
- **Autopiloto** — Define waypoint e o veículo dirige automaticamente
- **Leave Engine Running** — Motor continua ligado ao sair com F longo
- **3D Viewer** — Visualizador 3D do veículo (configurável)
- **Design System** — Dark glassmorphic cyberpunk com Inter font


## 📂 Estrutura

```
mri_Qvehcontrol/
├── client.lua          # Lógica client-side (NUI open/close, vehicle data)
├── server.lua          # Lógica server-side (sync)
├── config.lua          # Configurações gerais
├── 3d_viewer.lua       # Visualizador 3D opcional
├── fxmanifest.lua      # Manifest do resource
└── ui/                 # React NUI Application
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.tsx      # Painel principal
    │   │   ├── VehicleGrid.tsx    # Grid de portas/janelas
    │   │   ├── ExtrasPanel.tsx    # Painel de extras + liveries
    │   │   ├── Toast.tsx          # Notificações
    │   │   └── DevTools.tsx       # Ferramentas de desenvolvimento
    │   ├── App.tsx
    │   └── main.tsx
    └── dist/           # Build de produção (servido pelo FiveM)
```

## ⚙️ Configuração

```lua
-- config.lua
UseCommands = true                    -- Habilitar /commands
DisableSeatShuffle = true             -- Impedir troca automática de assento
LeaveRunning = true                   -- Motor ligado ao sair com F longo

Config.EnableAutopilot = true         -- Habilitar autopiloto
Config.Enable3DViewer = false         -- Visualizador 3D
Config.AutopilotArriveDistance = 15.0 -- Distância de parada do autopiloto
Config.NormalSpeed = 20.0             -- Velocidade do autopiloto

Config.EnableExtras = true            -- Painel de extras
Config.EnableLiveries = true          -- Painel de liveries/plotagens
```

## 🔗 Integração com QBX Radial Menu

### Via qbx_radialmenu (recomendado)

O `qbx_radialmenu` já integra o vehcontrol automaticamente. O botão "Veículo" no radial abre diretamente o painel:

```lua
-- Já configurado no qbx_radialmenu/client/main.lua
TriggerEvent('vehcontrol:openExternal')
```

### Via export

```lua
exports.mri_Qvehcontrol:openExternal()
```

### Via evento

```lua
TriggerEvent('vehcontrol:openExternal')
```

### Via comando

```
/vehcontrol
```

## 🔑 Controles

| Ação | Tecla |
|---|---|
| Abrir painel | HOME (configurável) |
| Fechar painel | ESC |

## 📝 Comandos

| Comando | Descrição |
|---|---|
| `/vehcontrol` | Abrir painel de controle do veículo |

## 🏗️ Desenvolvimento

```bash
cd ui
npm install
npm run dev     # Dev server com hot reload
npm run build   # Build de produção
```
