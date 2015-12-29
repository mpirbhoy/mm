var timings1 = {days: [{start: 10.75, end: 11.25, day: "F"}], course: "CSC209", section: "Section A", type: "LECT"};

function click1() {
	var fallDiv = document.getElementById("fall-cal");
	var allRows = fallDiv.getElementsByTagName('tr');
	for (var i = 0; i < timings1.days.length; i++) {
		var startIndex = (timings1.days[i].start - 8) * 4 + 1;
		var endIndex = (timings1.days[i].end - 8) * 4 + 1;
		var diff = endIndex - startIndex + 1;
		var dayIndex;
		switch(timings1.days[i].day) {
			case 'M':
				dayIndex = 1;
				break;
			case 'T':
				dayIndex = 2;
				break;
			case 'W':
				dayIndex = 3;
				break;
			case 'R':
				dayIndex = 4;
				break;
			case 'F':
				dayIndex = 5;
				break;
		}
		var posJSON = [];
		for (var ii = 0; ii < diff; ii++) {
			console.log("startIndex: " + startIndex + ii);
			console.log("dayIndex: " + dayIndex + 1);
			var currCell = allRows[startIndex + ii].getElementsByTagName("td");
			currCell[dayIndex].setAttribute("class", "selected");

		}
/*
		//Create Div for overlay here
		var newDiv = document.createElement("div");
		newDiv.setAttribute("class", "overlayDiv");
		var newText = document.createTextNode("Hello World");
		newDiv.appendChild(newText);
		var fallOverlayDiv = document.getElementById("fall-overlay");
		//fallOverlayDiv.appendChild(newDiv);
		*/
	}
}

window.onload = function() {
	click1();
}