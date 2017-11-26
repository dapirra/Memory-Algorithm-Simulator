/*jshint camelcase: true, quotmark: single, undef: false, unused: vars, latedef: nofunc, asi: false, boss: false, laxbreak: false, laxcomma: false, multistr: false, sub: false, supernew: false, browser: true, devel: true, jquery: true, indent: 4*/
// JSHint settings on first line (JSHint is used to find errors in JavaScript)

/*

Memory Manager Simulator

Name: David Pirraglia

Professor: Sister Jane Fritz

Class: COM 310

*/

// GUI object used for controling the user interface
var GUI = {
	itemsInMemory: 1,
	selectedAlgorithm: 0, // 0 = First Fit, 1 = Best Fit, 2 = Worst Fit
	totalMemory: 4000,

	memoryArray: [{
		id: 'OS',
		address: 0,
		size: 400
	}]
};

GUI.addProcess = function () {
	this.itemsInMemory++;
};

GUI.removeProcess = function (id) {
	this.itemsInMemory--;
};

GUI.compact = function () {
};

////////////////////////////////////////////////////////////////////////////////

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)'
};

var freeMemoryColor = '#dddddd';

var config = {
	type: 'doughnut',
	data: {
		datasets: [{
			data: [
				400,
				GUI.totalMemory - 400
			],
			backgroundColor: [
				chartColors.blue,
				freeMemoryColor
			],
			label: 'Memory Data' // Check if parameter is nessesary
		}],
		labels: [
			'OS',
			'Free Space'
		]
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
	memoryChart = new Chart(ctx, config);

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

	var applyButton = $('#applyButton').button();
	var createProcessButton = $('#createProcessButton').button();
	var killProcessButton = $('#killProcessButton').button();
	var compactButton = $('#compactButton').button();
	var randomButton = $('#randomButton').button();
	var killAllButton = $('#killAllButton').button();

	applyButton.click(function (event) {
		event.preventDefault();
	});

	createProcessButton.click(function (event) {
		event.preventDefault();
	});

	killProcessButton.click(function (event) {
		event.preventDefault();
	});

	compactButton.click(function (event) {
		event.preventDefault();
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

// Update the user interface when the window is resized
//$(window).resize(function() {
//});
