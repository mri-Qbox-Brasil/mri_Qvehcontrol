local isInVehControl = false
local windowState1 = true
local windowState2 = true
local windowState3 = true
local windowState4 = true
local autopilotActive = false
local autopilotThreadActive = false
local QBCore = exports['qb-core']:GetCoreObject()

Citizen.CreateThread(function()
    while true do
        local sleep = 1000
        local playerPed = PlayerPedId()
        local vehicle = GetVehiclePedIsIn(playerPed, false)

        if vehicle ~= 0 then
            sleep = 0
            if LeaveRunning then
                if IsControlPressed(2, 75) and not IsEntityDead(playerPed) then
                    Citizen.Wait(150)
                    if IsPedInAnyVehicle(playerPed, false) and IsControlPressed(2, 75) and not IsEntityDead(playerPed) then
                        SetVehicleEngineOn(vehicle, true, true, false)
                        TaskLeaveVehicle(playerPed, vehicle, 0)
                        
                        if autopilotActive then
                            autopilotActive = false
                            ClearPedTasks(playerPed)
                            QBCore.Functions.Notify("Piloto automático desativado", "error")
                            SendNUIMessage({ type = "updateAutopilot", active = false })
                        end
                    end
                end
            end

            if DisableSeatShuffle then
                if GetPedInVehicleSeat(vehicle, 0) == playerPed then
                    if GetIsTaskActive(playerPed, 165) then
                        SetPedIntoVehicle(playerPed, vehicle, 0)
                    end
                end
            end
        end
        
        if autopilotActive and vehicle == 0 then
            autopilotActive = false
            ClearPedTasks(playerPed)
            SendNUIMessage({ type = "updateAutopilot", active = false })
        end

        Citizen.Wait(sleep)
    end
end)

-----------------------------------------------------------------------------
-- NUI OPEN EXPORT/EVENT
-----------------------------------------------------------------------------
RegisterCommand("vehcontrol", function(source, args, rawCommand)
	if IsPedInAnyVehicle(PlayerPedId(), false) and not IsPauseMenuActive() then
		openVehControl()
	end
end, false)

function openExternal()
	if IsPedInAnyVehicle(PlayerPedId(), false) then
		openVehControl()
	end
end

RegisterNetEvent('vehcontrol:openExternal')
AddEventHandler('vehcontrol:openExternal', function()
	if IsPedInAnyVehicle(PlayerPedId(), false) then
		openVehControl()
	end
end)

