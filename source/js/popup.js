/*
Chrome VLC Remote
	Copyright (C) 2013  William Pickering

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var length = "";
var fullscreen;

var playlistTimeout;
var updateTimeout;

// Thankyou, stackoverflow
function Timeout(fn, interval) {
	var id = setTimeout(fn, interval);
	setTimeout(function() { this.cleared = true; }, interval);	//hopefully this will clear us after it's been executed
	this.cleared = false;
	this.clear = function () {
		this.cleared = true;
		clearTimeout(id);
	};
}

//format_time - takes time in seconds, returns hh:mm:ss
function format_time(s) {
	var hours = Math.floor(s / 3600);
	var minutes = Math.floor((s / 60) % 60);
	var seconds = Math.floor(s % 60);
	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;
	return hours + ":" + minutes + ":" + seconds;
}

function setTimeouts() {
	//Sometimes status & playlist don't seem to be updated immediately.
	//wait 150ms before refreshing status & playlist to give VLC time to update internally.
	if (updateTimeout.cleared) {
		updateTimeout = new Timeout(refreshStatus, 150);
	}
	if (playlistTimeout.cleared) {
		playlistTimeout = new Timeout(refreshPlaylist, 150);
	}
}

function clearTimeouts() {
	playlistTimeout.clear();
	updateTimeout.clear();
}

function execCmd(cmd){
	console.log("execCmd " + cmd);
	clearTimeouts();
	// chrome.extension.sendMessage(
		// cmd,
		// function(response){
			// setTimeouts();
		// }
	// );
	$.ajax({
	url:		"http://" + localStorage["server"] + ":" + localStorage["port"] + "/requests/status.json?command="+cmd,
	dataType:	"json",
	complete:	function(data, status, jqXHR) {
					setTimeouts();
				}
	});

}


function playID(id){
	console.log("Playing "+id);
	execCmd("pl_play&id="+id);
}
function setVolume(volume) {
	console.log("volume "+volume);
	execCmd("volume&val="+volume);
}
function skip(s) {
	console.log("skip "+s);
	execCmd("seek&val="+s);
}
function seek(t){
	t = Math.floor(t*length)
	console.log("seek "+t);
	skip(t);
}
function setFullscreen(fs) {
	console.log("fullscreen "+fs);
	execCmd("fullscreen&val="+fs);
}
function toggleFullscreen() {
	setFullscreen(fullscreen == false);
}
function setAudioDelay(delay) {
	console.log("audio delay "+delay);
	execCmd("audiodelay&val="+delay);
}
function changeAudioDelay(delay) {
	setAudioDelay((parseFloat($("#audioDelay").val())+parseFloat(delay)).toString())
}
function setAR(ar){
	console.log("setAR "+ar);
	execCmd("aspectratio&val="+ar);
}
function enqueue(f){
	console.log("enqueue " + f);
	execCmd("in_enqueue&input="+f);
}
function enableEq(s) {
	console.log("enableEq "+s);
	execCmd("enableeq&val="+(s ? 1 : 0));
}
function changeEq(b, v) {
	console.log("changeEq "+b+" "+v);
	execCmd("equalizer&band="+b+"&val="+v);
}
function setEqPreset(id) {
	console.log("setEqPreset "+id);
	execCmd("setpreset&val="+id);
}
function setPreamp(p) {
	console.log("setPreamp "+p);
	execCmd("preamp&val="+p);
}



function refreshStatus(){
	console.log("refreshStatus");
	$.ajax({
		url:		"http://" + localStorage["server"] + ":" + localStorage["port"] + "/requests/status.json",
		dataType:	"json",
		success:	function (data, status, jqXHR) {
						processStatus(data);
					},
		complete:	function(jqXHR, textStatus) { updateTimeout = new Timeout(refreshStatus, 1000); }
	});
}
function processStatus(data) {
	console.log("processStatus");
	var a = ["volume", "position", "audiodelay", "aspectratio"];
	for (var i in a){
		$("#"+a[i]).val(data[a[i]]);
	}
	a = ["time", "length"];
	for (var i in a){
		$("#"+a[i]).text(format_time(data[a[i]]));
	}
	if (data.information) {	//handle case when stopped
		$("#file").text(data.information.category.meta.filename);
	}
	if (data.equalizer.preamp) {
		$("#preamp").val(data.equalizer.preamp);
	}

	var eq = false;
	for (i in data.audiofilters) {
		if (data.audiofilters[i] == "equalizer") {
			eq = true;
		}
	}
	if (eq) {
		$("#eq").fadeIn();
		$("#equalizer").prop("checked", true);
	} else {
		$("#eq").fadeOut();
		$("#equalizer").prop("checked", false);
	}


	if (data.equalizer.bands) {
		for (var i in data.equalizer.bands) {
			var j = i.split("\"")[1];
			$("#eq"+j).val(data.equalizer.bands[i]);
			
		}
	}
	//$("#time").text(format_time(data.time));
	length = data.length;
	//$("#length").text(format_time(length));
	fullscreen = data.fullscreen;
}

function refreshPlaylist() {
	console.log("refreshPlaylist");
	$.ajax(
		{
		url:		"http://" + localStorage["server"] + ":" + localStorage["port"] + "/requests/playlist.json",
		dataType:	"json",
		success:	function (data, status, jqXHR) {
						processPlaylist(data);
					},
		complete:	function(jqXHR, textStatus) { playlistTimeout = new Timeout(refreshPlaylist, 10000); }
		}
	);
}
function processPlaylist(data) {
	console.log("processplaylist");
	$("#playlistitems").empty();
	var p = data.children[0].children;
	for (var i = 0; i < p.length; i++){
		var li = $(document.createElement("li"));
		var fn = p[i].uri.split("/"); fn = fn[fn.length-1];
		for (var j in p[i]) {
			li.attr(j, p[i][j]);
		}
		li.text(unescape(fn));
		if (p[i].current == "current") {
			li.addClass("current");
		}
		$("#playlistitems").append(li);
	}
	$("#playlistitems li").click(
		function(event) {
			event.stopPropagation();
			clearTimeouts();
			playID($(this).attr("id"));
		}
	);
}




function loadDir(dir){
	console.log("loadDir "+dir);
	$.ajax({
		url:		"http://" + localStorage["server"] + ":" + localStorage["port"] + "/requests/browse.json?dir="+dir,
		dataType:	"json",
		success:	processDir("d"+dir),
	});
}

var processDir = function(dir){
	return function(data, status, jqXHR){
		var dirr = dir.replace(/([ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
		var ul = $(document.createElement("ul")).attr("id", dir);
		if (dir == "d"+localStorage["fbStartDir"]) {
			$("#files").append(ul);
		} else {
			$("#"+dirr).append(ul);
		}
		for (var i in data.element) {
			j = data.element[i];	//shorthand
			if (i > 0) {
				var li = $(document.createElement("li"))
				.text(j.name)
				.attr("id", "d"+j.path)
				.on("click", function(event) {
								event.stopPropagation();
								var t = $(this);	//effeciency
								if ( t.hasClass("folder-open") ) {
									t.children("ul").remove();
									t.toggleClass("folder-closed");
									t.toggleClass("folder-open");
								} else if ( t.hasClass("file-audio") || t.hasClass("file-video") ) {
									//do nothing
								} else {
									loadDir(t.attr("path"));
									t.toggleClass("folder-closed");
									t.toggleClass("folder-open");
								}
							}
				)
				.on("dblclick", function(event) {
									event.stopPropagation();
									var t = $(this);	//effeciency
									if ( t.hasClass("file-audio") || t.hasClass("file-video") ) {
										enqueue(t.attr("uri"));
									}
								}
				);

				//li.attr("json", JSON.stringify(j));
				for (var k in j) {
					li.attr(k, j[k]);
				}

				var ext = j.path.split("."); ext = ext[ext.length-1].toLowerCase();
				if (j.type == "dir") {
					li.addClass("folder-closed");
				} else if ( ["mp3", "3ga", "aac", "aif", "ape", "fla", "flac", "m4b"].indexOf(ext) != -1) {
					li.addClass("file-audio");
				} else if ( ["mkv", "avi", "mp4", "mov", "mpg"].indexOf(ext) != -1 ) {
					li.addClass("file-video");
				}
				$("ul#"+dirr).append(li);
			}
		}
	};
}



//pl_empty
//pl_loop
//pl_repeat
//pl_random
//pl_delete&id=<id>			-Officially unsupported, but may be useful

//pl_sort&id=<id>&val=<val>
//0 Id
//1 Name
//3 Author
//5 Random
//7 Track number

//command=preamp&val=<val in dB>
//sets the preamp value, must be: -20 => val <= 20

//command=equalizer&band=<band>&val=<gain in dB>)
//set the gain for a specific band, gain must be: -20 <= val <= 20
//Bands 0: 60 Hz, 1: 170 Hz, 2: 310 Hz, 3: 600 Hz, 4: 1 kHz, 5: 3 kHz, 6: 6 kHz, 7: 12 kHz , 8: 14 kHz , 9: 16 kHz



//When the DOM is ready
$(function() {
	$("#previous")			.on("click",	function(event){ event.stopPropagation(); execCmd("pl_previous");		});
	$("#m1m")				.on("click",	function(event){ event.stopPropagation(); skip("-60");					});
	$("#m10s")				.on("click",	function(event){ event.stopPropagation(); skip("-10");					});
	$("#p10s")				.on("click",	function(event){ event.stopPropagation(); skip("+10");					});
	$("#p1m")				.on("click",	function(event){ event.stopPropagation(); skip("+60");					});
	$("#next")				.on("click",	function(event){ event.stopPropagation(); execCmd("pl_next");			});
	$("#voldd")				.on("click",	function(event){ event.stopPropagation(); setVolume("-100");			});
	$("#vold")				.on("click",	function(event){ event.stopPropagation(); setVolume("-10");				});
	$("#volume")			.on("change",	function(event){ event.stopPropagation(); setVolume($(this).val());		});
	$("#volu")				.on("click",	function(event){ event.stopPropagation(); setVolume("+10");				});
	$("#voluu")				.on("click",	function(event){ event.stopPropagation(); setVolume("+100");			});
	$("#play")				.on("click",	function(event){ event.stopPropagation(); execCmd("pl_forceresume");	});
	$("#pause")				.on("click",	function(event){ event.stopPropagation(); execCmd("pl_forcepause");		});
	$("#stop")				.on("click",	function(event){ event.stopPropagation(); execCmd("pl_stop");			});
	$("#fullscreen")		.on("click",	function(event){ event.stopPropagation(); toggleFullscreen();			});
	$("#audioDelayMinus")	.on("click",	function(event){ event.stopPropagation(); changeAudioDelay("-0.01");	});
	$("#audioDelayPlus")	.on("click",	function(event){ event.stopPropagation(); changeAudioDelay("+0.01");	});
	$("#audioDelay")		.on("dblclick",	function(event){ event.stopPropagation(); setAudioDelay("0");			});
	$("#position")			.on("change",	function(event){ event.stopPropagation(); seek($(this).val());			});
	$("#aspectratio")		.on("change",	function(event){ event.stopPropagation(); setAR($(this).val());			});
	$("#equalizer")			.on("change",	function(event){ event.stopPropagation(); $("div#eq").fadeToggle(); enableEq($(this).is(':checked'));	});
	$("#preamp")			.on("change",	function(event){ event.stopPropagation(); setPreamp($(this).val()); $("#eqpreset").val(-1);		});
	$("#eq input[id~=eq]")	.on("change",	function(event){ event.stopPropagation(); changeEq($(this).attr("id").substr(-1), $(this).val()); $("#eqpreset").val(-1);	});
	$("#eqpreset")			.on("change",	function(event){ event.stopPropagation(); if ($(this).val() > -1) { setEqPreset($(this).val()); }	});
	$("#filebrowser span")	.on("click",	function(event){ event.stopPropagation(); $("#filebrowser > #files")	.fadeToggle(); $("#filebrowser span img")	.toggleClass("closed"); $("#filebrowser span img")	.toggleClass("open"); });
	$("#playlist span")		.on("click",	function(event){ event.stopPropagation(); $("#playlist > ul")			.fadeToggle(); $("#playlist span img")		.toggleClass("closed"); $("#playlist span img")		.toggleClass("open"); });
	$("#extras span")		.on("click",	function(event){ event.stopPropagation(); $("#extras > div")			.fadeToggle(); $("#extras span img")		.toggleClass("closed"); $("#extras span img")		.toggleClass("open"); });
	$("img#newtab")			.on("click",	function(event){ event.stopPropagation(); chrome.tabs.create({ url: "browse.html" }); });
	refreshStatus();
	refreshPlaylist();
	loadDir(localStorage["fbStartDir"]);
});

// Tooltip stuff that may or may not end up actually being used
/*
$(function() {
	var el, newPoint, newPlace, offset, transition, output;

	// Select all range inputs, watch for change
	$("input[type='range']").change(function() {

		// Cache this for efficiency
		el = $(this);

		// Measure width of range input
		width = el.width();

		// Figure out placement percentage between left and right of input
		newPoint = (el.val() - el.attr("min")) / (el.attr("max") - el.attr("min"));

		// Prevent bubble from going beyond left or right (unsupported browsers)
		// odd offset to make label line up better
		offset = -1
		
		newPlace = (width * (newPoint)).toFixed(0).toString();
		offset -= (newPoint*6);    //I'm not sure why 6 works, but it do

		// Move bubble
		// store the output element for effeciency
		output = el.siblings("output");
		// store the transition for restoration later
		transition = output.css("transition");
		// with the output element
		output
		// disable transition
		.css("transition", "none")
		// set new css
		.css({
			left: newPlace + "px",
			marginLeft: offset + "%"
		})
		// set the text
		.text(el.val())
		// force a quick repaint before the animation kicks back in
		.hide(0, function(){$(this).show();})
		// re-enable the animation
		.css("transition", transition);        
	})
	// Fake a change to position bubble at page load
	.trigger('change');
});
*/