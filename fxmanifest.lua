fx_version 'adamant'
games { 'gta5' }

author 'FlavyV'
description 'Vehicle Door/Window/Seat/Engine/Dome Light NUI script'
version '1.1.5'

ui_page "ui/dist/index.html"

files {
  "ui/dist/index.html",
  "ui/dist/**/*"
}

client_script {
  'config.lua',
  '3d_viewer.lua',
  'client.lua'
}

server_script 'server.lua'

export {
  'openExternal'
}