-----------------------------------------------------------------------------
-- NUI OPEN/CLOSE FUNCTIONS
-----------------------------------------------------------------------------
function openVehControl()
	local playerPed = PlayerPedId()
	local vehicle = GetVehiclePedIsIn(playerPed, false)
	
	if vehicle == 0 then return end

	isInVehControl = true
	SetNuiFocus(true, true)
	
	-- Collect valid doors for this vehicle
	local doorsData = {}
	local doorLabels = {
		[0] = "Motorista",
		[1] = "Passageiro",
		[2] = "Tras. Esq.",
		[3] = "Tras. Dir.",
		[4] = "Capô",
		[5] = "Porta-malas"
	}
	for i = 0, 5 do
		if GetIsDoorValid(vehicle, i) then
			doorsData[#doorsData + 1] = {
				index = i,
				label = doorLabels[i],
				open = GetVehicleDoorAngleRatio(vehicle, i) > 0.0
			}
		end
	end
	
	-- Collect extras data
	local extrasData = {}
	if Config.EnableExtras then
		for i = 1, 20 do
			if DoesExtraExist(vehicle, i) then
				extrasData[#extrasData + 1] = {
					id = i,
					enabled = IsVehicleExtraTurnedOn(vehicle, i)
				}
			end
		end
	end
	
	-- Collect liveries data
	local liveriesData = {}
	if Config.EnableLiveries then
		local liveryCount = GetVehicleLiveryCount(vehicle)
		local currentLivery = GetVehicleLivery(vehicle)
		if liveryCount > 0 then
			for i = 0, liveryCount - 1 do
				liveriesData[#liveriesData + 1] = {
					id = i,
					active = currentLivery == i
				}
			end
		end
	end
	
	SendNUIMessage({ type = "openGeneral" })
	SendNUIMessage({ type = "updateAutopilot", active = autopilotActive })
	SendNUIMessage({
		type = "initSettings",
		positionType = currentLocalPosType or "center-right",
		customX = currentLocalPosX,
		customY = currentLocalPosY,
		isAdmin = isPlayerAdmin,
		enable3DViewer = Config.Enable3DViewer,
		hasHood = GetIsDoorValid(vehicle, 4),
		hasTrunk = GetIsDoorValid(vehicle, 5),
		doors = doorsData,
		extras = extrasData,
		liveries = liveriesData,
		enableExtras = Config.EnableExtras,
		enableLiveries = Config.EnableLiveries
	})
	
	local maxSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle))
	
	Citizen.CreateThread(function()
		while isInVehControl do
			Citizen.Wait(250)
			local veh = GetVehiclePedIsIn(PlayerPedId(), false)
			if veh == 0 then
				closeVehControl()
				break
			end
			
			local fuel = 100
			if exports['cdn-fuel'] then
				local f = exports['cdn-fuel']:GetFuel(veh)
				if type(f) == "number" then fuel = f end
			end
			
			local engineTemp = GetVehicleEngineTemperature(veh)
			local coords = GetEntityCoords(veh)
			local streetHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
			local streetName = GetStreetNameFromHashKey(streetHash)
			local zoneName = GetNameOfZone(coords.x, coords.y, coords.z)
			local hour = GetClockHours()
			local minute = GetClockMinutes()
			local vehClass = GetVehicleClass(veh)
			
			if hour < 10 then hour = "0"..hour end
			if minute < 10 then minute = "0"..minute end
			
			local seatsData = {}
			for i = -1, maxSeats - 2 do
				table.insert(seatsData, {
					index = i,
					occupied = not IsVehicleSeatFree(veh, i)
				})
			end
			
			SendNUIMessage({
				type = "updateDynamicVehicle",
				seats = seatsData
			})
			
			-- Update door states
			local doorsState = {}
			for i = 0, 5 do
				if GetIsDoorValid(veh, i) then
					doorsState[#doorsState + 1] = {
						index = i,
						open = GetVehicleDoorAngleRatio(veh, i) > 0.0
					}
				end
			end
			SendNUIMessage({ type = "updateDoors", doors = doorsState })
			
			SendNUIMessage({
				type = "updateStats",
				fuel = fuel,
				engineTemp = engineTemp,
				street = streetName,
				zone = GetLabelText(zoneName) or zoneName,
				vehName = GetLabelText(GetDisplayNameFromVehicleModel(GetEntityModel(veh))),
				hour = tostring(hour),
				minute = tostring(minute),
				engineRunning = GetIsVehicleEngineRunning(veh),
				vehicleClass = vehClass
			})
		end
	end)
end

function closeVehControl()
	isInVehControl = false
	SetNuiFocus(false, false)
	SendNUIMessage({ type = "closeAll" })
	TriggerEvent('mri_Qvehcontrol:client:toggleStudio', false)
end

RegisterNUICallback('NUIFocusOff', function(data, cb)
	closeVehControl()
	if cb then cb('ok') end
end)

