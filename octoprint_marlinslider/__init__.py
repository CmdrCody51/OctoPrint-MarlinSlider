### (Don't forget to remove me)
# This is a basic skeleton for your plugin's __init__.py. You probably want to adjust the class name of your plugin
# as well as the plugin mixins it's subclassing from. This is really just a basic skeleton to get you started,
# defining your plugin as a template plugin, settings and asset plugin. Feel free to add or remove mixins
# as necessary.
#
# Take a look at the documentation on what other plugin mixins are available.
#
# coding=utf-8
from __future__ import absolute_import

from decimal import *
import re
import octoprint.plugin

class MarlinSliderPlugin(
    octoprint.plugin.StartupPlugin,
    octoprint.plugin.TemplatePlugin,
    octoprint.plugin.SettingsPlugin,
    octoprint.plugin.AssetPlugin
):

    def __init__(self):
        self.minPWM=0,
        self.maxPWM=255,
        self.lockfan=False,
        self.minFeed=1,
        self.maxFeed=499,
        self.minFlow=0,
        self.maxFlow=499

    def on_after_startup(self):
        self.get_settings_updates()

    def get_settings_defaults(self):
        return dict(
            defaultFanSpeed=100,
            minSpeed=0,
            maxSpeed=100,
            defaultFeedR=100,
            minFeedR=1,
            maxFeedR=499,
            defaultFlowR=100,
            minFlowR=0,
            maxFlowR=499,
            notifyDelay=4000,
            lockfan=False,
            lastSentSpeed=0,
            lastSentFeedR=0,
            lastSentFlowR=0,
            defaultLastSpeed=True,
            defaultLastFeedR=True,
            defaultLastFlowR=True
        )

    def on_settings_save(self, data):
        s = self._settings
        if "defaultFanSpeed" in list(data.keys()):
            s.setInt(["defaultFanSpeed"], data["defaultFanSpeed"])
        if "minSpeed" in list(data.keys()):
            s.setInt(["minSpeed"], data["minSpeed"])
        if "maxSpeed" in list(data.keys()):
            s.setInt(["maxSpeed"], data["maxSpeed"])
        if "defaultFeedR" in list(data.keys()):
            s.setInt(["defaultFeedR"], data["defaultFeedR"])
        if "minFeedR" in list(data.keys()):
            s.setInt(["minFeedR"], data["minFeedR"])
        if "maxFeedR" in list(data.keys()):
            s.setInt(["maxFeedR"], data["maxFeedR"])
        if "defaultFlowR" in list(data.keys()):
            s.setInt(["defaultFlowR"], data["defaultFlowR"])
        if "minFlowR" in list(data.keys()):
            s.setInt(["minFlowR"], data["minFlowR"])
        if "maxFlowR" in list(data.keys()):
            s.setInt(["maxFlowR"], data["maxFlowR"])
        if "notifyDelay" in list(data.keys()):
            s.setInt(["notifyDelay"], data["notifyDelay"])
        if "lockfan" in list(data.keys()):
            s.set(["lockfan"], data["lockfan"])
        if "lastSentSpeed" in list(data.keys()):
            s.setInt(["lastSentSpeed"], data["lastSentSpeed"])
        if "lastSentFeedR" in list(data.keys()):
            s.setInt(["lastSentFeedR"], data["lastSentFeedR"])
        if "lastSentFlowR" in list(data.keys()):
            s.setInt(["lastSentFlowR"], data["lastSentFlowR"])
        if "defaultLastSpeed" in list(data.keys()):
            s.set(["defaultLastSpeed"], data["defaultLastSpeed"])
        if "defaultLastFeedR" in list(data.keys()):
            s.set(["defaultLastFeedR"], data["defaultLastFeedR"])
        if "defaultLastFlowR" in list(data.keys()):
            s.set(["defaultLastFlowR"], data["defaultLastFlowR"])
        self.get_settings_updates()
        #clean up settings if everything's default
        self.on_settings_cleanup()
        s.save()

    #function stolen...err borrowed :D from types.py @ 1663
    def on_settings_cleanup(self):
        import octoprint.util
        from octoprint.settings import NoSuchSettingsPath

        try:
            config = self._settings.get_all_data(merged=False, incl_defaults=False, error_on_path=True)
        except NoSuchSettingsPath:
            return

        if config is None:
            self._settings.clean_all_data()
            return

        if self.config_version_key in config and config[self.config_version_key] is None:
            del config[self.config_version_key]

        defaults = self.get_settings_defaults()
        diff = octoprint.util.dict_minimal_mergediff(defaults, config)

        if not diff:
            self._settings.clean_all_data()
        else:
            self._settings.set([], diff)

    def get_assets(self):
        return dict(
            js=["js/marlinslider.js"],
            css=["css/marlinslider.css"]
        )

    def get_template_configs(self):
        return [
            dict(type="settings", custom_bindings=False)
        ]

    def get_settings_updates(self):
        self.defaultFanSpeed = self._settings.getInt(["defaultFanSpeed"])
        self.minSpeed = self._settings.getInt(["minSpeed"])
        self.maxSpeed = self._settings.getInt(["maxSpeed"])
        self.defaultFeedR = self._settings.getInt(["defaultFeedR"])
        self.minFeedR = self._settings.getInt(["minFeedR"])
        self.maxFeedR = self._settings.getInt(["maxFeedR"])
        self.defaultFlowR = self._settings.getInt(["defaultFlowR"])
        self.minFlowR = self._settings.getInt(["minFlowR"])
        self.maxFlowR = self._settings.getInt(["maxFlowR"])
        self.lockfan = self._settings.get(["lockfan"])

        getcontext().prec=5 #sets precision for "Decimal" not sure if this'll cause conflicts, ideas?
        self.minPWM = round( Decimal(self.minSpeed) * Decimal(2.55), 2 )
        self.maxPWM = round( Decimal(self.maxSpeed) * Decimal(2.55), 2 )

    def rewrite_marlinslider(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):
        if gcode and gcode.startswith('M106') and not self.lockfan:
            fanPwm = re.search("S(\d+\.?\d*)", cmd)
            if fanPwm and fanPwm.group(1):
                fanPwm = fanPwm.group(1)
                if Decimal(fanPwm) < self.minPWM and Decimal(fanPwm) != 0:
                    self._logger.info("fan pwm value " + str(fanPwm) + " is below threshold, increasing to " + str(self.minPWM) + " (" + str(self.minSpeed) + "%)")
                    new_cmd = cmd.replace("S" + str(fanPwm), "S" + str(self.minPWM) )
                    return new_cmd,
                elif Decimal(fanPwm) > self.maxPWM:
                    self._logger.info("fan pwm value " + str(fanPwm) + " is above threshold, decreasing to " + str(self.maxPWM) + " (" + str(self.maxSpeed) + "%)")
                    new_cmd = cmd.replace("S" + str(fanPwm), "S" + str(self.maxPWM) )
                    return new_cmd,
        elif gcode and gcode.startswith('M220'):
            feedNum = re.search("S(\d+\.?\d*)", cmd)
            if feedNum and feedNum.group(1):
                feedNum = feedNum.group(1)
                if Decimal(feedNum) < self.minFeedR and Decimal(feedNum) != 0:
                    self._logger.info("feed rate value " + str(feedNum) + " is below threshold, increasing to " + str(self.minFeedR) + " (" + str(self.minFeedR) + "%)")
                    new_cmd = cmd.replace("S" + str(feedNum), "S" + str(self.minFeedR) )
                    return new_cmd,
                elif Decimal(feedNum) > self.maxFeedR:
                    self._logger.info("feed rate value " + str(feedNum) + " is above threshold, decreasing to " + str(self.maxFeedR) + " (" + str(self.maxFeedR) + "%)")
                    cmd = "M220 S" + str(self.maxFeedR)
                    new_cmd = cmd.replace("S" + str(feedNum), "S" + str(self.maxFeedR) )
                    return new_cmd,
        elif gcode and gcode.startswith('M221'):
            flowNum = re.search("S(\d+\.?\d*)", cmd)
            if flowNum and flowNum.group(1):
                flowNum = flowNum.group(1)
                if Decimal(flowNum) < self.minFlowR and Decimal(flowNum) != 0:
                    self._logger.info("flow rate value " + str(flowNum) + " is below threshold, increasing to " + str(self.minFlowR) + " (" + str(self.minFlowR) + "%)")
                    cmd = "M221 S" + str(self.minFlowR)
                    new_cmd = cmd.replace("S" + str(flowNum), "S" + str(self.minFlowR) )
                    return new_cmd,
                elif Decimal(flowNum) > self.maxFlowR:
                    self._logger.info("flow rate value " + str(flowNum) + " is above threshold, decreasing to " + str(self.maxFlowR) + " (" + str(self.maxFlowR) + "%)")
                    cmd = "M221 S" + str(self.maxFlowR)
                    new_cmd = cmd.replace("S" + str(flowNum), "S" + str(self.maxFlowR) )
                    return new_cmd,
        elif gcode and gcode.startswith(('M106', 'M107')) and self.lockfan:
            self._logger.info("A cooling fan control command was seen, but fanspeedslider is locked. Control command " + str(cmd) + " removed from queue.")
            return None,

    def render_marlinslider(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):
