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
createHTMLDialog = function (title, html) {
	$('#dialog').remove(); // Remove old dialog if exists
	$(document.body).append('<div id="dialog" title="' +
		title + '">' + html + '</div>'); // Append new dialog code

	// Settings for the dialog
	var defaultDialog = $('#dialog').dialog({
		modal: true,
		buttons: {
			Ok: function() {
				$(this).dialog('close');
			}
		}
	});

	// When the background is clicked, the dialog is closed
	$('body > div.ui-widget-overlay.ui-front').click(function (event) {
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
	totalMemory: 4000,
	numberOfProcessesCreated: 0,
	memoryValues: [400, 4000 - 400],
	memoryLabels: ['OS', freeSpaceLabel],
	memoryColors: [chartColors[4], freeMemoryColor]
};

// Uses a basic algorithm to determine which color to use
GUI.determineColor = function () {
	return chartColors[(this.memoryValues.length - 1) % chartColors.length];
};

GUI.addProcess = function (pid, processSize, burstTime) {
	if (this.countHoles() === 0) { // Add process to the end if no holes
		var oldFreeSpace = this.memoryValues.pop();
		this.memoryLabels.pop();
		this.memoryColors.pop();

		this.memoryValues.push(processSize);
		this.memoryLabels.push(pid);
		this.memoryColors.push(this.determineColor());

		this.usedMemory += processSize;
		this.memoryValues.push(oldFreeSpace - processSize);
		this.memoryLabels.push(freeSpaceLabel);
		this.memoryColors.push(freeMemoryColor);

		memoryChart.update();
		this.itemsInMemory++;
	} else { // Use memory algorithm to add process to memory
		var index;
		switch (this.selectedAlgorithm) {
			case 0: // First Fit
				index = this.findFirstFit(processSize);
				if (index) {
					this.insertProcess(index, pid, processSize);
				}
				break;
			case 1: // Best Fit
				index = this.findBestFit(processSize);
				if (index) {
					this.insertProcess(index, pid, processSize);
				}
				break;
			case 2: // Worst Fit
				index = this.findWorstFit(processSize);
				if (index) {
					this.insertProcess(index, pid, processSize);
				}
				break;
		}
		this.itemsInMemory++;
		memoryChart.update();
	}

	// Automatically remove the process after a certain number of milliseconds
	if (burstTime) {
		setTimeout(function() {
			GUI.removeProcess(pid);
		}, burstTime);
	}
};

GUI.removeProcess = function (pid) {
	var i, len = this.memoryLabels.length;
	for (i = 0; i < len; i++) {
		if (pid === this.memoryLabels[i]) {
			this.memoryLabels[i] = freeSpaceLabel;
			this.memoryColors[i] = freeMemoryColor;
			this.itemsInMemory--;
			this.mergeFreeSpaces();
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

// Calculate the total amount of used memory, including holes
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

	var updateTotalMemButton = $('#updateTotalMem').button();
	var updateOSMemButton = $('#updateOSMem').button();
	var createProcessButton = $('#createProcessButton').button();
	var killProcessButton = $('#killProcessButton').button();
	var compactButton = $('#compactButton').button();
	var randomButton = $('#randomButton').button();
	var killRandomButton = $('#killRandomButton').button();
	var killAllButton = $('#killAllButton').button();
	var processListButton = $('#processListButton').button();
	var waitingButton = $('#waitingButton').button();
	var recolorButton = $('#recolorButton').button();

	updateTotalMemButton.click(function (event) {
		event.preventDefault();
		var newTotalMem = Number($('#totalMem').val());
		var usedMemory = GUI.calulateUsedMemory();
		if (newTotalMem < usedMemory) {
			createHTMLDialog('Error', 'Total memory cannot be less than used memory.');
			$('#totalMem').val(GUI.totalMemory);
		} else {
			GUI.totalMemory = newTotalMem;
			GUI.memoryValues.pop();
			GUI.memoryValues.push(GUI.totalMemory - usedMemory);
			memoryChart.update();
		}
	});

	updateOSMemButton.click(function (event) {
		event.preventDefault();
		var newOSMem = Number($('#osMem').val());
		if (newOSMem > GUI.totalMemory) {
			createHTMLDialog('Error', 'OS memory cannot be greater than total memory.');
			$('#osMem').val(GUI.memoryValues[0]);
		// This condition may not be needed if I don't have to worry about
		// the OS changing sizes whlie the program is running
		} else if (newOSMem <= GUI.calulateUseableMemory()) {
			var oldOSMem = GUI.memoryValues[0];
			GUI.memoryValues[0] = newOSMem;
			GUI.memoryValues[GUI.memoryValues.length - 1] += oldOSMem - newOSMem;
			memoryChart.update();
		} else {
			createHTMLDialog('Error', 'There is not enough room to make the OS memory that size.');
		}
	});

	createProcessButton.click(function (event) {
		event.preventDefault();
		var pid = $('#processID').val();
		var processSize = Number($('#processSize').val());
		var burstTime = Number($('#burstTime').val());

		if (processSize > this.totalMemory) { // There's an error
			createHTMLDialog('Error', 'Process cannot be bigger than the total memory.');
		} else if (pid === '') {
			createHTMLDialog('Error', 'Process ID cannot be left blank.');
		} else if (processSize <= 0) {
			createHTMLDialog('Error', 'Invalid Process Size.');
		} else {
			GUI.addProcess(pid, processSize, burstTime);
		}
	});

	randomButton.click(function (event) {
		event.preventDefault();
		GUI.addProcess('Random ' + (++GUI.randomProcessCounter),
			Math.floor(Math.random() * GUI.totalMemory * 0.15 + GUI.totalMemory * 0.05));
	});

	killProcessButton.click(function (event) {
		event.preventDefault();
		var killID = $('#killID').val();
		if (killID === 'OS') {
			createHTMLDialog('Error', 'OS cannot be killed.');
		} else if (killID === '') {
			createHTMLDialog('Error', 'No Process ID specified.');
		} else if (!GUI.removeProcess(killID)) {
			createHTMLDialog('Error', 'Process ID does not exist.');
		}
	});

	killRandomButton.click(function (event) {
		event.preventDefault();
		if (GUI.memoryLabels.length == 2) {
			createHTMLDialog('Error', 'There are no processes that can be killed.');
		}
	});

	killAllButton.click(function (event) {
		event.preventDefault();
		var i, len = GUI.memoryLabels.length;
		for (i = len; i > 0; i--) {
			if (GUI.memoryLabels[i] !== freeSpaceLabel) {
				GUI.removeProcess(GUI.memoryLabels[i]);
			}
		}
		GUI.numberOfProcessesCreated = 0;
		GUI.itemsInMemory = 0;
		GUI.randomProcessCounter = 0;
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
			html += '<li class="ui-state-default" style="padding: 0.4em; padding-left: 1.5em;background: ' +
				GUI.memoryColors[i] + '">' + GUI.memoryLabels[i] +
				': ' + GUI.memoryValues[i] + '</li>';
		}
		html += '</ul>';

		createHTMLDialog('Process List', html);
	});

	waitingButton.click(function (event) {
		event.preventDefault();
	});

	recolorButton.click(function (event) {
		event.preventDefault();
	});

	// Style all input boxes to look more like jQuery UI elements
	$('input').addClass('ui-widget input ui-widget-content ui-corner-all ui-spinner-input');

	$(document).tooltip(); // Prettier Tooltips

	// jQuery UI for the algorithm combo box
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
