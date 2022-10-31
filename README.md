# Dota Mod Input Events
This is meant to be a library that simplifies creating callbacks for DOTAKeybindCommands.
* pros
  * Is able to re-register key binds when the user changes their settings
* cons
  * Can only bind to one keybind "layer" (e.g. Shop and Spectator keys are on a different layer which can have duplicate keys)
* To run the test, uncomment this line from `input_events.xml`
  * `<!-- <include src="file://{resources}/scripts/input_events/input_events_test.js" /> -->`
  * `input_events_test.js` also serves as a usage example

The reason I made this is I like to try weird new keybind layouts and input devices like Azeron Cyborg/Koolertron/etc.
so I ended up making a keybind practice mod. That mod has been broken for well over a year now due to various
backwards compatability breaks... So now Im trying to create some small libraries (like this one) that are hopefully more difficult 
to break / easier to maintain and test that I can use to compose into the keybind practice mod again.