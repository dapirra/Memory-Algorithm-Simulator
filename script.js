/*jshint camelcase: true, quotmark: single, undef: false, unused: vars, latedef: nofunc, asi: false, boss: false, laxbreak: false, laxcomma: false, multistr: false, sub: false, supernew: false, browser: true, devel: true, jquery: true, indent: 4*/
// JSHint settings on first line (JSHint is used to find errors in JavaScript)

/*
Memory Manager Simulator
Name: David Pirraglia
Professor: Sister Jane Fritz
Class: COM 310
*/

// Function used to insert values in an array
arrayInsert = function (array, position, value) {
	array.splice(position, 0, value);
};

// Function used to remove values from an array
arrayRemove = function (array, position) {
	array.splice(position, 1);
};

// This function creates a jQueryUI Dialog
createHTMLDialog = function (title, html, okFunc) {
	$('#dialog').remove(); // Remove old dialog if exists

	// Append new dialog code
	$(document.body).append('<div id="dialog">' + html + '</div>');

	// Settings for the dialog
	var defaultDialog = $('#dialog').dialog({
		modal: true,
		title: title,
		buttons: {
			'Ok': function() {
				if (okFunc) okFunc();
				$(this).dialog('close');
			}
		}
	});

	// When the background is clicked, the dialog is closed
	$('body > div.ui-widget-overlay.ui-front').click(function (event) {
		if (okFunc) okFunc();
		defaultDialog.dialog('close');
	});
};

createHTMLErrorDialog = function (html) {
	$('#dialog').remove(); // Remove old dialog if exists

	// Append new dialog code
	$(document.body).append('<div id="dialog">' + html + '</div>');

	// Settings for the dialog
	var defaultDialog = $('#dialog').dialog({
		modal: true,
		title: 'Error',
		resizeable: false,
		buttons: {
			'Ok': function() {
				$(this).dialog('close');
			}
		}
	});

	// When the background is clicked, the dialog is closed
	$('body > div.ui-widget-overlay.ui-front').click(function (event) {
		defaultDialog.dialog('close');
	});
};

createHTMLConfirmDialog = function(title, html, yesFunc, noFunc) {
	$('#dialog').remove(); // Remove old dialog if exists

	// Append new dialog code
	$(document.body).append('<div id="dialog">' + html + '</div>');

	// Settings for the dialog
	var defaultDialog = $('#dialog').dialog({
		modal: true,
		title: title,
		resizeable: false,
		buttons: {
			'Yes': function () {
				if (yesFunc) yesFunc();
				$(this).dialog('close');
			},
			'No': function () {
				if (noFunc) noFunc();
				$(this).dialog('close');
			}
		}
	});

	// When the background is clicked, the dialog is closed
	$('body > div.ui-widget-overlay.ui-front').click(function (event) {
		if (noFunc) noFunc();
		defaultDialog.dialog('close');
	});
};

var chartColors = [
	'rgb(255, 99, 132)', // Red
	'rgb(255, 159, 64)', // Orange
	'rgb(255, 205, 86)', // Yellow
	'rgb(75, 192, 192)', // Green
	'rgb(54, 162, 235)', // Blue
	'rgb(153, 102, 255)' // Purple
];

var freeMemoryColor = '#ddd';
var freeSpaceLabel = 'Free Space';

// GUI object used for controling the user interface
var GUI = {
	itemsInMemory: 1,
	randomProcessCounter: 0,
	selectedAlgorithm: 0, // 0 = First Fit, 1 = Best Fit, 2 = Worst Fit
	totalMemory: 4096,
	numberOfProcessesCreated: 0,
	memoryValues: [400, 4096 - 400],
	memoryLabels: ['OS', freeSpaceLabel],
	memoryColors: [chartColors[4], freeMemoryColor],
	waitingQueue: []
};

// Uses a basic algorithm to determine which color to use
GUI.determineColor = function () {
	return chartColors[(this.memoryValues.length - 1) % chartColors.length];
};

