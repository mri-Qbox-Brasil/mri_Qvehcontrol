local QBCore = exports['qb-core']:GetCoreObject()

local studioVehicle = nil
local studioActive = false

local function destroyStudio()
    studioActive = false
    
    if studioVehicle and DoesEntityExist(studioVehicle) then
        DeleteEntity(studioVehicle)
        studioVehicle = nil
    end
end

local function spawnStudio()
    local ped = PlayerPedId()
    local currentVeh = GetVehiclePedIsIn(ped, false)
    
    if currentVeh == 0 then return end
    
    -- Cleanup any existing before creating new
    destroyStudio()
    
    local model = GetEntityModel(currentVeh)
    
    if not HasModelLoaded(model) then
        RequestModel(model)
        while not HasModelLoaded(model) do Wait(10) end
    end
    
    local camCoords = GetGameplayCamCoord()
    
    -- Clone the vehicle
    studioVehicle = CreateVehicle(model, camCoords.x, camCoords.y, camCoords.z, 0.0, false, false)
    SetEntityCollision(studioVehicle, false, false)
    FreezeEntityPosition(studioVehicle, true)
    SetEntityInvincible(studioVehicle, true)
    SetEntityAlpha(studioVehicle, 255, false)
    
    -- Sync properties to make it look exactly like the current vehicle
    local props = QBCore.Functions.GetVehicleProperties(currentVeh)
    if props then
        QBCore.Functions.SetVehicleProperties(studioVehicle, props)
    end
    
    -- Tick to keep vehicle floating in front of camera
    studioActive = true
    Citizen.CreateThread(function()
        while studioActive do
            Wait(0)
            if not DoesEntityExist(studioVehicle) then break end
            
            local camPos = GetGameplayCamCoord()
            local camRot = GetGameplayCamRot(2)
            
            -- Calculate forward vector from rotation
            local pitch = math.rad(camRot.x)
            local yaw = math.rad(camRot.z)
            
            local forwardX = -math.sin(yaw) * math.cos(pitch)
            local forwardY = math.cos(yaw) * math.cos(pitch)
            local forwardZ = math.sin(pitch)
            
            -- Distance in front of camera (e.g. 6.0 meters)
            local dist = 6.0
            local targetPos = vector3(camPos.x + forwardX * dist, camPos.y + forwardY * dist, camPos.z + forwardZ * dist)
            
            -- Slowly spin the car like a showroom
            local time = GetGameTimer() / 1000.0
            local spinYaw = camRot.z + 135.0 + (time * 15.0) 
            
            SetEntityCoordsNoOffset(studioVehicle, targetPos.x, targetPos.y, targetPos.z - 1.0, false, false, false)
            SetEntityRotation(studioVehicle, 0.0, 0.0, spinYaw, 2, true)
        end
    end)
end

RegisterNetEvent('mri_Qvehcontrol:client:toggleStudio', function(state)
    if state then
        spawnStudio()
    else
        destroyStudio()
    end
end)

-- Ensure cleanup if resource restarts while studio is open
AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then return end
    destroyStudio()
end)
