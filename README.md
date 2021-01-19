<!--
Memory Manager Simulator
Name: David Pirraglia
Professor: Sister Jane Fritz
Class: COM 310
-->

## Memory Manager Simulator

*It's recommended to run the Memory_Manager.html file with Google Chrome, keeping the style.css and script.js files in the same directory as the html file.*

*Note that an internet connection is needed as well in order to download the libraries*

*The text editor that I used to write this is called Brackets*

### Features:
- Support for First Fit, Best Fit, and Worst Fit memory algorithms
- The contents of the memory are displayed in a doughnut created with Chart.js
- The contents of the memory can also be viewed as a list
- Capable of performing Compaction
- Support for creating a process with a burst time in milliseconds
- When there is no room for processes in memory, they can be added to the waiting queue
- The user can view, rearrange, and delete processes on the waiting queue
- Processes on the waiting queue are automatically added whenever a process is killed
- The waiting queue uses a FIFO algorithm
- Processes can be randomly created as well as randomly killed
- It's also possible to kill all processes in memory
- The processes in the doughnut can be recolored using a rainbow pattern

### How data is structured:

I used 3 separate arrays called memoryLabels, memoryValues, and memoryColors to hold the data for the Memory Simulator. This was done so that the chart may be given reference pointers to these 3 arrays and to keep things less complicated by only having one copy of the data. The processes as well as the free memory blocks are stored on these 3 arrays.


### Libraries used:
- jQuery 1.12.1
- jQuery UI 1.12.1
- jQuery Mousewheel plugin 3.1.12
- Chart.js 2.7.1