# Fan stuff - On Off
        if gcode and gcode.startswith(('M106', 'M107')):
# M107 w-w/o P
            if gcode.startswith('M107'):
                fanPwm = re.search("S(\d+\.?\d*)", "S0")
# M106 alome
            elif cmd == 'M106':
                fanPwm = re.search("S(\d+\.?\d*)", "S255")
# M106 w S T I P 
            elif gcode.startswith('M106'):
                fanPwm = re.search("S(\d+\.?\d*)", cmd)
# No S - tell me!
                if fanPwm is None:
                    fanPwm = re.search("S(-?\d+\.?\d*)", "S-1")
# Fans - Track [P] [I] and [T]
            fanI = cmd.find('I')
            if fanI > 0:
                fanPreset = re.search("I(\d+\.?\d*)", cmd)
            else:
                fanPreset = re.search("I(-?\d+\.?\d*)", "I-1")
            fanP = cmd.find('P')
            if fanP > 0:
                fanIndex = re.search("P(\d+\.?\d*)", cmd)
            else:
                fanIndex = re.search("P(-?\d+\.?\d*)", "P-1")
            fanT = cmd.find('T')
            if fanT > 0:
                fanSecnd = re.search("T(\d+\.?\d*)", cmd)
            else:
                fanSecnd = re.search("T(-?\d+\.?\d*)", "T-1")

            self._plugin_manager.send_plugin_message(self._identifier, {'fanPwm': float(fanPwm.group(1)),'fanP': fanP,'fanI': fanI,'fanT': fanT,'fanIndex': float(fanIndex.group(1)),'fanPreset': float(fanPreset.group(1)),'fanSecnd': float(fanSecnd.group(1))})
