/*
 * View model for OctoPrint-MarlinSlider
 *
 * Author: cmdrcody51
 * License: AGPLv3
 */
$(function () {
    function MarlinSliderPluginViewModel(parameters) {
        //'use strict';
        var self = this;

        self.settings = parameters[0];
        self.control = parameters[1];
        self.loginState = parameters[2];

        self.settings.defaultFanSpeed = new ko.observable(100); //this,
        self.control.fanSpeed = new ko.observable(100);         //this,
        self.settings.minFanSpeed = new ko.observable(0);       //this,
        self.settings.maxFanSpeed = new ko.observable(100);     //and this are percents 0 - 100%
        self.settings.lockfan = new ko.observable(false);       //ignore fan inputs from gcode and lock the fan buttons
        self.settings.defaultLastSpeed = new ko.observable(false); //options page option to set the slider to the last sent fan speed on load/refresh
        self.settings.lastSentSpeed = new ko.observable(null);  //the last fan speed value that was sent to the printer

        self.settings.defaultFeedR = new ko.observable(100);    //this,
        self.control.feedRate = new ko.observable(100);         //this,
        self.settings.minFeedR = new ko.observable(1);          //this,
        self.settings.maxFeedR = new ko.observable(999);        //and this are percents 0 - 999%
        self.settings.defaultLastFeedR = new ko.observable(false); //options page option to set the slider to the last sent feedrate on load/refresh
        self.settings.lastSentFeedR = new ko.observable(null);  //the last feedrate value that was sent to the printer

        self.settings.defaultFlowR = new ko.observable(100);    //this,
        self.control.flowRate = new ko.observable(100);         //this,
        self.settings.minFlowR = new ko.observable(0);          //this,
        self.settings.maxFlowR = new ko.observable(999);        //and this are percents 0 - 16834%
        self.settings.defaultLastFlowR = new ko.observable(false); //options page option to set the slider to the last sent flowrate on load/refresh
        self.settings.lastSentFlowR = new ko.observable(null);  //the last flowrate value that was sent to the printer

        self.settings.notifyDelay = new ko.observable(4000);    //time in milliseconds
        self.control.baseFeedRate = new ko.observable(100);     //center of slider
        self.control.baseFlowRate = new ko.observable(100);     //center of slider
        self.control.displayfeedRate = new ko.observable(100);  //offset of slider to actual value
        self.control.displayflowRate = new ko.observable(100);  //offset of slider to actual value
        self.control.feedBackup = new ko.observable(100);       //feedrate backup slot
        self.control.toolNum = new ko.observable(0);            //tool number
        self.control.lastSentTool = -1;                         //last known tool
        self.control.toolBlock = [100,100,100,100,100,100,100,100]; //preload default flows for 8 tools (2022 max)
        self.control.fanBlock = [-1,-1,-1,-1,-1,-1,-1,-1];      //preload default fans for 8 tools (2022 max)
        self.control.fan2Block = [-1,-1,-1,-1,-1,-1,-1,-1];     //preload default secondary fans for 8 tools (2022 max)
        self.control.matlBlock = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]; //preload default fans for 10 materials (2022 max)

        self.control.lockTitle = new ko.observable(gettext("Unlocked")); //will set the hover title info for the fan lock button

// strings for Settings page ?
        self.settings.defaultTitle = ko.observable(gettext("This is the value the slider will default to when the UI is loaded/refreshed."));
        self.settings.FancommonTitle = ko.observable(gettext("\nThis allows limiting the cooling fan without having to re-slice your model.\nLimited to prints controlled by OctoPrint."));
        self.settings.FanminTitle = ko.observable(gettext("Set this to the lowest value at which your fan will spin.") + self.settings.FancommonTitle());
        self.settings.FanmaxTitle = ko.observable(gettext("Set this <100% if your cooling fan is too strong on full.") + self.settings.FancommonTitle());
        self.settings.FeedcommonTitle = ko.observable(gettext("\nThis allows limiting the feedrate without having to re-slice your model.\nLimited to prints controlled by OctoPrint."));
        self.settings.FeedminTitle = ko.observable(gettext("Set this to the lowest value at which you want your printer to run.") + self.settings.FeedcommonTitle());
        self.settings.FeedmaxTitle = ko.observable(gettext("Set this upto 999%. REMEMBER! that is 10 times your normal feedrate!") + self.settings.FeedcommonTitle());
        self.settings.FlowcommonTitle = ko.observable(gettext("\nThis allows limiting the flowrate without having to re-slice your model.\nLimited to prints controlled by OctoPrint."));
        self.settings.FlowminTitle = ko.observable(gettext("Set this to the lowest value at which you want your extruder to run.") + self.settings.FlowcommonTitle());
        self.settings.FlowmaxTitle = ko.observable(gettext("Set this upto 999%. REMEMBER! that is 10 times your normal extrusion rate!") + self.settings.FlowcommonTitle());
        self.settings.noticeTitle = ko.observable(gettext("Notifications only apply when setting via the slider + button in the UI. Set to 0 (zero) to disable notifications."));
        self.settings.lastspeedTitle = ko.observable(gettext("Instead of defaulting to the value set by \"Default Value\", the slider will be set to the last sent value on load/refresh. \n Note: It takes into account the min/max value setting and overrides the \"Default Value\" setting."));
        self.control.feedCheckTitle = ko.observable(gettext("Check current feedrate override.\nQueries printer for value."));
        self.control.flowCheckTitle = ko.observable(gettext("Check current tool and flowrate override.\nQueries printer for values."));

        self.showNotify = function (self, options) {
            options.title = "Marlin Slider Control";
            options.delay = options.delay || self.settings.notifyDelay();
            options.type = options.type || "info";
            if (options.delay != "0") {
                new PNotify(options);
            }
        };

        self.control.fanSpeedToPwm = ko.pureComputed(function () {
            self.speed = self.control.fanSpeed() * 255 / 100 ;
            return self.speed;
        });

        self.control.checkFanSliderValue = ko.pureComputed(function () {
            if (self.control.fanSpeed() < self.settings.minFanSpeed() && self.control.fanSpeed() != "0") {
                console.log("Marlin Slider Control Plugin: Fan " + self.control.fanSpeed() + "% is less than the minimum speed (" + self.settings.minFanSpeed() + "%), increasing.");
                self.control.fanSpeed(self.settings.minFanSpeed());
                var options = {
                    hide: true,
                    text: gettext('Fan speed increased to meet minimum speed requirement.'),
                    addclass:  'fan_speed_notice_low',
                }
                if ($(".fan_speed_notice_low").length <1) {
                    self.showNotify(self, options);
                }
            }
            else if (self.control.fanSpeed() > self.settings.maxFanSpeed()) {
                console.log("Marlin Sluder Control Plugin: Fan " + self.control.fanSpeed() + "% is more than the maximum speed (" + self.settings.maxFanSpeed() + "%), decreasing.");
                self.control.fanSpeed(self.settings.maxFanSpeed());
                var options = {
                    hide: true,
                    text: gettext('Fan speed decreased to meet maximum speed requirement.'),
                    addclass:  'fan_speed_notice_high',
                }
                if ($(".fan_speed_notice_high").length <1) {
                    self.showNotify(self, options);
                }
            }
        });

        self.control.checkFeedSliderValue = ko.pureComputed(function () {
            if (self.control.feedRate() < self.settings.minFeedR()) {
                console.log("Marlin Slider Control Plugin: Feedrate " + self.control.feedRate() + "% is less than the minimum feedrate (" + self.settings.minFeedR() + "%), increasing.");
                self.control.feedRate(self.settings.minFeedR());
                var options = {
                    hide: true,
                    text: gettext('Feedrate increased to meet minimum feed requirement.'),
                    addclass:  'feedrate_notice_low',
                }
                if ($(".feedrate_notice_low").length <1) {
                    self.showNotify(self, options);
                }
            }
            else if (self.control.feedRate() > self.settings.maxFeedR()) {
                console.log("Marlin Sluder Control Plugin: Feedrate " + self.control.feedRate() + "% is more than the maximum feedrate (" + self.settings.maxFeedR() + "%), decreasing.");
                self.control.feedRate(self.settings.maxFeedR());
                var options = {
                    hide: true,
                    text: gettext('Feedrate decreased to meet maximum feed requirement.'),
                    addclass:  'feedrate_notice_high',
                }
                if ($(".feedrate_notice_high").length <1) {
                    self.showNotify(self, options);
                }
            }
        });

        self.control.checkFlowSliderValue = ko.pureComputed(function () {
            if (self.control.flowRate() < self.settings.minFlowR()) {
                console.log("Marlin Slider Control Plugin: Flowrate " + self.control.flowRate() + "% is less than the minimum flowrate (" + self.settings.minFlowR() + "%), increasing.");
                self.control.flowRate(self.settings.minFlowR());
                var options = {
                    hide: true,
                    text: gettext('Flowrate increased to meet minimum flow requirement.'),
                    addclass:  'flowrate_notice_low',
                }
                if ($(".flowrate_notice_low").length <1) {
                    self.showNotify(self, options);
                }
            }
            else if (self.control.flowRate() > self.settings.maxFlowR()) {
                console.log("Marlin Sluder Control Plugin: Flowrate " + self.control.flowRate() + "% is more than the maximum flowrate (" + self.settings.maxFlowR() + "%), decreasing.");
                self.control.FlowRate(self.settings.maxFlowR());
                var options = {
                    hide: true,
                    text: gettext('Flowrate decreased to meet maximum flow requirement.'),
                    addclass:  'flowrate_notice_high',
                }
                if ($(".flowrate_notice_high").length <1) {
                    self.showNotify(self, options);
                }
            }
        });

        //send gcode to set fan speed
        self.control.sendFanSpeed = function () {
            self.control.checkFanSliderValue();
            self.control.sendCustomCommand({ command: "M106 S" + self.control.fanSpeedToPwm() });

            if (self.settings.defaultLastSpeed()) {
                self.settings.settings.plugins.marlinslider.lastSentSpeed(self.control.fanSpeed());
                self.settings.saveData();
                self.updateSettings();
            }
        };

        //send gcode to set feedrate
        self.control.sendFeedR = function () {
            self.control.feedRate(self.control.displayfeedRate() + (self.control.baseFeedRate() - 100));
            self.control.checkFeedSliderValue();
            self.control.sendCustomCommand({ command: "M220 S" + self.control.feedRate() });

            if (self.settings.defaultLastFeedR()) {
                self.settings.settings.plugins.marlinslider.lastSentFeedR(self.control.feedRate());
                self.settings.saveData();
                self.updateSettings();
            }
        };

        //send gcode to set flowrate
        self.control.sendFlowR = function () {
            self.control.flowRate(self.control.displayflowRate() + (self.control.baseFlowRate() - 100));
            self.control.checkFlowSliderValue();
            self.control.sendCustomCommand({ command: "M221 S" + self.control.flowRate() });

            if (self.settings.defaultLastFlowR()) {
                self.settings.settings.plugins.marlinslider.lastSentFlowR(self.control.flowRate());
                self.settings.saveData();
                self.updateSettings();
            }
        };

        self.control.lockFanInput = function () {
            self.settings.settings.plugins.marlinslider.lockfan(!self.settings.settings.plugins.marlinslider.lockfan());
            self.settings.saveData();
            self.updateSettings();
            var options = {
                type: "info",
                hide: true,
                delay: 1000*30,
                text: gettext('CAUTION!! Fan speed commands are now being ignored! \n This includes commands sent via gcode and the terminal!'),
                addclass:  'fan_speed_notice_fanlocked',
            }
            if (self.settings.lockfan() && $(".fan_speed_notice_fanlocked").length <1) {
                self.showNotify(self, options);
            }
        }

        //disables the on/off buttons if the lock is enabled
        self.control.islocked = ko.pureComputed(function () {
            return self.settings.settings.plugins.marlinslider.lockfan();
        });

        self.control.feedDowndone = ko.pureComputed(function () {
            return ( self.control.baseFeedRate() < 101 ) || ( self.control.displayfeedRate() > 100 );
        });

        self.control.feedUpdone = ko.pureComputed(function () {
            return ( ( self.control.baseFeedRate() + 100 ) >= self.settings.maxFeedR() ) || ( self.control.displayfeedRate() < 100 );
        });

        self.control.flowDowndone = ko.pureComputed(function () {
            return ( self.control.baseFlowRate() < 101 ) || ( self.control.displayflowRate() > 100 );
        });

        self.control.flowUpdone = ko.pureComputed(function () {
            return ( ( self.control.baseFlowRate() + 100 ) >= self.settings.maxFlowR() ) || ( self.control.displayflowRate() < 100 );
        });

        self.control.displayFeedUp = function () {
            var hold = self.control.displayfeedRate() + (self.control.baseFeedRate() - 100);
            self.control.baseFeedRate( self.control.baseFeedRate() + 100 );
            self.control.displayfeedRate( hold - (self.control.baseFeedRate() - 100))
        }
        
        self.control.displayFeedDown = function () {
            var hold = self.control.displayfeedRate() + (self.control.baseFeedRate() - 100);
            self.control.baseFeedRate( self.control.baseFeedRate() - 100 );
            self.control.displayfeedRate( hold - (self.control.baseFeedRate() - 100))
        }
        
        self.control.displayFlowUp = function () {
            var hold = self.control.displayflowRate() + (self.control.baseFlowRate() - 100);
            self.control.baseFlowRate( self.control.baseFlowRate() + 100 );
            self.control.displayflowRate( hold - (self.control.baseFlowRate() - 100))
        }
        
        self.control.displayFlowDown = function () {
            var hold = self.control.displayflowRate() + (self.control.baseFlowRate() - 100);
            self.control.baseFlowRate( self.control.baseFlowRate() - 100 );
            self.control.displayflowRate( hold - (self.control.baseFlowRate() - 100))
        }

        try {
            // find the old stuff
            $("#control-jog-extrusion").find("button").eq(0).attr("id", "ms-extrude");
            $("#control-jog-extrusion").find("button").eq(1).attr("id", "ms-retract");
            $("#control-jog-extrusion").find("button").eq(2).attr("id", "ms-tool");
            $("#control-jog-extrusion").find("button").eq(3).attr("id", "ms-info");
            $("#control-jog-general").find("button").eq(0).attr("id", "motors-off");
            $("#control-jog-general").find("button").eq(1).attr("id", "fan-on");
            $("#control-jog-general").find("button").eq(2).attr("id", "fan-off");
            // and replace it
            if ($("#touch body").length == 0) {
                $('#ms-tool').replaceWith("\
                    <button class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" \
                    data-bind=\"enable: isOperational() && !isPrinting() && !isPaused()\" id=\"ms-tool\">&nbsp;Tool&nbsp;\
                    <span data-bind=\"text: toolNum()\"></span>&nbsp;&nbsp;<span class=\"caret\"></span></button>\
                ");
                $('#control-jog-extrusion .text-info').remove();
                //remove original fan on/off buttons
                $("#fan-on").remove();
                $("#fan-off").remove();
                $("#control-jog-feedrate.jog-panel").remove();
                $("#control-jog-flowrate").remove();

                $("#control-jog-general").find("button").eq(0).before("\
                    <input type=\"number\" style=\"width: 95px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
                    <button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(),\
                    click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
                    <div class=\"btn-group\">\
                        <button class=\"btn\" id=\"fan-off\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: \
                        function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("Fan off") + "</button>\
                        <button class=\"btn\" id=\"fan-lock\" data-bind=\"enable: isOperational() && loginState.isUser(), click: \
                        function() { $root.lockFanInput() }, attr: { title: lockTitle } \">\
                            <i class=\"fa fa-unlock\" data-bind=\"css: {'fa-lock': islocked(), 'fa-unlock': !islocked()}\"></i></button>\
                    </div>\
                ");

                $("#control-jog-custom").before("\
                    <div id=\"control-feedrate-custom\" class=\"jog-panel\" data-bind=\"visible: loginState.hasPermissionKo(access.permissions.CONTROL)\">\
                    <div id=\"FeedDownFeedSliderFeedUp\" style=\"display: inline-block;\">\
                        <span align=\"center\"><span data-bind=\"text: baseFeedRate()\"></span></span><br>\
                        <button class=\"btn\" id=\"feeddown\" data-bind=\"enable: isOperational() && loginState.isUser() && !feedDowndone(),\
                            click: function() { $root.displayFeedDown() } \"><i class=\"fas fa-arrow-down\"></i></button>\
                        <input type=\"number\" style=\"width: 150px\" data-bind=\"slider: {min: 0, max: 200, step: 1, value: displayfeedRate, tooltip: 'hide'}\">\
                        <button class=\"btn\" id=\"feedup\" data-bind=\"enable: isOperational() && loginState.isUser() && !feedUpdone(),\
                            click: function() { $root.displayFeedUp() } \"><i class=\"fas fa-arrow-up\"></i></button>\
                        </div><br><div id=\"FeedSendFeedCheck\" class=\"btn-group\">\
                        <button class=\"btn\" id=\"feedcheck\" data-bind=\"enable: isOperational() && loginState.isUser(), click: \
                        function() { $root.sendCustomCommand({ type: 'command', commands: ['M220'] }) }, attr: { title: feedCheckTitle } \">\
                            <i class=\"fas fa-check\"></i></button>\
                        <button class=\"btn\" id=\"feed-set\" style=\"width: 80%\" data-bind=\"enable: isOperational() && \
                        loginState.isUser(), click: function() { $root.sendFeedR() }\">" + gettext("Feedrate") + ":\
                        <span data-bind=\"text: (displayfeedRate() + (baseFeedRate() - 100)) + '%'\">\
                        </span></button>\
                        </div>\
                    </div>\
                    <div id=\"control-flowrate-custom\" class=\"jog-panel\" data-bind=\"visible: loginState.hasPermissionKo(access.permissions.CONTROL)\">\
                    <div id=\"FlowDownFlowSliderFlowUp\" style=\"vertical-align: top; display: inline-block;\">\
                        <span align=\"center\"><span data-bind=\"text: baseFlowRate()\"></span></span><br>\
                        <button class=\"btn\" id=\"flowdown\" data-bind=\"enable: isOperational() && loginState.isUser() && !flowDowndone(),\
                            click: function() { $root.displayFlowDown() } \"><i class=\"fas fa-arrow-down\"></i></button>\
                        <input type=\"number\" style=\"width: 150px\" data-bind=\"slider: {min: 0, max: 200, step: 1, value: displayflowRate, tooltip: 'hide'}\">\
                        <button class=\"btn\" id=\"flowup\" data-bind=\"enable: isOperational() && loginState.isUser() && !flowUpdone(),\
                            click: function() { $root.displayFlowUp() } \"><i class=\"fas fa-arrow-up\"></i></button>\
                        </div><br><div id=\"FlowSendFlowCheck\" class=\"btn-group\">\
                        <button class=\"btn\" id=\"flowcheck\" data-bind=\"enable: isOperational() && loginState.isUser(), click: \
                        function() { $root.sendCustomCommand({ type: 'command', commands: ['M221'] }) }, attr: { title: flowCheckTitle } \">\
                            <i class=\"fas fa-check\"></i></button>\
                        <button class=\"btn\" id=\"flow-set\" style=\"width: 80%\" data-bind=\"enable: isOperational() && \
                        loginState.isUser(), click: function() { $root.sendFlowR() }\">" + gettext("Flowrate") + ":\
                        <span data-bind=\"text: (displayflowRate() + (baseFlowRate() - 100)) + '%'\">\
                        </span></button>\
                        </div>\
                    </div>\
                  </div>\
                ");
            }
        }

        catch (error) {
            console.log(error);
        }

        self.updateSettings = function () {
            var flagged = false;
            if (self.settings.settings.plugins.marlinslider.minSpeed() < 0) {
                flagged = true;
                self.settings.settings.plugins.marlinslider.minSpeed(0);
            }
            if (self.settings.settings.plugins.marlinslider.maxSpeed() > 100) {
                flagged = true;
                self.settings.settings.plugins.marlinslider.maxSpeed(100);
            }
            if (self.settings.settings.plugins.marlinslider.minFeedR() < 1) {
                flagged = true;
                self.settings.settings.plugins.marlinslider.minFeedR(1);
            }
            if (self.settings.settings.plugins.marlinslider.maxFeedR() > 999) {
                flagged = true;
                self.settings.settings.plugins.marlinslider.maxFeedR(999);
            }
            if (self.settings.settings.plugins.marlinslider.minFlowR() < 0) {
                flagged = true;
                self.settings.settings.plugins.marlinslider.minFlowR(0);
            }
            if (self.settings.settings.plugins.marlinslider.maxFlowR() > 999) {
                flagged = true;
                self.settings.settings.plugins.marlinslider.maxFlowR(999);
            }
            if (flagged) {
                var options = {
                    type: "info",
                    hide: true,
                    delay: 1000*10,
                    text: gettext('CAUTION!! Hard limits exceeded!\nValues have been modified!\nVerify settings again!'),
                    addclass:  '.hard_limits_fault',
                }
                self.showNotify(self, options);
            }
            try {
                self.settings.minFanSpeed(parseInt(self.settings.settings.plugins.marlinslider.minSpeed()));
                self.settings.maxFanSpeed(parseInt(self.settings.settings.plugins.marlinslider.maxSpeed()));
                self.settings.minFeedR(parseInt(self.settings.settings.plugins.marlinslider.minFeedR()));
                self.settings.maxFeedR(parseInt(self.settings.settings.plugins.marlinslider.maxFeedR()));
                self.settings.minFlowR(parseInt(self.settings.settings.plugins.marlinslider.minFlowR()));
                self.settings.maxFlowR(parseInt(self.settings.settings.plugins.marlinslider.maxFlowR()));
                self.settings.notifyDelay(parseInt(self.settings.settings.plugins.marlinslider.notifyDelay()));
                self.settings.lockfan(self.settings.settings.plugins.marlinslider.lockfan());

                if (self.settings.lockfan()) {
                    self.control.lockTitle( gettext("Lock or unlock the cooling fan controls. When locked,\nno cooling fan commands will be sent to the printer.\n\nFan controls are locked!"));
                }
                else if (!self.settings.lockfan()) {
                    self.control.lockTitle( gettext("Lock or unlock the cooling fan controls. When locked,\nno cooling fan commands will be sent to the printer.\n\nFan controls are unlocked."))
                }
                self.settings.defaultLastSpeed(parseInt(self.settings.settings.plugins.marlinslider.defaultLastSpeed()));
                self.settings.defaultLastFeedR(parseInt(self.settings.settings.plugins.marlinslider.defaultLastFeedR()));
                self.settings.defaultLastFlowR(parseInt(self.settings.settings.plugins.marlinslider.defaultLastFlowR()));
            }
            catch (error) {
                console.log(error);
            }
        }

        self.onDataUpdaterPluginMessage = function(plugin, data) {
            if (plugin != "marlinslider") {
                return;
            }

            // handle fan
            if(data.hasOwnProperty('fanPwm')){
                // M106 or M107 or M145
                // Nothing for M710 controller fans or M123 tachometers
                // alert("EEA@O S" + data.fanPwm + "\nP" + data.fanP + " I" + data.fanI + " T" + data.fanT + "\nP" + data.fanIndex + " I" + data.fanPreset + " T" + data.fanSecnd );
                // It's an M107 with no P or it's an M106 with or w/o S - or - a M145
                if ((data.fanP+data.fanI+data.fanT) <= -3) {
                    if (data.fanI == -10) {
                        // Only from M145!!! Just save the preset
                        self.control.matlBlock[data.fanPreset] = data.fanPwm;
                        // alert("Fan material Block\n" + self.control.matlBlock);
                    }
                    else {
                        // Just M106 to current fan
                        self.control.fanSpeed(parseInt(data.fanPwm / 255 * 100));
                        self.settings.defaultFanSpeed(parseInt(data.fanPwm / 255 * 100));
                        self.settings.lastSentSpeed(parseInt(data.fanPwm / 255 * 100));
                    }
                }
                else {
                    // now for the 'fun'...
                    // M106 with I 0-9 (supercedes any S or T word sent)
                    if (data.fanI > 0) {
                        new_fanPwm = self.control.matlBlock[data.fanPreset];
                        if (new_fanPwm < 0) {
                            var options = {
                               type: "info",
                               hide: true,
                               text: gettext('FAULT!! Use of Fan I word on uninitialized material!'),
                               addclass:  'fan_construct_fault',
                            }
                            self.showNotify(self, options);
                        }
                        // I with popup on S P T alert - P Are we sure??
                        if ((data.fanP > 0) || (data.fanT > 0) || (data.fanPwm >= 0)) {
                            var options = {
                               type: "info",
                               hide: true,
                               text: gettext('CAUTION!! Use of I word invalidates S P or T words!'),
                               addclass:  'fan_construct_fault',
                            }
                            self.showNotify(self, options);
                        }
                        else {
                            // So make current fan that preset
                            self.control.fanSpeed(parseInt(new_fanPwm / 255 * 100));
                            self.settings.defaultFanSpeed(parseInt(new_fanPwm / 255 * 100));
                            self.settings.lastSentSpeed(parseInt(new_fanPwm / 255 * 100));
                        }
                    }
                    // M106 with T must have a P 0-7
                    if (data.fanT > 0) {
                        // check P no S
                        if ((data.fanP < 0) || (data.fanI > 0)) {
                            var options = {
                               type: "info",
                               hide: true,
                               text: gettext('CAUTION!! Use of T word requires P word and is invalidated by I words!'),
                               addclass:  'fan_construct_fault',
                            }
                            self.showNotify(self, options);
                        }
                        else {
                            // M106 with P 0-7 and T[1,2,3-255]
                            if (data.fanSecnd > 2) { self.control.fan2Block[data.fanIndex] = data.fanSecnd; }
                            else {
                                if (data.fanSecnd == 2) {
                                    new_fanPwm = self.control.fan2Block[data.fanIndex];
                                }
                                else {
                                    new_fanPwm = self.control.fanBlock[data.fanIndex]; }
                                self.control.fanSpeed(parseInt(new_fanPwm / 255 * 100));
                                self.settings.defaultFanSpeed(parseInt(new_fanPwm / 255 * 100));
                                self.settings.lastSentSpeed(parseInt(new_fanPwm / 255 * 100));
                            }
                        }
                    }
                    else {
                        // All that's left is a M106 P S
                        if (data.fanI < 0) {
                            if (data.fanPwm < 0) {
                                // Mo S - max the fan
                                new_fanPwm = 255;
                            }
                            else {
                                new_fanPwm = data.fanPwm;
                                self.control.fanBlock[data.fanIndex] = new_fanPwm;
                            }
                        }
                        self.control.fanSpeed(parseInt(new_fanPwm / 255 * 100));
                        self.settings.defaultFanSpeed(parseInt(new_fanPwm / 255 * 100));
                        self.settings.lastSentSpeed(parseInt(new_fanPwm / 255 * 100));
                    }
                }
            }

            // handle feed
            if(data.hasOwnProperty('feedNum')){
                // first get whether a Backup or Restore is happening
                // B 'always' saves the old feedrate
                if (data.feedB > 0) { self.control.feedBackup(self.control.feedRate()); }
                // R restores the backup or the S supplied
                if (data.feedR > 0) { self.control.feedRate(self.control.feedBackup()); }
                // For tracking feedNum set to -1 if NO S-word
                if (data.feedNum > 0) { self.control.feedRate(data.feedNum); }
                self.control.baseFeedRate(parseInt(self.control.feedRate() / 100) * 100);
                if (self.control.baseFeedRate() < 100) { self.control.baseFeedRate(100); }
                self.control.displayfeedRate(self.control.feedRate() - (self.control.baseFeedRate() - 100));
                self.settings.defaultFeedR(self.control.feedRate());
                self.settings.lastSentFeedR(self.control.feedRate());
            }

            // handle flow
            if(data.hasOwnProperty('flowNum')){
                //alert("Tool "+self.control.lastSentTool);
                if (self.control.lastSentTool < 0) {
                    // we don't know which tool is active MUST use "N221" in connect script?
                    self.control.lastSentTool = data.toolRef;
                    self.control.toolNum(data.toolRef);
                }
                if (data.toolR > 0) {
                    //use the toolRef as pointer into self.control.toolBlock array
                    self.control.toolBlock[parseInt(data.toolRef)] == data.flowNum;
                }
                if (self.control.lastSentTool == parseInt(data.toolRef)) {
                    self.control.flowRate(data.flowNum);
                    self.control.baseFlowRate(parseInt(data.flowNum / 100) * 100);
                    if (self.control.baseFlowRate() < 100) { self.control.baseFlowRate(100); }
                    self.control.displayflowRate(data.flowNum - (self.control.baseFlowRate() - 100));
                    self.settings.defaultFlowR(data.flowNum);
                    self.settings.lastSentFlowR(data.flowNum);
                    self.control.toolBlock[self.control.lastSentTool] = data.flowNum;
                }
            }

            // handle tool change
            if(data.hasOwnProperty('toolNum')){
                self.control.toolNum(data.toolNum);
                if (self.control.lastSentTool != self.control.toolNum()) {
                    self.control.flowRate(self.control.toolBlock[data.toolNum]);
                    self.control.baseFlowRate(parseInt(self.control.toolBlock[data.toolNum] / 100) * 100);
                    if (self.control.baseFlowRate() < 100) { self.control.baseFlowRate(100); }
                    self.control.displayflowRate(self.control.toolBlock[data.toolNum] - (self.control.baseFlowRate() - 100));
                    self.settings.defaultFlowR(self.control.toolBlock[data.toolNum]);
                    self.settings.lastSentFlowR(self.control.toolBlock[data.toolNum]);
                }
                self.control.lastSentTool = data.toolNum;
            }
        }

        self.onBeforeBinding = function () {
            self.settings.defaultFanSpeed(parseInt(self.settings.settings.plugins.marlinslider.defaultFanSpeed()));
            self.settings.lastSentSpeed(parseInt(self.settings.settings.plugins.marlinslider.lastSentSpeed()));
            self.settings.defaultFeedR(self.settings.settings.plugins.marlinslider.defaultFeedR());
            self.settings.lastSentFeedR(self.settings.settings.plugins.marlinslider.lastSentFeedR());
            self.settings.defaultFlowR(self.settings.settings.plugins.marlinslider.defaultFlowR());
            self.settings.lastSentFlowR(self.settings.settings.plugins.marlinslider.lastSentFlowR());
            self.updateSettings();
            //if the default fan speed is above or below max/min then set to either max or min
            if (self.settings.defaultFanSpeed() < self.settings.minFanSpeed()) {
                self.control.fanSpeed(self.settings.minFanSpeed());
            }
            else if (self.settings.defaultFanSpeed() > self.settings.maxFanSpeed()) {
                self.control.fanSpeed(self.settings.maxFanSpeed());
            }
            else if (self.settings.defaultLastSpeed()) {
                self.control.fanSpeed(self.settings.lastSentSpeed());
            }
            else {
                self.control.fanSpeed(self.settings.defaultFanSpeed());
            }
            //if the default feedrate is above or below max/min then set to either max or min
            if (self.settings.defaultFeedR() < self.settings.minFeedR()) {
                self.control.feedRate(self.settings.minFeedR());
            }
            else if (self.settings.defaultFeedR() > self.settings.maxFeedR()) {
                self.control.feedRate(self.settings.maxFeedR());
            }
            else if (self.settings.defaultLastSpeed()) {
                self.control.feedRate(self.settings.lastSentFeedR());
            }
            else {
                self.control.feedRate(self.settings.defaultFeedR());
            }
            //if the default flowrate is above or below max/min then set to either max or min
            if (self.settings.defaultFlowR() < self.settings.minFlowR()) {
                self.control.flowRate(self.settings.minFlowR());
            }
            else if (self.settings.defaultFlowR() > self.settings.maxFlowR()) {
                self.control.flowRate(self.settings.maxFlowR());
            }
            else if (self.settings.defaultLastFlowR()) {
                self.control.flowRate(self.settings.lastSentFlowR());
            }
            else {
                self.control.flowRate(self.settings.defaultFlowR());
            }
        }

        //update settings in case user changes them, otherwise a refresh of the UI is required
        self.onSettingsHidden = function () {
            self.updateSettings();
        }
    }
    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: MarlinSliderPluginViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [
            "settingsViewModel", "controlViewModel", "loginStateViewModel"
        ],
        optional: [],
        // Elements to bind to, e.g. #settings_plugin_marlinslider, #tab_plugin_marlinslider, ...
        elements: []
    });
});
