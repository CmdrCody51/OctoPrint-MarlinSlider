# OctoPrint-MarlinSlider

Add sliders to control the speed of a parts cooling fan, feedrate and flowrate for printers with Marlin firmware.
With version 2 or other firmwares that can report the values, the plugin will report values sent by OctoPrint.

![](./image/slider.png)

## Usage

Slide the sliders, click the buttons. The Up and Down buttons select the range for the feedrate and flowrate. The arrows will automatically be disabled if changing the range is not possible, i.e. trying to move the range more than by 100%. (You must be able to display the 'current display value' inside the next range. You don't have to send it until you get to the value desired.)

## Verify

You can make sure the plugin is usable on your printer with a couple of tests. Several printers are using crippled forks of Marlinfw. Go to the Terminal and send "M220". You should recieve "FR: 100%" Send "M221" and you should get "echo:E# Flow: 100%" back. The number after the 'E' will be your active extruder. Also, from an "M503" you should recieve some "M145 S# H###.## B##.## F###" lines for the material presets. The 'F' numbers are Fan PWM counts (0 to 255) for the fans during Preheat.

![](./image/settings.png)

* Notification autohide delay controls how long any notifications will remain on the screen for. If the user manually sets a fan/feedrate/flowrate outside of the set ranges, a notification will be displayed informing the user the setting has been modified. Print jobs shouldn't trigger these notifications, and so popup spam shouldn't occur, however if a user wishes not to receive notifications when setting fan/feedrate/flowrate valurs outside of the set ranges, this value can be set to 0 (zero) to disable notifications. (this setting won't/shouldn't affect OctoPrint's global notifications, it only applies to info popups generated by this plugin).

* *Note: MarlinSlider does not follow the fan speed at all and does not follow the feedrate/flowrate not set through OctoPrint. If the feedrate/flowrate is set via the SD card or an LCD panel on the printer, the slider will not respond to the change. You can update the values using the Checkmark, if not printing from the SD Card.*

## Limitations

Currently M710 Controller Fans and M123 - Fan Tachometers are not processed at all.
The Fan slider displays and controls the current tool/hotend parts cooling fan only.
I don't have every possible 3d printer in the world ("'tis a consummation devoutly to be wish'd.") so I can not test all operations. Just fill out a Feature request with relevant logs (especially serial logs) and I'll see what we can do.

## Tips and Tricks

Under 'OctoPrint Settings (the wrench)' - 'Printer' - 'GCODE Scripts' - 'After serial connection to printer is established' you can add/modify it with
* M503 S0 - Pulls the current EEProm settings from the printer. (The S0 says don't send all the 'descriptive text').
* M107 - Turn the fan off. (It usually is but this sets the fan to a known state).
* M220 - Report current Feed Rate percentage.
* M221 - Report current Flow Rate percentage.

This way you don't have to click the Check buttons after you connect.

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/CmdrCody51/OctoPrint-MarlinSlider/archive/master.zip

## ABOUT

This is a fork from the first OctoPrint Fan Speed Slider by NTOFF since the main project is abandoned. Then BERTUGARANGOU's fork that made it compatible with Python 3. And then JNEILLIII who added the logic to set fan speed based on sent/received gcode.<br>
I only filled out the two other sliders after Marlin added the responses.

[![Ko-Fi](./image/Ko-fi_Donate.png)](https://ko-fi.com/cmdrcody) or [![GitHub](./image/github-mark-small.png)](https://github.com/CmdrCody51/OctoPrint-MarlinSlider) Use GitHub!

<small>You can also send funds via PayPal to cmdrcody&#64;pharowt&#46;com</small>