-----------------------------------------------------------------------------
-- NUI CALLBACKS & ACTIONS
-----------------------------------------------------------------------------
RegisterNUICallback('ignition', function(data, cb) EngineControl() if cb then cb('ok') end end)
RegisterNUICallback('interiorLight', function(data, cb) InteriorLightControl() if cb then cb('ok') end end)
RegisterNUICallback('doors', function(data, cb) DoorControl(data.door) if cb then cb('ok') end end)
RegisterNUICallback('seatchange', function(data, cb) SeatControl(data.seat) if cb then cb('ok') end end)
RegisterNUICallback('windows', function(data, cb) WindowControl(data.window, data.door) if cb then cb('ok') end end)
RegisterNUICallback('autopilot', function(data, cb) AutopilotControl() if cb then cb('ok') end end)
RegisterNUICallback('toggleHazard', function(data, cb)
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 then
		SetVehicleIndicatorLights(vehicle, 0, data.state)
		SetVehicleIndicatorLights(vehicle, 1, data.state)
	end
	if cb then cb('ok') end
end)
RegisterNUICallback('toggleLights', function(data, cb)
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 then
		local _, lightsOn, highbeamsOn = GetVehicleLightsState(vehicle)
		if lightsOn == 1 or highbeamsOn == 1 then
			SetVehicleLights(vehicle, 1) -- Force off
		else
			SetVehicleLights(vehicle, 2) -- Force on
		end
	end
	if cb then cb('ok') end
end)
RegisterNUICallback('toggleExtra', function(data, cb)
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 and GetPedInVehicleSeat(vehicle, -1) == PlayerPedId() then
		local extraId = math.floor(tonumber(data.id))

		-- Block extra toggle if vehicle is damaged to prevent the auto-repair exploit
		local bodyHealth = GetVehicleBodyHealth(vehicle)
		if bodyHealth < 1000.0 then
			SendNUIMessage({ type = "showToast", text = "Conserte o veículo antes de alterar extras", toastType = "error" })
			if cb then cb({ success = false }) end
			return
		end

		if DoesExtraExist(vehicle, extraId) then
			if IsVehicleExtraTurnedOn(vehicle, extraId) then
				qbx.setVehicleExtra(vehicle, extraId, false)
				SendNUIMessage({ type = "showToast", text = "Extra " .. extraId .. " desativado", toastType = "error" })
			else
				qbx.setVehicleExtra(vehicle, extraId, true)
				SendNUIMessage({ type = "showToast", text = "Extra " .. extraId .. " ativado", toastType = "success" })
			end
			if cb then cb({ success = true }) end
			return
		end
	else
		SendNUIMessage({ type = "showToast", text = "Você precisa estar no banco do motorista", toastType = "error" })
	end
	if cb then cb({ success = false }) end
end)
RegisterNUICallback('setLivery', function(data, cb)
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 and GetPedInVehicleSeat(vehicle, -1) == PlayerPedId() then
		local liveryId = data.id
		SetVehicleAutoRepairDisabled(vehicle, true)
		local currentLivery = GetVehicleLivery(vehicle)
		if currentLivery == liveryId then
			SetVehicleLivery(vehicle, -1)
			SendNUIMessage({ type = "showToast", text = "Plotagem removida", toastType = "error" })
		else
			SetVehicleLivery(vehicle, liveryId)
			SendNUIMessage({ type = "showToast", text = "Plotagem " .. (liveryId + 1) .. " aplicada", toastType = "success" })
		end
	else
		SendNUIMessage({ type = "showToast", text = "Você precisa estar no banco do motorista", toastType = "error" })
	end
	if cb then cb('ok') end
end)
RegisterNUICallback('toggleLock', function(data, cb)
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 then
		local lockStatus = GetVehicleDoorLockStatus(vehicle)
		if lockStatus == 1 or lockStatus == 0 then
			SetVehicleDoorsLocked(vehicle, 2)
			SendNUIMessage({ type = "showToast", text = "Veículo trancado", toastType = "success" })
		else
			SetVehicleDoorsLocked(vehicle, 1)
			SendNUIMessage({ type = "showToast", text = "Veículo destrancado", toastType = "success" })
		end
	end
	if cb then cb('ok') end
end)


function EngineControl()
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle ~= 0 and GetPedInVehicleSeat(vehicle, -1) == PlayerPedId() then
        ExecuteCommand('mri:engine')
    end
end

function InteriorLightControl()
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 then
		SetVehicleInteriorlight(vehicle, not IsVehicleInteriorLightOn(vehicle))
	end
end

function DoorControl(door)
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 then
		if GetVehicleDoorAngleRatio(vehicle, door) > 0.0 then
			SetVehicleDoorShut(vehicle, door, false)
		else
			SetVehicleDoorOpen(vehicle, door, false)
		end
	end
end

function SeatControl(seat)
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 then
		if IsVehicleSeatFree(vehicle, seat) then
			SetPedIntoVehicle(PlayerPedId(), vehicle, seat)
		end
	end
end

function WindowControl(window, door)
	local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
	if vehicle ~= 0 then
		if window == 0 then
			if windowState1 and DoesVehicleHaveDoor(vehicle, door) then RollDownWindow(vehicle, window) windowState1 = false else RollUpWindow(vehicle, window) windowState1 = true end
		elseif window == 1 then
			if windowState2 and DoesVehicleHaveDoor(vehicle, door) then RollDownWindow(vehicle, window) windowState2 = false else RollUpWindow(vehicle, window) windowState2 = true end
		elseif window == 2 then
			if windowState3 and DoesVehicleHaveDoor(vehicle, door) then RollDownWindow(vehicle, window) windowState3 = false else RollUpWindow(vehicle, window) windowState3 = true end
		elseif window == 3 then
			if windowState4 and DoesVehicleHaveDoor(vehicle, door) then RollDownWindow(vehicle, window) windowState4 = false else RollUpWindow(vehicle, window) windowState4 = true end
		end
	end
end

