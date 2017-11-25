/*jshint camelcase: true, quotmark: single, undef: false, unused: vars, latedef: nofunc, asi: false, boss: false, laxbreak: false, laxcomma: false, multistr: false, sub: false, supernew: false, browser: true, devel: true, jquery: true, indent: 4*/
// JSHint settings on first line (JSHint is used to find errors in JavaScript)

/*

CPU Scheduler Simulator

Name: David Pirraglia

Professor: Sister Jane Fritz

Class: COM 310

*/

// GUI object used for controling the user interface
var GUI = {
	itemsInMemory: 1,
	selectedAlgorithm: 0, // 0 = First Fit, 1 = Best Fit, 2 = Worst Fit
	totalMemory: 4096,

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
				'#dddddd'
			],
			label: 'Dataset 1'
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
	var ctx = $('#memoryChart');
	memoryChart = new Chart(ctx, config);
});

// Update the user interface when the window is resized
//$(window).resize(function() {
//});
