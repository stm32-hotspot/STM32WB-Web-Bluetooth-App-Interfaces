# **Web Bluetooth® App**

## **Introduction**

Web interface created with React 18 and Bootstrap 5.  
This web interface is used to interact with an STM32WB board using a Bluetooth® Low Energy connection and the API Web Bluetooth®.

Supported STM32WB firmware applications are:
-	P2Pserver
-	[HeartRate](https://wiki.st.com/stm32mcu/wiki/Connectivity:STM32WB_HeartRate "https://wiki.st.com/stm32mcu/wiki/Connectivity:STM32WB_HeartRate")
-	Firmware Update Over The Air
-	Data Throughput

***
![Firmware Update Over The Air on smartphone & Heart Rate on PC](illustrations/Capture1.PNG "Firmware Update Over The Air on smartphone & Heart Rate on PC")

***

## **Setup**

The following [wiki page](https://wiki.st.com/stm32mcu/wiki/Connectivity:STM32WB_BLE_Hardware_Setup "https://wiki.st.com/stm32mcu/wiki/Connectivity:STM32WB_BLE_Hardware_Setup") will help you to put in place the hardware setup.

### Hardware requirements

To use the web interface, you must be in possession of one of the following **STM32WB** boards.
- [P-NUCLEO-WB55](https://www.st.com/en/evaluation-tools/p-nucleo-wb55.html "https://www.st.com/en/evaluation-tools/p-nucleo-wb55.html")
- [NUCLEO-WB15CC](https://www.st.com/en/evaluation-tools/nucleo-wb15cc.html "https://www.st.com/en/evaluation-tools/nucleo-wb15cc.html")
- [STM32WB5MM-DK](https://www.st.com/en/evaluation-tools/stm32wb5mm-dk.html "https://www.st.com/en/evaluation-tools/stm32wb5mm-dk.html")  

A PC or a smartphone is required to open the web interface in a browser.

### Software requirements

It is required having the [stm32wb5x_BLE_Stack_full_fw.bin](https://github.com/STMicroelectronics/STM32CubeWB/blob/398d0fbc5ef491da30f777575b911e50e68fa77f/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_full_fw.bin?raw=true "https://github.com/STMicroelectronics/STM32CubeWB/blob/398d0fbc5ef491da30f777575b911e50e68fa77f/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_full_fw.bin?raw=true") or [stm32wb5x_BLE_Stack_light_fw.bin](https://github.com/STMicroelectronics/STM32CubeWB/blob/master/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_light_fw.bin?raw=true "https://github.com/STMicroelectronics/STM32CubeWB/blob/master/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_light_fw.bin?raw=true") binary flashed on the Wireless Coprocessor.  
If it is not the case, you need to use **STM32CubeProgrammer** to load the appropriate binary.  
All available coprocessor wireless binaries are located [here](https://github.com/STMicroelectronics/STM32CubeWB/tree/master/Projects/STM32WB_Copro_Wireless_Binaries "https://github.com/STMicroelectronics/STM32CubeWB/tree/master/Projects/STM32WB_Copro_Wireless_Binaries").  
All available application binaries are available [here](https://github.com/STMicroelectronics/STM32CubeWB/tree/398d0fbc5ef491da30f777575b911e50e68fa77f/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE "https://github.com/STMicroelectronics/STM32CubeWB/tree/398d0fbc5ef491da30f777575b911e50e68fa77f/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE").  
Refer to [UM2237](https://wiki.st.com/stm32mcu/wiki/STM32CubeProg_introduction "https://wiki.st.com/stm32mcu/wiki/STM32CubeProg_introduction") to learn how to install and use STM32CubeProgrammer.  


***

## **Usage**

A github page hosting the web app is available at: <https://mygithub.page.io>
No installation is required to use it this way.

You can host locally the server to update source code, see Development mode section.

***

## **Browser compatibility with the API Web Bluetooth®.**

On a **desktop** computer: Chrome, Edge and Opera browsers are compatible.  
On a **smartphone** device: Chrome android is the only browser compatible.  
See https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API documentation.
You may need to enable experimental web platform features in your browser preference.

***

## **User's guide**

### Example with **P2Pserver**:

**Step 1.** Power on the STM32WB board with the P2Pserver application.  
**Step 2.** Activate the bluetooth® on your machine.  
**Step 3.** Then open the open the web page in your browser.  
**Step 4.** And click on the connect button then select the P2PSRV1 in the device list and click pair.  
![Step 4](illustrations/picture0.png "Step 4")  
![Step 4](illustrations/picture1.png "Step 4")  
*Your are now connected.*  
**Step 5.** Click on P2Pserver to show the interface and don't hesitate to read the tooltips.  
![Step 4](illustrations/picture5.png "Step 4")  
*You can now interact with the connected board.*

***

## **Firmware Update Over The Air**

The Firmware Update Over The Air Application allows a remote device to download an application binary 
on CPU1 application processor or to download a Wireless Firmware on CPU2 Stack processor.  

### Follow the next steps to update the firmware.

**Step 0.** Follow the user's guide.  
**Step 1.** Then select the correct STM32WB device by click on the radio button.  
**Step 2.** Then choose between Application Coprocessor Binary to update the Application and Wireless Coprocessor Binary to update the Wireless stack.  
**Step 3.** Next, select the binary to be downloaded. You can either fetch a binary file from the STMicroelectronics github CubeWB or upload a binary file stored on your machine.  
**Step 4.** Choose the first sector address. This step is not neccesary.  
**Step 5.** Click on the upload button and wait for the disconnection.  
**Step 6.** New Application/Wireless stack is running and can be connected.  

***

## **Development mode**

To run the project in development mode, first be sure npm is install on your machine.  
Open a terminal and write the following command:  
`npm -v ` 

If npm is not installed on your machine, install Node.js then clone this repo and go to its root directory then proceed the following commands:  

To install all the dependencies:  
`npm install  `

To start the application:  
`npm start  `

Then open a compatible browser and go to http://localhost:3000