function AutopilotControl()
	local playerPed = PlayerPedId()
	local vehicle = GetVehiclePedIsIn(playerPed, false)
	
	if vehicle ~= 0 and GetPedInVehicleSeat(vehicle, -1) == playerPed then
		if autopilotActive then
			autopilotActive = false
			SendNUIMessage({ type = "showToast", text = "Piloto automático desativado", toastType = "error" })
			ClearPedTasks(playerPed)
			SendNUIMessage({ type = "updateAutopilot", active = false })
		else
			if not GetIsVehicleEngineRunning(vehicle) then
				SendNUIMessage({ type = "showToast", text = "O motor precisa estar ligado", toastType = "error" })
				return
			end
			
			if not DoesBlipExist(GetFirstBlipInfoId(8)) then
				SendNUIMessage({ type = "showToast", text = "Você precisa marcar um destino no mapa primeiro", toastType = "error" })
				return
			end
			
			autopilotActive = true
			SendNUIMessage({ type = "showToast", text = "Piloto automático ativado", toastType = "success" })
			
			local blip = GetFirstBlipInfoId(8)
			local bCoords = GetBlipCoords(blip)
			ClearPedTasks(playerPed)
			TaskVehicleDriveToCoord(playerPed, vehicle, bCoords.x, bCoords.y, bCoords.z, 20.0, 0, vehicle, 786603, 5.0, true)
			SetDriveTaskDrivingStyle(playerPed, 786603)
			
			SendNUIMessage({ type = "updateAutopilot", active = true })
			
			if not autopilotThreadActive then
				autopilotThreadActive = true
				Citizen.CreateThread(function()
					while autopilotActive do
						Citizen.Wait(500)
						local pCoords = GetEntityCoords(PlayerPedId())
						local dist = #(pCoords - bCoords)
						
						if dist < 15.0 then
							autopilotActive = false
							local veh = GetVehiclePedIsIn(PlayerPedId(), false)
							ClearPedTasks(PlayerPedId())
							SetVehicleForwardSpeed(veh, 0.0) -- Force stop
							SendNUIMessage({ type = "showToast", text = "Destino alcançado", toastType = "success" })
			SendNUIMessage({ type = "updateAutopilot", active = false })
						end
					end
					autopilotThreadActive = false
				end)
			end
		end
	else
		SendNUIMessage({ type = "showToast", text = "Você precisa estar no banco do motorista", toastType = "error" })
	end
end

-- =========================================================
-- POSITION, SETTINGS & 3D VIEWER
-- =========================================================

local currentLocalPosType = GetResourceKvpString("vehcontrol_pos_type") or nil
local currentLocalPosX = GetResourceKvpFloat("vehcontrol_pos_x") or 0.0
local currentLocalPosY = GetResourceKvpFloat("vehcontrol_pos_y") or 0.0

RegisterNUICallback('setCamera', function(data, cb)
	local mode = data.mode
	
	if mode == '3d' then
		TriggerEvent('mri_Qvehcontrol:client:toggleStudio', true)
	elseif mode == '2d' then
		TriggerEvent('mri_Qvehcontrol:client:toggleStudio', false)
	end
	
	if cb then cb('ok') end
end)

RegisterNUICallback('savePosition', function(data)
	SetResourceKvp("vehcontrol_pos_type", data.type)
	if data.type == "custom" then
		SetResourceKvpFloat("vehcontrol_pos_x", data.x + 0.0)
		SetResourceKvpFloat("vehcontrol_pos_y", data.y + 0.0)
	end
	currentLocalPosType = data.type
	currentLocalPosX = data.x
	currentLocalPosY = data.y
end)

RegisterNUICallback('setGlobalPosition', function(data)
	TriggerServerEvent('mri_Qvehcontrol:server:setGlobalPosition', data)
end)

RegisterNetEvent('mri_Qvehcontrol:client:syncGlobalPosition')
AddEventHandler('mri_Qvehcontrol:client:syncGlobalPosition', function(globalData)
	-- If player doesn't have a local override, apply the global one
	if not GetResourceKvpString("vehcontrol_pos_type") then
		currentLocalPosType = globalData.type
		currentLocalPosX = globalData.x
		currentLocalPosY = globalData.y
	end
	-- If UI is open, send it directly
	if isInVehControl then
		SendNUIMessage({
			type = "initSettings",
			positionType = currentLocalPosType,
			customX = currentLocalPosX,
			customY = currentLocalPosY,
			isAdmin = QBCore.Functions.GetPlayerData().metadata.isgod or false
		})
	end
end)

-- Initialize position optimally
local isPlayerAdmin = false

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
	TriggerServerEvent('mri_Qvehcontrol:server:requestGlobalPosition')
	QBCore.Functions.TriggerCallback('mri_Qvehcontrol:server:isAdmin', function(admin)
		isPlayerAdmin = admin
	end)
end)

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		TriggerServerEvent('mri_Qvehcontrol:server:requestGlobalPosition')
		QBCore.Functions.TriggerCallback('mri_Qvehcontrol:server:isAdmin', function(admin)
			isPlayerAdmin = admin
		end)
	end
end)
