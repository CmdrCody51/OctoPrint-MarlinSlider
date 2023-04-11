# OctoPrint-MarlinSlider

Add sliders to control the speed of a parts cooling fan, feedrate and flowrate for printers with Marlin firmware.
With version 2 or other firmwares that can report the values, the plugin will report values sent by OctoPrint.

![](./image/slider.png)

## Usage

Slide the sliders, click the buttons. The radio buttons select the range for the feedrate and flowrate.

## Fan Settings

* The default value of the fan slider is user configurable, this is the value that the slider will be set to upon loading OctoPrint's UI, and any time you refresh the page.

* The remember last speed checkbox will tell the plugin to save the fan speed as it gets sent to the printer, and set the slider to that value on load / refresh (overrides the default value setting).

* The minimum fan speed setting will limit how slow the fan runs, this is useful since some fans don't work below a certain speed. This setting will be envoked for any fan speed set through OctoPrint. M107 still turns off the fan. M106 S0 will not. That command will be set to the minimum fan speed entered here.

* The maximum fan speed setting will limit how fast the fan runs, this is useful if your fan is too strong, or you wish to limit the speed post-slice without having to re-slice your file.

* "Disable M106 / M107" will disable the controls and reject all M106/M107 commands before they're sent to the printer. This setting has a corresponding padlock button beside the off button, both the padlock button and this setting in the settings page do exactly the same thing. This setting is here only as a convenience.

* Notification autohide delay controls how long any notifications will remain on the screen for. If the user manually sets a speed outside of the set range, a notification will be displayed informing the user the fan speed has been modified. Print jobs shouldn't trigger these notifications, and so popup spam shouldn't occur, however if a user wishes not to receive notifications when setting fan speeds outside of the set range, this value can be set to 0 (zero) to disable notifications. (this setting won't / shouldn't affect OctoPrint's global notifications, it only applies to info popups generated by this plugin).

*Note: Slider does **not** follow the speed of the fan **not** set through OctoPrint.
If the fan speed is set via the SD card or an LCD panel on the printer, the slider will not respond to the change.
It is a **setting**, not an indicator.*

## Feedrate Settings

* The default value of the Feedrate slider is user configurable, this is the value that the slider will be set to upon loading OctoPrint's UI, and any time you refresh the page.

* The remember last feedrate checkbox will tell the plugin to save the feedrate value as it gets sent to the printer, and set the slider to that value on load / refresh (overrides the default value setting).

* The minimum feedrate setting will limit how slow the printer runs, this is useful since a Feedrate of 0 is perfectly legal but very unproductive. Hard limited to 1.

* The maximum feedrate setting will limit how fast the printer runs, this is useful if you get silly or fat-fingered. You can verify the Max limit by sending M220 S32000, and then follow that with an empty M220. Currenty 999. However, long before you get there, your steppers will start skipping. So make this number reasonable, maybe 499?

* Notification autohide delay controls how long any notifications will remain on the screen for. If the user manually sets a feedrate outside of the set range, a notification will be displayed informing the user the feedrate has been modified. Print jobs shouldn't trigger these notifications, and so popup spam shouldn't occur, however if a user wishes not to receive notifications when setting fan speeds outside of the set range, this value can be set to 0 (zero) to disable notifications. (this setting won't / shouldn't affect OctoPrint's global notifications, it only applies to info popups generated by this plugin).

* Note: Ranges 0-200,100-300,200-400,300-500. Extended 400-600,500-700,600-800,700-900,800-1000

*Note: Slider does not follow the feedrate not set through OctoPrint. If the feedrate is set via the SD card or an LCD panel on the printer, the slider will not respond to the change.
You can update the values using the Checkmark, if not printing from the SD Card.*

## Flowrate Settings

* The default value of the Flowrate slider is user configurable, this is the value that the slider will be set to upon loading OctoPrint's UI, and any time you refresh the page.

* The remember last flowrate checkbox will tell the plugin to save the flowrate value as it gets sent to the printer, and set the slider to that value on load / refresh (overrides the default value setting).

* The minimum flowrate setting will limit how slow th Avatar jneilliii e extruder runs, this is useful since a Flowrate of 0 is perfectly legal but very unproductive. Hard limited to 1.

* The maximum flowrate setting will limit how fast the extruder runs, this is useful if you get silly or fat-fingered. You can verify the Max limit by sending M221 S16384, and then follow that with an empty M221. Currenty no limit, but ut wraps at about 16384. However, long before you get there, your stepper will start skipping. So make this number reasonable, maybe 499?

* Notification autohide delay controls how long any notifications will remain on the screen for. If the user manually sets a flowrate outside of the set range, a notification will be displayed informing the user the flowrate has been modified. Print jobs shouldn't trigger these notifications, and so popup spam shouldn't occur, however if a user wishes not to receive notifications when setting fan speeds outside of the set range, this value can be set to 0 (zero) to disable notifications. (this setting won't / shouldn't affect OctoPrint's global notifications, it only applies to info popups generated by this plugin).

* Note: Ranges 0-200,100-300,200-400,300-500. Extended 400-600,500-700,600-800,700-900,800-1000

* *Note: Slider does not follow the flowrate not set through OctoPrint. If the flowrate is set via the SD card or an LCD panel on the printer, the slider will not respond to the change.
You can update the values using the Checkmark, if not printing from the SD Card.*

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/CmdrCody51/OctoPrint-MarlinSlider/archive/master.zip

## ABOUT

This is a fork from the first OctoPrint Fan Speed Slider by NTOFF since the main project is abandoned.
Then BERTUGARANGOU's fork that made it compatible with Python 3.
And then JNEILLIII who added the
I only filled out the two other sliders after Marlin added the responses.
