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

// This function will execute once the page is finished loading
$(function () {
});

// Update the user interface when the window is resized
$(window).resize(function() {
});
