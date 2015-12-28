var timings1 = {days: [{start: 10, end: 11.25, day: "M"}], course: "CSC209", section: "Section A", type: "LECT"};

function click1() {
	var fallDiv = document.getElementById("fall-cal");
	var allRows = fallDiv.childNodes[1].childNodes;
	for (var i = 0; i < timings1.days.length; i++) {
		var startIndex = (timings1.days[i].start - 8) * 4;
		var endIndex = (timings1.days[i].end - 8) * 4;
		var diff = endIndex - startIndex;
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
		for (var ii = 0; ii < diff; ii++) {
			console.log(startIndex);
			console.log(allRows);
			console.log(allRows.childNodes);
			allRows.childNodes[startIndex].childNodes[dayIndex].setAttribute("class", "selected");
		}
	}
}

window.onload = function() {
	click1();
}