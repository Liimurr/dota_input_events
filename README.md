# Dota Mod Input Events
This is meant to be a library that simplifies creating callbacks for DOTAKeybindCommands.
* pros
  * Is able to re-register key binds when the user changes their settings
* cons
  * Can only bind to one keybind "layer" (e.g. Shop and Spectator keys are on a different layer which can have duplicate keys)
* To run the test, uncomment this line from `input_events.xml`
  * `<!-- <include src="file://{resources}/scripts/input_events/input_events_test.js" /> -->`
  * `input_events_test.js` also serves as a usage example
