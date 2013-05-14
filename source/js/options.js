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
function save() {
	console.log("saving");
	var settings = $("input");
	for (var i = 0; i < settings.length; i++) {
		var value;
		var si = $(settings[i]);
		if (si.prop("type") == "checkbox") {
			value = si.is(':checked');
		} else {
			value = si.val();
		}
		localStorage[si.attr("id")] = value;
		console.log( si.attr("id") + " = " + value );
	}

	$("#status").text("Settings saved.");
	$("#status").fadeOut(750);
}

function restore() {
	console.log("restoring");
	var settings = $("input");
	for (var i = 0; i < settings.length; i++) {
		var si = $(settings[i]);
		var value = localStorage[si.attr("id")]
		if (value != undefined) {
			if (si.prop("type") == "checkbox") {
				si.prop("checked", (value == "true") );
			} else {
				si.val(value);
			}
			console.log( si.attr("id") + " = " + value );
		}
	}
}
$( function() {
	$('#save').click(save);
	restore();
});
