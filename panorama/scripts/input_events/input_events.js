(() => {
    const OutputDebugInfo = true

    const Print = (String) => {
        if (OutputDebugInfo)
            $.Msg(String)
    }

    const GetHotReloadPersistentStorage = () => $.GetContextPanel()

    const GetTimeStamp = () => {
        const Storage = GetHotReloadPersistentStorage()
        Storage.TimeStamp = Storage.TimeStamp ? Storage.TimeStamp : Date.now()
        return Storage.TimeStamp
    }

    const GetRegisteredKeyBinds = () => {
        const Storage = GetHotReloadPersistentStorage()
        Storage.RegisteredKeyBinds =  Storage.RegisteredKeyBinds ? Storage.RegisteredKeyBinds : {}
        return Storage.RegisteredKeyBinds
    }

    function MulticastDelegate () {
        this.EventHandlers = {}
        this.PreviousId = 0
        this.GetNewId = () => ++this.PreviousId
        this.Remove = (EventId) => delete this.EventHandlers[EventId]
        this.Add = (Handler) => {
            const EventId = this.GetNewId()
            this.EventHandlers[EventId] = Handler
            return EventId
        }
        this.Empty = () => {
            this.EventHandlers = {}
            this.PreviousId = 0
        }
        this.Execute = () => {
            for (const Handler of Object.values(this.EventHandlers))
                Handler()
        }
    }

    const GetCommandDelegates = () => {
        const Storage = GetHotReloadPersistentStorage()
        Storage.CommandDelegates = Storage.CommandDelegates ? Storage.CommandDelegates : {}
        return Storage.CommandDelegates
    }

    const GetCommandDelegate = (CommandId) => {
        const CommandDelegates = GetCommandDelegates()
        CommandDelegates[CommandId] = CommandDelegates[CommandId] ?  CommandDelegates[CommandId] : new MulticastDelegate()
        return CommandDelegates[CommandId]
    }

    const GetKeyBindForCommand = (DOTAKeybindCommand) => Game.GetKeybindForCommand(DOTAKeybindCommand).replace("ALT-", "ALT+"); // CreateCustomKeyBind will work as expected with KeyBinds that use the ALT modifier

    const InvokeCommand = (CommandId) => GetCommandDelegate(CommandId).Execute()

    const ClearAllExistingKeyBindCallbacks = () => {
        const RegisteredKeyBinds = GetRegisteredKeyBinds()
        for (const KeyBind in RegisteredKeyBinds) {
            RegisteredKeyBinds[KeyBind].Callback = () => {}
        }
    }

    // In order to support user changing their KeyBinds, KeyBinds can only be setup to work for one of these layers
    // This is due to the workaround used for the CreateCustomKeyBind bug where old CreateCustomKeyBinds cannot be removed 
    // This project is currently hard coded to use MainLayer since it has the most KeyBinds and suits most use cases
    // "Layer" : KeyBinds on different layers can have duplicate keys bound
    const EKeyBindLayers = {
        MainLayer : "MainLayer",
        ShopLayer : "ShopLayer",
        SpectatorLayer : "SpectatorLayer"
    }

    const IsValidCommand = (CommandId) => CommandId > DOTAKeybindCommand_t.DOTA_KEYBIND_FIRST && CommandId < DOTAKeybindCommand_t.DOTA_KEYBIND_COUNT
    const IsShopLayerCommand = (ComandId) => ComandId >= DOTAKeybindCommand_t.DOTA_KEYBIND_SHOP_CONSUMABLES && ComandId <= DOTAKeybindCommand_t.DOTA_KEYBIND_SHOP_SLOT_14
    const IsSpectatorLayerCommand = (CommandId) => CommandId >= DOTAKeybindCommand_t.DOTA_KEYBIND_SPEC_CAMERA_UP && CommandId <= DOTAKeybindCommand_t.DOTA_KEYBIND_SPEC_COACH_VIEWTOGGLE
    const IsMainLayerCommand = (CommandId) => IsValidCommand(CommandId) && !IsShopLayerCommand(CommandId) && !IsSpectatorLayerCommand(CommandId)

    const RegisterKeybinds = () => {
        ClearAllExistingKeyBindCallbacks()

        for (const DOTAKeybindCommandName in DOTAKeybindCommand_t)
        {
            const CommandId = DOTAKeybindCommand_t[DOTAKeybindCommandName]

            if (!IsMainLayerCommand(CommandId))
                continue

            if (!GameUI.CustomUIConfig().CommandEvents.FilterKeyBind(CommandId))
                continue

            const KeyBind = GetKeyBindForCommand(CommandId)
            if (!KeyBind || KeyBind === "")
                continue

            const RegisteredKeyBinds = GetRegisteredKeyBinds()
            const RegisteredKeyBind = RegisteredKeyBinds[KeyBind]
            if (!RegisteredKeyBind) {
                RegisteredKeyBinds[KeyBind] = {}
                RegisteredKeyBinds[KeyBind].Callback = () => InvokeCommand(CommandId)

                const CustomCommandName = `CommandHook_${EKeyBindLayers.MainLayer}_KeyBind_${KeyBind}_${GetTimeStamp()}`
                Print("Creating command: " + CustomCommandName)

                Game.CreateCustomKeyBind(KeyBind, CustomCommandName);
                Game.AddCommand(CustomCommandName, () => {
                    Print(`Attempting to call command for keybind ${KeyBind}`)
                    RegisteredKeyBinds[KeyBind].Callback()
                }, "", 0);
                Print(`Registering KeyBind ${KeyBind} to call command ${DOTAKeybindCommandName}`)
            } else {
                RegisteredKeyBinds[KeyBind].Callback = () => InvokeCommand(CommandId)
                Print(`Re-registering KeyBind ${KeyBind} to call command ${DOTAKeybindCommandName}`)
            }
        }
    }
    
    if (!GameUI.CustomUIConfig().CommandEvents) {
        function CommandDelegateHandle (CommandId, DelegateHandle) {
            this.CommandId = CommandId
            this.DelegateHandle = DelegateHandle
        }
        const CommandEvents = GameUI.CustomUIConfig().CommandEvents = {};
        CommandEvents.FilterKeyBind = (CommandId) => false // by default we don't register any keybinds
        CommandEvents.RegisterKeyBinds = RegisterKeybinds
        CommandEvents.Add = (CommandId, Handler) => new CommandDelegateHandle(CommandId, GetCommandDelegate(CommandId).Add(Handler))
        CommandEvents.Remove = (CommandDelegateHandle) => GetCommandDelegate(CommandDelegateHandle.CommandId).Remove(CommandDelegateHandle.DelegateHandle)
        CommandEvents.Empty = (CommandId) => GetCommandDelegate(CommandId).Empty()
        $.RegisterForUnhandledEvent('DOTASettingsChanged', RegisterKeybinds) // Registered KeyBinds will update automatically when the user changes them in the settings
    }
})()