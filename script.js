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
arrayRemove = function(array, position) {
	array.splice(position, 1);
};

var chartColors = [
	'rgb(255, 99, 132)', // Red
	'rgb(255, 159, 64)', // Orange
	'rgb(255, 205, 86)', // Yellow
	'rgb(75, 192, 192)', // Green
	'rgb(54, 162, 235)', // Blue
	'rgb(153, 102, 255)' // Purple
];

var freeMemoryColor = '#dddddd';
var freeSpaceLabel = 'Free Space';

// GUI object used for controling the user interface
var GUI = {
	itemsInMemory: 1,
	selectedAlgorithm: 0, // 0 = First Fit, 1 = Best Fit, 2 = Worst Fit
	usedMemory: 400,
	usableMemory: 3600,
	totalMemory: 4000,
	numberOfProcessesCreated: 0,
	memoryValues: [400, 4000 - 400],
	memoryLabels: ['OS', freeSpaceLabel],
	memoryColors: [chartColors[4], freeMemoryColor]
//	memoryLength: 2
};

GUI.addProcess = function (pid, processSize, burstTime) {
	if (this.countHoles() === 0) { // Add process to the end if no holes
		var oldFreeSpace = this.memoryValues.pop();
		this.memoryLabels.pop();
		this.memoryColors.pop();

		this.memoryValues.push(processSize);
		this.memoryLabels.push(pid);
		this.memoryColors.push(chartColors[this.itemsInMemory %
			chartColors.length]);

		this.usedMemory += processSize;
		this.memoryValues.push(oldFreeSpace - processSize);
		this.memoryLabels.push(freeSpaceLabel);
		this.memoryColors.push(freeMemoryColor);

		memoryChart.update();
		this.itemsInMemory++;
	} else { // Use memory algorithm to add process to memory
		//
	}

	// Automatically remove the process after a certain number of milliseconds
	if (burstTime) {
		setTimeout(function() {
			GUI.removeProcess(pid);
		}, burstTime);
	}
};

GUI.removeProcess = function (pid) {
	var index, len = this.memoryLabels.length;
	for (index = 0; index < len; index++) {
		if (pid === this.memoryLabels[index]) {
			this.memoryLabels[index] = freeSpaceLabel;
			this.memoryColors[index] = freeMemoryColor;
			this.itemsInMemory--;
			this.mergeFreeSpaces();
			memoryChart.update();
			return true;
		}
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
		if (event.deltaY < 0 && selectedTab < 3) {
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
	var killAllButton = $('#killAllButton').button();

	updateTotalMemButton.click(function (event) {
		event.preventDefault();
		var newTotalMem = Number($('#totalMem').val());
		if (newTotalMem < GUI.usedMemory) {
			alert('Error: Total memory cannot be less than used memory.');
			$('#totalMem').val(GUI.totalMemory);
		} else {
			GUI.totalMemory = newTotalMem;
			GUI.memoryValues.pop();
			GUI.memoryValues.push(GUI.totalMemory - GUI.usedMemory);
			memoryChart.update();
		}
	});

	updateOSMemButton.click(function (event) {
		event.preventDefault();
		var newOSMem = Number($('#osMem').val());
		if (newOSMem > GUI.totalMemory) {
			alert('Error: OS memory cannot be greater than total memory.');
			$('#osMem').val(GUI.memoryValues[0]);
		} else {
			var oldOSMem = GUI.memoryValues[0];
			GUI.memoryValues[0] = newOSMem;
			GUI.memoryValues.pop();
			GUI.usedMemory += newOSMem - oldOSMem;
			GUI.memoryValues.push(GUI.totalMemory - GUI.usedMemory);
			memoryChart.update();
		}
	});

	createProcessButton.click(function (event) {
		event.preventDefault();
		var pid = $('#processID').val();
		var processSize = Number($('#processSize').val());
		var burstTime = Number($('#burstTime').val());

		GUI.addProcess(pid, processSize, burstTime);
	});

	killProcessButton.click(function (event) {
		event.preventDefault();
		var killID = $('#killID').val();
		if (killID === 'OS') {
			alert('Error: OS cannot be killed');
		} else if (!GUI.removeProcess(killID)) {
			alert('Error: Process ID does not exist');
		}
	});

	compactButton.click(function (event) {
		event.preventDefault();
		GUI.compact();
	});

	randomButton.click(function (event) {
		event.preventDefault();
	});

	killAllButton.click(function (event) {
		event.preventDefault();
	});

	// Style all input boxes to look more like jQuery UI elements
	$('input').addClass('ui-widget input ui-widget-content ui-corner-all ui-spinner-input');

	// Prettier Tooltips
	$(document).tooltip();

	// jQuery UI for the algorithm combo box
	var algorithmComboBox = $('#algorithm').selectmenu({
		change: function (event, data) {
			GUI.selectedAlgorithm = data.item.index;
//			GUI.onAlgorithmComboBoxChange();
//			GUI.updateGUI();
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
//		GUI.onAlgorithmComboBoxChange();
//		GUI.updateGUI();
	});
});