GUI.addProcess = function (pid, processSize, burstTime, addingFromQueue) {
	var index;
	switch (this.selectedAlgorithm) {
		case 0: // First Fit
			index = this.findFirstFit(processSize);
			break;
		case 1: // Best Fit
			index = this.findBestFit(processSize);
			break;
		case 2: // Worst Fit
			index = this.findWorstFit(processSize);
			break;
	}

	if (index) {
		this.insertProcess(index, pid, processSize);
	} else if (addingFromQueue) {
		return false;
	} else {
		createHTMLConfirmDialog('Error: No room left in memory',
			'Would you like to add the process to the waiting queue?',
			function () {
				GUI.waitingQueue.push([pid, processSize, burstTime]);
			});
		return false;
	}

	this.itemsInMemory++;
	memoryChart.update();

	// Automatically remove the process after a certain number of milliseconds
	if (burstTime) {
		setTimeout(function() {
			GUI.removeProcess(pid);
		}, burstTime);
	}

	return true;
};

GUI.removeProcess = function (pid, addFromWaitingQueue) {
	if (addFromWaitingQueue === undefined) addFromWaitingQueue = true;

	for (var i = this.memoryLabels.length - 1; i > 0; i--) {
		if (pid === this.memoryLabels[i]) {
			this.memoryLabels[i] = freeSpaceLabel;
			this.memoryColors[i] = freeMemoryColor;
			this.itemsInMemory--;
			this.mergeFreeSpaces();

			if (addFromWaitingQueue) {
				while (this.waitingQueue.length) {
					var process = this.waitingQueue.shift();
					if (!this.addProcess(process[0], process[1], process[2], true)) {
						this.waitingQueue.unshift(process);
						break;
					}
				}
			}

			memoryChart.update();
			return true;
		}
	}
};

GUI.findFirstFit = function (processSize) {
	var index, len = this.memoryLabels.length;
	for (index = 0; index < len; index++) {
		if (this.memoryLabels[index] === freeSpaceLabel &&
			this.memoryValues[index] >= processSize) {
				return index;
		}
	}
};

GUI.findBestFit = function (processSize) {
	var index, len = this.memoryLabels.length,
		bestIndex, bestSize = this.totalMemory;
	for (index = 0; index < len; index++) {
		if (this.memoryLabels[index] === freeSpaceLabel &&
			this.memoryValues[index] >= processSize &&
			this.memoryValues[index] < bestSize) {
				bestSize = this.memoryValues[index];
				bestIndex = index;
		}
	}
	return bestIndex;
};

GUI.findWorstFit = function (processSize) {
	var index, len = this.memoryLabels.length,
		worstIndex, worstSize = 0;
	for (index = 0; index < len; index++) {
		if (this.memoryLabels[index] === freeSpaceLabel &&
			this.memoryValues[index] >= processSize &&
			this.memoryValues[index] > worstSize) {
				worstSize = this.memoryValues[index];
				worstIndex = index;
		}
	}
	return worstIndex;
};

// Inserts a process at a specific point in memory
GUI.insertProcess = function(position, pid, processSize) {
	arrayInsert(this.memoryValues, position, processSize);
	arrayInsert(this.memoryLabels, position, pid);
	arrayInsert(this.memoryColors, position, this.determineColor());
	var freeSpaceIndex = position + 1;
	if (processSize === this.memoryValues[freeSpaceIndex]) {
		arrayRemove(this.memoryValues, freeSpaceIndex);
		arrayRemove(this.memoryLabels, freeSpaceIndex);
		arrayRemove(this.memoryColors, freeSpaceIndex);
	} else {
		this.memoryValues[freeSpaceIndex] -= processSize;
	}
};

// Counts the total number of holes in memory
GUI.countHoles = function () {
	var i, counter = 0, len = this.memoryLabels.length;
	for (i = 0; i < len; i++) {
		if (this.memoryLabels[i] === freeSpaceLabel) {
			counter++;
		}
	}
	if (this.memoryLabels[len - 1] === freeSpaceLabel) {
		counter--;
	}
	return counter;
};

