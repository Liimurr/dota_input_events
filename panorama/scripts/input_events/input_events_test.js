(() => {
    const OutputDebugInfo = true

    const Print = (String) => {
        if (OutputDebugInfo)
            $.Msg(String)
    }
    
    const CommandEvents = GameUI.CustomUIConfig().CommandEvents
    if (!CommandEvents)
        $.Warning("CommandEvents not initialized, make sure input_events.js is included in the xml file before input_events_test.js")
    
    if (CommandEvents && !CommandEvents.Test1) {
        Print("Running Input Events Test 1")
        CommandEvents.Test1 = {}

        // Filter by spell keybinds
        // Registering a KeyBind will cause it to overwrite the default behavior, so we add a filter and only choose the ones we want.
        // Note that if you change the filter and re-register keybinds, it will not bring back the default behavior of the hero since there is no currently known way to undo Game.CreateCustomKeyBind
        CommandEvents.FilterKeyBind = (CommandId) => CommandId >= DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_PRIMARY1 && CommandId <= DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_ULTIMATE_QUICKCAST
        CommandEvents.RegisterKeyBinds()

        // create callbacks for quick cast spell 1, 2, and 3
        const QuickCastAbility1 = DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_PRIMARY1_QUICKCAST
        const QuickCastAbility2 = DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_PRIMARY2_QUICKCAST
        const QuickCastAbility3 = DOTAKeybindCommand_t.DOTA_KEYBIND_ABILITY_PRIMARY3_QUICKCAST

        CommandEvents.Add(QuickCastAbility1, () => Print("Ability 1 Handler (A)"))

        const DelegateHandleB = CommandEvents.Add(QuickCastAbility1, () => Print("Ability 1 Handler (B)"))

        CommandEvents.Add(QuickCastAbility2, () => Print("Ability 2 Handler (C)"))

        CommandEvents.Add(QuickCastAbility2, () => {
            Print("Ability 2 Handler (D)")
            CommandEvents.Remove(DelegateHandleB) // remove just the event callback B for quick-cast ability 1
        })

        CommandEvents.Add(QuickCastAbility3, () => {
            Print("Ability 3 Handler (E)")
            CommandEvents.Empty(QuickCastAbility1) // remove all event callbacks for quick-cast ability 1
            CommandEvents.Empty(QuickCastAbility2) // remove all event callbacks for quick-cast ability 2
        })
    }
})()
