(() => {
    const CommandEvents = GameUI.CustomUIConfig().CommandEvents

    // Filter by spell keybinds
    // Registering a KeyBind will cause it to overwrite the default behavior, so we add a filter and only choose the ones we want.
    // Note that if you change the filter and re-register it will not bring back the default behavior of the hero since there is no way to undo Game.CreateCustomKeyBind 
    CommandEvents.FilterKeyBind = (CommandId) => CommandId >= DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_PRIMARY1 && CommandId <= DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_ULTIMATE_QUICKCAST
    CommandEvents.RegisterKeyBinds() 
    
    if (!CommandEvents.Test1) {
        Print("Running Input Events Test")
        
        CommandEvents.Test1 = {}
        
        // create callbacks for quick cast spell 1, 2, and 3
        const Ability1 = DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_PRIMARY1_QUICKCAST
        const Ability2 = DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_PRIMARY2_QUICKCAST
        const Ability3 = DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_PRIMARY3_QUICKCAST

        CommandEvents.Add(Ability1, () => Print("Ability 1 Has Been Cast"))

        const DelegateHandle = CommandEvents.Add(Ability1, () => Print("Another Ability 1 Handler"))

        CommandEvents.Add(Ability2, () => Print("Ability 2 Has Been Cast"))

        CommandEvents.Add(Ability2, () => {
            Print("Ability 2 Handler")
            CommandEvents.Remove(DelegateHandle) // remove just this event callback for ability 1
        })

        CommandEvents.Add(Ability3, () => {
            Print("Ability 3 Handler")
            CommandEvents.Empty(Ability1) // remove all event callbacks for ability 1
            CommandEvents.Empty(Ability2)// remove all event callbacks for ability 2
        })
    }
})()