// Merge any free space items that are next to each other
GUI.mergeFreeSpaces = function () {
	var index, len = this.memoryLabels.length;
	for (index = 0; index < len; index++) {
		if (this.memoryLabels[index] === freeSpaceLabel &&
			this.memoryLabels[index + 1] === freeSpaceLabel) {
				this.memoryValues[index] += this.memoryValues[index + 1];
				arrayRemove(this.memoryValues, index + 1);
				arrayRemove(this.memoryLabels, index + 1);
				arrayRemove(this.memoryColors, index + 1);
				index--;
		}
	}
};

// Calculate the total amount of used memory, counting holes as used memory
GUI.calulateUsedMemory = function () {
	var lastIndex = this.memoryLabels.length - 1;
	if (this.memoryLabels[lastIndex] === freeSpaceLabel) {
		return this.totalMemory - this.memoryValues[lastIndex];
	} else {
		return 0;
	}
};

// Calculate the amount of useable memory at the end
GUI.calulateUseableMemory = function () {
	var lastIndex = this.memoryLabels.length - 1;
	if (this.memoryLabels[lastIndex] === freeSpaceLabel) {
		return this.memoryValues[lastIndex];
	} else {
		return 0;
	}
};

// Calculate the total amount of available memory (All mem in holes)
GUI.calculateAvailableMemory = function () {
	var index, len = this.memoryLabels.length, totalAvailableMem = 0;
	for (index = 0; index < len; index++) {
		if (this.memoryLabels[index] === freeSpaceLabel) {
			totalAvailableMem += this.memoryValues[index];
		}
	}
	return totalAvailableMem;
};

GUI.compact = function () {
	var index, len = this.memoryLabels.length, totalFreeSpace = 0;
	for (index = 0; index < len; index++) {
		if (this.memoryLabels[index] === freeSpaceLabel) {
			totalFreeSpace += this.memoryValues[index];
			arrayRemove(this.memoryValues, index);
			arrayRemove(this.memoryLabels, index);
			arrayRemove(this.memoryColors, index);
		}
	}
	this.memoryValues.push(totalFreeSpace);
	this.memoryLabels.push(freeSpaceLabel);
	this.memoryColors.push(freeMemoryColor);
	memoryChart.update();
};

////////////////////////////////////////////////////////////////////////////////

var chartConfig = {
	type: 'doughnut',
	data: {
		datasets: [{
			data: GUI.memoryValues,
			backgroundColor: GUI.memoryColors,
			label: 'Memory Data' // Check if this parameter is nessesary
		}],
		labels: GUI.memoryLabels
	},
	options: {
		responsive: true,
		legend: {
			display: false
		},
		title: {
			display: false
		},
		animation: {
			animateScale: true,
			animateRotate: true
		}
	}
};