# Fans thru material presets
        elif gcode and gcode.startswith('M145'):
            # need S and F no S = S0
            tool = re.search("S(\d+\.?\d*)", cmd)
            if tool is None:
                tool = re.search("S(\d+\.?\d*)", "S0")
            fanPwm = re.search("F(\d+\.?\d*)", cmd)
            if fanPwm and fanPwm.group(1):
                self._plugin_manager.send_plugin_message(self._identifier, {'fanPwm': float(fanPwm.group(1)),'fanP': -1,'fanI': -10,'fanT': -1,'fanIndex': -1.0,'fanPreset': float(tool.group(1)),'fanSecnd': -1.0})
# Feedrate - Check for [B]ackup and [R]estore flags
        elif gcode and gcode.startswith('M220'):
            feedNum = re.search("S(\d+\.?\d*)", cmd)
            feedB = cmd.find('B')
            feedR = cmd.find('R')
            if feedNum and feedNum.group(1):
                self._plugin_manager.send_plugin_message(self._identifier, {'feedNum': float(feedNum.group(1)),'feedB': feedB,'feedR': feedR})
            else:
                self._plugin_manager.send_plugin_message(self._identifier, {'feedNum': float("-1"),'feedB': feedB,'feedR': feedR})
# Flowrate - Track thr [T]ool presets
        elif gcode and gcode.startswith('M221'):
            flowNum = re.search("S(\d+\.?\d*)", cmd)
            toolR = cmd.find('T')
            if toolR > 0:
                toolRef = re.search("T(\d+\.?\d*)", cmd)
            if flowNum and flowNum.group(1):
                self._plugin_manager.send_plugin_message(self._identifier, {'flowNum': float(flowNum.group(1)),'toolR': toolR, 'toolRef': float(toolRef.group(1))})
        elif gcode and gcode.startswith('T'):
            toolNum = re.search("T(\d+\.?\d*)", cmd)
            if toolNum and toolNum.group(1):
                self._plugin_manager.send_plugin_message(self._identifier, {'toolNum': float(toolNum.group(1))})

