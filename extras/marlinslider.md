---
layout: plugin

id: marlinslider
title: Marlin Slider Controls
description: Control your fans, feedrate and flowrate in Marlinfw Version 2+.
authors:
- CmdrCody51
license: AGPLv3


date: 2023-03-13

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
Longer description of your plugin, configuration examples etc.
This part will be visible on the page at http://plugins.octoprint.org/plugin/marlinslider/
Adds a sliders to the controls page for setting the speed of your fans, feedrate and flowrate. with a settings page that allows limiting the fan's output power and min/max feedrates and flowrates.
