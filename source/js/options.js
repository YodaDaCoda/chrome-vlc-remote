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
		localStorage[$(settings[i]).attr("id")] = $(settings[i]).val();
		console.log( $(settings[i]).attr("id") );
		console.log( $(settings[i]).val() );
	}

	$("#status").text("Settings saved.");
	$("#status").fadeOut(750);
}

function restore() {
	console.log("restoring");
	var settings = $("input");
	for (var i = 0; i < settings.length; i++) {
		$(settings[i]).val( localStorage[$(settings[i]).attr("id")] );
		console.log( $(settings[i]).attr("id") );
		console.log( localStorage[$(settings[i]).attr("id")] );
	}
}
$( function() {
	$('#save').click(save);
	restore();
});
