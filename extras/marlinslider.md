---
layout: plugin

id: marlinslider
title: Marlin Slider Controls
description: Control your fans, feedrate and flowrate in Marlinfw Version 2+.
authors:
- CmdrCody51
license: AGPLv3


date: 2023-05-13

homepage: https://github.com/CmdrCody51/OctoPrint-MarlinSlider
source: https://github.com/CmdrCody51/OctoPrint-MarlinSlider
archive: https://github.com/CmdrCody51/OctoPrint-MarlinSlider/archive/master.zip

tags:
- UI
- Controls

screenshots:
- url: /assets/img/plugins/marlinslider/slider.png
  alt: MarlinSlider Control tab
  caption: Control tab view of MarlonSlider
- url: /assets/img/plugins/marlinslider/slider-tools.png
  alt: MarlinSlider Control tab with Tools
  caption: Control tab view of MarlonSlider using multiple tools
- url: /assets/img/plugins/marlinslider/settings.png
  alt: Settings for MarlinSlider usage
  caption: MarlinSlider settings

featuredimage: /assets/img/plugins/marlinslider/slider.png

compatibility:

  octoprint:
  - 1.4.0

  python: ">=3,<4"
  
---

**TODO**: 
Adds sliders to the controls page for setting the speed of your fans, feedrate and flowrate.
With a settings page that allows limiting the fan's output power and min/max feedrates and flowrates.
NOTE: When you are printing from an SD card that is attached directly to the printer, NONE of this works as the gcode does not pass through OctoPrint.