// This function will execute once the page is finished loading
$(function () {
	// Create Chart
	var ctx = $('#memoryChart');
	memoryChart = new Chart(ctx, chartConfig);

	// Create Tabs
	var tabControls = $('#tabs').tabs();

	// Allow the tabs to be scrollable
	$('#tabs').children().first().on('mousewheel', function (event) {
		var selectedTab = tabControls.tabs('option', 'active');
		if (event.deltaY < 0 && selectedTab < 4) {
			tabControls.tabs('option', 'active', ++selectedTab);
		} else if (event.deltaY > 0 && selectedTab > 0) {
			tabControls.tabs('option', 'active', --selectedTab);
		}
	});

	// When typing a process to kill, allow for autocompletion/suggestions
	$('#killID').autocomplete({
		source: GUI.memoryLabels,
		response: function (event, ui) {
			// Filter Free Space and OS from suggestions
			for (var i = ui.content.length - 1; i >= 0; i--) {
				if (ui.content[i].label === freeSpaceLabel ||
					ui.content[i].label === 'OS') {
					arrayRemove(ui.content, i);
				}
			}
		}
	});

	// Initialize all buttons
	var updateTotalMemButton = $('#updateTotalMem').button();
	var updateOSMemButton = $('#updateOSMem').button();
	var createProcessButton = $('#createProcessButton').button();
	var createRandomButton = $('#randomButton').button();
	var killProcessButton = $('#killProcessButton').button();
	var killRandomButton = $('#killRandomButton').button();
	var killAllButton = $('#killAllButton').button();
	var compactButton = $('#compactButton').button();
	var processListButton = $('#processListButton').button();
	var waitingButton = $('#waitingButton').button();
	var recolorButton = $('#recolorButton').button();

	// Events for all buttons

	updateTotalMemButton.click(function (event) {
		event.preventDefault();
		var newTotalMem = Number($('#totalMem').val());
		var usedMemory = GUI.calulateUsedMemory();
		if (newTotalMem < usedMemory) {
			createHTMLErrorDialog('Total memory cannot be less than used memory.');
			$('#totalMem').val(GUI.totalMemory);
		} else if (newTotalMem === GUI.totalMemory) { // Check if the value changed
			return;
		}

		GUI.totalMemory = newTotalMem;
		GUI.memoryValues.pop();
		GUI.memoryValues.push(GUI.totalMemory - usedMemory);
		memoryChart.update();
	});

	updateOSMemButton.click(function (event) {
		event.preventDefault();
		var newOSMem = Number($('#osMem').val());
		if (newOSMem > GUI.totalMemory) {
			createHTMLErrorDialog('OS memory cannot be greater than total memory.');
			$('#osMem').val(GUI.memoryValues[0]); // Restore initial value
			return;
		} else if (newOSMem === GUI.memoryValues[0]) { // Check if the value changed
			return;
		} else if (GUI.memoryLabels.length !== 2) {
			createHTMLErrorDialog('OS size cannot be changed while there are processes in memory.');
			return;
		}

		GUI.memoryValues[0] = newOSMem;
		GUI.memoryValues[1] = GUI.totalMemory - newOSMem;
		memoryChart.update();
	});

	createProcessButton.click(function (event) {
		event.preventDefault();
		var pid = $('#processID').val();
		var processSize = Number($('#processSize').val());
		var burstTime = Number($('#burstTime').val());

		// Error Checking
		if (pid === '') {
			createHTMLErrorDialog('Process ID cannot be left blank.');
		} else if (pid === 'OS' || pid === freeSpaceLabel) {
			createHTMLErrorDialog('Invalid Process ID.');
		} else if (processSize > GUI.totalMemory - GUI.memoryValues[0]) {
			createHTMLErrorDialog('Process cannot be bigger than ' +
				(GUI.totalMemory - GUI.memoryValues[0]) + 'kb.');
		} else if (processSize <= 0 || isNaN(processSize)) {
			createHTMLErrorDialog('Invalid Process Size.');
		} else {
			GUI.addProcess(pid, processSize, burstTime);
		}
	});

	createRandomButton.click(function (event) {
		event.preventDefault();
		GUI.addProcess('Random ' + (++GUI.randomProcessCounter),
			Math.floor(Math.random() * GUI.totalMemory * 0.15 + GUI.totalMemory * 0.05));
	});

	killProcessButton.click(function (event) {
		event.preventDefault();
		var killID = $('#killID').val();
		if (killID === 'OS') {
			createHTMLErrorDialog('OS cannot be killed.');
		} else if (killID === freeSpaceLabel) {
			createHTMLErrorDialog('This is not a process.');
		} else if (killID === '') {
			createHTMLErrorDialog('No Process ID specified.');
		} else if (!GUI.removeProcess(killID)) {
			createHTMLErrorDialog('Process ID does not exist.');
		}
	});

	killRandomButton.click(function (event) {
		event.preventDefault();
		if (GUI.memoryLabels.length == 2) {
			createHTMLErrorDialog('There are no processes that can be killed.');
			return;
		}

		var labels = GUI.memoryLabels.filter(function (label) {
			return label !== freeSpaceLabel && label !== 'OS';
		});
		GUI.removeProcess(labels[Math.floor(Math.random() * labels.length)]);
	});

	killAllButton.click(function (event) {
		event.preventDefault();
		if (GUI.memoryLabels.length == 2) {
			createHTMLErrorDialog('There are no processes that can be killed.');
			return;
		}

		for (var i = GUI.memoryLabels.length - 1; i > 0; i--) {
			if (GUI.memoryLabels[i] !== freeSpaceLabel) {
				GUI.removeProcess(GUI.memoryLabels[i], false);
			}
		}
		GUI.numberOfProcessesCreated = 0;
		GUI.itemsInMemory = 0;
		GUI.randomProcessCounter = 0;

		// Add processes from the waiting queue
		if (GUI.waitingQueue.length) {
			while (GUI.waitingQueue.length) {
				var process = GUI.waitingQueue.shift();
				if (!GUI.addProcess(process[0], process[1], process[2], true)) {
					GUI.waitingQueue.unshift(process);
					break;
				}
			}
			memoryChart.update();
		}

	});

	compactButton.click(function (event) {
		event.preventDefault();
		GUI.compact();
	});

	processListButton.click(function (event) {
		event.preventDefault();
		var i, len = GUI.memoryLabels.length,
			html = '<ul style="list-style-type: none;">';
		for (i = 0; i < len; i++) {
			html += '<li class="ui-state-default" style="padding: 0.4em; padding-left: 1.5em; background: ' +
				GUI.memoryColors[i] + '">' + GUI.memoryLabels[i] +
				': ' + GUI.memoryValues[i] + '</li>';
		}
		createHTMLDialog('Process List', html + '</ul>');
	});

	waitingButton.click(function (event) {
		event.preventDefault();
		var i, html = '<ul id="waitlist" style="list-style-type: none;">';
		for (i = 0; i < GUI.waitingQueue.length; i++) {
			html += '<li class="ui-state-default" style="padding: 0.4em; padding-left: 1.5em;" value=\'' +
				JSON.stringify(GUI.waitingQueue[i]) + '\'>' +
				'<span class="ui-icon ui-icon-circle-close waitclosebutton" style="margin-right: 5px"></span>' +
				'<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>' +
				GUI.waitingQueue[i][0] + ' : ' + GUI.waitingQueue[i][1] + 'kb' +
				'</li>';
		}
		createHTMLDialog('Waiting Queue', GUI.waitingQueue.length ? html + '</ul>' :
			'There are currently no processes on the waiting queue.', GUI.waitingQueue.length ?
			function () {
				var newWaitlist = $('#waitlist').sortable('toArray', {attribute : 'value'});
				GUI.waitingQueue = [];
				for (var item in newWaitlist) {
					GUI.waitingQueue.push(JSON.parse(newWaitlist[item]));
				}
			} : undefined);
		$('#waitlist').sortable();
		$('.waitclosebutton').click(function (event) {
			$(this).parent().remove();
		});
	});

	recolorButton.click(function (event) {
		event.preventDefault();
		var i, len = GUI.memoryLabels.length, colorCounter = 0;
//		var lastColor = chartColors[4], newColor;
		for (i = 1; i < len; i++) {
			if (GUI.memoryLabels[i] !== freeSpaceLabel) {

				// Rainbow colors
				GUI.memoryColors[i] = chartColors[colorCounter++ % chartColors.length];

				// Random colors
//				do {
//					newColor = chartColors[Math.floor(Math.random() * chartColors.length)];
//				} while (newColor === lastColor);
//				lastColor = newColor;
//				GUI.memoryColors[i] = newColor;
			}
		}
		memoryChart.update();
	});

	// Style all input boxes to look more like jQueryUI elements
	$('input').addClass('ui-widget input ui-widget-content ui-corner-all ui-spinner-input');

	$(document).tooltip(); // Prettier Tooltips

	// jQueryUI for the algorithm combo box
	var algorithmComboBox = $('#algorithm').selectmenu({
		change: function (event, data) {
			GUI.selectedAlgorithm = data.item.index;
		}
	});

	// Allow the combo box to be scrollable
	algorithmComboBox.next().on('mousewheel', function (event) {
		GUI.selectedAlgorithm = algorithmComboBox[0].selectedIndex;

		// Scroll down
		if (event.deltaY < 0 && GUI.selectedAlgorithm < 2) {
			algorithmComboBox[0].selectedIndex = ++GUI.selectedAlgorithm;
			algorithmComboBox.selectmenu('refresh');

		// Scroll Up
		} else if (event.deltaY > 0 && GUI.selectedAlgorithm > 0) {
			algorithmComboBox[0].selectedIndex = --GUI.selectedAlgorithm;
			algorithmComboBox.selectmenu('refresh');
		}
	});
});
