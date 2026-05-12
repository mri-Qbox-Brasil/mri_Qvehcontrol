local QBCore = exports['qb-core']:GetCoreObject()

local globalPosType = GetResourceKvpString("vehcontrol_globalpos_type") or "center"
local globalPosX = GetResourceKvpFloat("vehcontrol_globalpos_x") or 0.0
local globalPosY = GetResourceKvpFloat("vehcontrol_globalpos_y") or 0.0

RegisterNetEvent('mri_Qvehcontrol:server:requestGlobalPosition', function()
    local src = source
    TriggerClientEvent('mri_Qvehcontrol:client:syncGlobalPosition', src, {
        type = globalPosType,
        x = globalPosX,
        y = globalPosY
    })
end)

RegisterNetEvent('mri_Qvehcontrol:server:setGlobalPosition', function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if Player then
        if IsPlayerAceAllowed(src, 'command') then
            globalPosType = data.type
            globalPosX = data.x or 0.0
            globalPosY = data.y or 0.0
            
            SetResourceKvp("vehcontrol_globalpos_type", globalPosType)
            if data.type == "custom" then
                SetResourceKvpFloat("vehcontrol_globalpos_x", globalPosX)
                SetResourceKvpFloat("vehcontrol_globalpos_y", globalPosY)
            end
            
            TriggerClientEvent('mri_Qvehcontrol:client:syncGlobalPosition', -1, {
                type = globalPosType,
                x = globalPosX,
                y = globalPosY
            })
            
            TriggerClientEvent('QBCore:Notify', src, "Posição padrão global da UI atualizada!", "success")
        else
            TriggerClientEvent('QBCore:Notify', src, "Sem permissão.", "error")
        end
    end
end)

QBCore.Functions.CreateCallback('mri_Qvehcontrol:server:isAdmin', function(source, cb)
    cb(IsPlayerAceAllowed(source, 'command'))
end)