# Send: N6 M220*37
# Recv: FR:100%
# !!DEBUG:send FR:100%
# Send: N7 M221*37
# Recv: echo:E0 Flow: 100%
# E0 thru E7
# !!DEBUG:send echo:Ex Flow: 100%
# Recv: echo:  M145 Sx Hxxx.xx Bxx.xx Fx
    def render_marlinslider_received(self, comm, line, *args, **kwargs):
        if line and line.startswith(('FR', 'echo:E', 'echo:  M145')):
# From M220        
            if line.startswith('FR'):
                feedNum = re.search(":(\d+\.?\d*)", line)
                if feedNum and feedNum.group(1):
                    self._plugin_manager.send_plugin_message(self._identifier, {'feedNum': float(feedNum.group(1))})
# From M221                    
            elif line.startswith('echo:E'):
                tool = re.search("E(\d+\.?\d*)", line)
                flowNum = re.search("Flow: (\d+\.?\d*)", line)
                if flowNum and flowNum.group(1):
                    self._plugin_manager.send_plugin_message(self._identifier, {'flowNum': float(flowNum.group(1)), 'toolR': 1, 'toolRef': float(tool.group(1))})
# From M503
            elif line.startswith('echo:  M145'):
                tool = re.search("S(\d+\.?\d*)", line)
                fanPwm = re.search("F(\d+\.?\d*)", line)
                self._plugin_manager.send_plugin_message(self._identifier, {'fanPwm': float(fanPwm.group(1)),'fanP': -1,'fanI': -10,'fanT': -1,'fanIndex': -1.0,'fanPreset': float(tool.group(1)),'fanSecnd': -1.0})
        return line

    def get_update_information(self):
        return dict(
            marlinslider=dict(
                displayName="Marlin Slider Control",
                displayVersion=self._plugin_version,

                # version check: github repository
                type="github_release",
                user="CmdrCody51",
                repo="OctoPrint-MarlinSlider",
                current=self._plugin_version,

                # update method: pip
                pip="https://github.com/CmdrCody51/OctoPrint-MarlinSlider/archive/{target_version}.zip"
            )
        )

__plugin_name__ = "MarlinSlider Plugin"
__plugin_pythoncompat__ = ">=3,<4"
def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = MarlinSliderPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.comm.protocol.gcode.queuing": __plugin_implementation__.rewrite_marlinslider,
        "octoprint.comm.protocol.gcode.sent": __plugin_implementation__.render_marlinslider,
        "octoprint.comm.protocol.gcode.received": __plugin_implementation__.render_marlinslider_received,
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }

