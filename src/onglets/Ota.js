// ******************************************************************************
// * @file    Ota.js
// * @author  MCD Application Team
// *
//  ******************************************************************************
//  * @attention
//  *
//  * Copyright (c) 2022-2023 STMicroelectronics.
//  * All rights reserved.
//  *
//  * This software is licensed under terms that can be found in the LICENSE file
//  * in the root directory of this software component.
//  * If no LICENSE file comes with this software, it is provided AS-IS.
//  *
//  ******************************************************************************
import React from 'react';
import { Buffer } from 'buffer';
import { createLogElement } from "../components/Header";
import { OverlayTrigger, Popover } from 'react-bootstrap';
import iconInfo from '../images/iconInfo.svg';

const CHUNK_LENGTH = 248;
let writeAddressCharacteristic;
let indicateCharacteristic;
let writeWithoutResponseCharacteristic;
let fileContent;
let uploadAction;

const Ota = (props) => {

    // Filtering the different datathroughput characteristics
    props.allCharacteristics.map(element => {
        switch (element.characteristic.uuid) {
            case "0000fe22-8e22-4541-9d4c-21edae82ed19":
                writeAddressCharacteristic = element;
                break;
            case "0000fe23-8e22-4541-9d4c-21edae82ed19":
                indicateCharacteristic = element;
                break;
            case "0000fe24-8e22-4541-9d4c-21edae82ed19":
                writeWithoutResponseCharacteristic = element;
                break;
            default:
                console.log("# No characteristics find..");
        }
    });

    document.getElementById("readmeInfo").style.display = "none";
    
    // Authorize the reception of indications / notifications
    console.log('Indications ON');
    indicateCharacteristic.characteristic.startNotifications();
    indicateCharacteristic.characteristic.oncharacteristicvaluechanged = notifHandler;
    createLogElement(indicateCharacteristic, 3, "OTA ENABLE NOTIFICATION");


    // Notification / indications handler
    function notifHandler(event) {
        console.log("Notification / Indication :> received");
        var buf = new Uint8Array(event.target.value.buffer);
        console.log(buf);
        if (buf[0] === 1){
          document.getElementById("uploadButton").innerHTML = `<div>Wait for disconnection...</div> <div class="spinner-border text-success" role="status" style={float:right}></div>`
        }
        createLogElement(buf, 2, "OTA NOTIFICATION");
    }

    // Send to device the action to be ready for the update of the firmware
    async function writeAddress() {
        let address = document.getElementById("startSectorInput").value
        let hexString = address.substring(0,2);
        hexString = parseInt(hexString, 16);
        console.log(hexString);
        // dec : 002 000 112 000
        // hex : 02 00 70 00
        let myWord = new Uint8Array(4);
        myWord[0] = uploadAction; // Action 
        myWord[1] = "000"; // Address
        myWord[2] = hexString; // Address
        myWord[3] = "000"; // Address
        try {
            await writeAddressCharacteristic.characteristic.writeValue(myWord);
            console.log("Writing >> " + myWord);
            createLogElement(myWord, 2, "OTA WRITE");
        }
        catch (error) {
            console.log('2 : Argh! ' + error);
        }
    }

    function indicationTimeout() {
      document.getElementById("uploadButton").innerHTML = `<div>Something went wrong... Please reset the device and wait for disconnection</div> <div class="spinner-border text-danger" role="status" style={float:right}></div>`
    }
    

    async function onUploadButtonClick() {
        let progressUploadBar = document.getElementById('progressUploadBar');
        let start = 0;
        let end = CHUNK_LENGTH;
        let sub;
        let totalBytes = 0;
        // Send to device the base memory address (sector 7)
        writeAddress();
        // Slice the fileContent (the binary file) into small chucks of CHUNK_LENGTH
        // And send them to the device
        // Start the timer
        var startTime = performance.now()
        for (let i = 0; i < (fileContent.length) / CHUNK_LENGTH; i++) {
            sub = fileContent.slice(start, end);
            console.log(sub);
            start = end;
            end += CHUNK_LENGTH;
            await writeWithoutResponseCharacteristic.characteristic.writeValue(sub)
            // createLogElement(sub, 2, "OTA WRITE");
            totalBytes += sub.byteLength
            console.log("progressUploadBar");
            console.log(progressUploadBar);
            progressUploadBar.setAttribute('style','width:'+Number((totalBytes * 100) / fileContent.length)+'%');
            console.log(i + "> (" + totalBytes + ") writing " + sub.byteLength + ' bytes..');
            }

        // Send to device the action : file is finish to upload
        let FileUploadFinished = new Uint8Array(1);
        FileUploadFinished[0] = "007";
        await writeAddressCharacteristic.characteristic.writeValue(FileUploadFinished);
        console.log(FileUploadFinished);
        createLogElement(FileUploadFinished, 2, "OTA WRITE");
        // Stop the timer
        var endTime = performance.now()
        console.log(`The firmware update took : ${endTime - startTime} milliseconds`);
        let uploadButton = document.getElementById("uploadButton")
        uploadButton.disabled = true;
        uploadButton.innerHTML = `<div> Wait for disconnection...</div> <div class="spinner-border" role="status" style={float:right}></div>`
        setTimeout(indicationTimeout, 30000)
        // setTimeout(() => { console.log("World!"); }, 30000);
    }

    // Read the file selected from the file input and upload it
    function showFile(input) {
      console.log("FileLoader")
      let uploadButton = document.getElementById("uploadButton");
      uploadButton.disabled = true;
        fileContent = input.target.files[0];
        let reader = new FileReader();
        reader.readAsArrayBuffer(fileContent);
        reader.onload = async function () {
            let uint8View = new Uint8Array(reader.result);
            console.log(uint8View);
            fileContent = uint8View;
        }
        uploadButton.disabled = false;
    }

    async function onDeviceRadioButtonClick(){
      let selectedDevice = document.getElementsByName("selectBoard");
      for (let i = 0; i < selectedDevice.length; i++){
        if(selectedDevice[i].checked){
          selectedDevice = selectedDevice[i].value;
        }
    }
      console.log(selectedDevice);
      switch (selectedDevice){
        case 'WB5x':
          document.getElementById("P2Pfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE/BLE_p2pServer_ota/Binary/BLE_p2pServer_ota_reference.bin";
          document.getElementById("HRfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE/BLE_HeartRate_ota/Binary/BLE_HeartRate_ota_reference.bin";
          document.getElementById("FULLfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_full_fw.bin";
          document.getElementById("LIGHTfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_light_fw.bin";
          break;
        case 'WB3x':
          document.getElementById("P2Pfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE/BLE_p2pServer_ota/Binary/BLE_p2pServer_ota_reference.bin";
          document.getElementById("HRfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE/BLE_HeartRate_ota/Binary/BLE_HeartRate_ota_reference.bin";
          document.getElementById("FULLfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB3x/stm32wb3x_BLE_Stack_full_fw.bin";
          document.getElementById("LIGHTfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB3x/stm32wb3x_BLE_Stack_light_fw.bin";
          break;
        case 'WB1x':
          document.getElementById("P2Pfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/NUCLEO-WB15CC/Applications/BLE/BLE_p2pServer_ota/Binary/BLE_p2pServer_ota_reference.bin";
          document.getElementById("HRfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/NUCLEO-WB15CC/Applications/BLE/BLE_HeartRate_ota/Binary/BLE_HeartRate_ota_reference.bin";
          document.getElementById("FULLfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB1x/stm32wb1x_BLE_Stack_full_fw.bin";
          document.getElementById("LIGHTfetch").value = "https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB1x/stm32wb1x_BLE_Stack_light_fw.bin";
          break;
      }
    }

    async function onBinaryRadioButtonClick() {
      let uploadButton = document.getElementById("uploadButton");
      uploadButton.disabled = true;
      let selectedOption = document.getElementsByName("selectBinary");
        for (let i = 0; i < selectedOption.length; i++){
            if(selectedOption[i].checked){
                selectedOption = selectedOption[i].value;
            }
        }
        console.log(selectedOption)
        switch (selectedOption) {
          
            case "P2P":
                console.log("P2P server is selected");
                fetch(document.getElementById("P2Pfetch").value)
                    .then(response => response.json())
                    .then(data => {
                        // Raw data encoded in base64
                        let raw = data.content;
                        let buff = Buffer.from(raw, 'base64');
                        // convert base64 raw data into hex string
                        let buffStr = buff.toString('hex');
                        console.log(buffStr);
                        let uint8View = Uint8Array.from(Buffer.from(buffStr, 'hex'));
                        console.log(uint8View);
                        fileContent = uint8View;
                        console.log("P2P server is uploading");
                        uploadButton.disabled = false;
                    })
                    .catch(error => console.error(error))
                break;
            case "HR":
                console.log("Heart rate is selected");
                fetch(document.getElementById("HRfetch").value)
                    .then(response => response.json())
                    .then(data => {
                        // Raw data encoded in base64
                        let raw = data.content;
                        let buff = Buffer.from(raw, 'base64');
                        // convert base64 raw data into hex string
                        let buffStr = buff.toString('hex');
                        console.log(buffStr);
                        let uint8View = Uint8Array.from(Buffer.from(buffStr, 'hex'));
                        console.log(uint8View);
                        fileContent = uint8View;
                        console.log("Heart rate is uploading");
                        uploadButton.disabled = false;
                    })
                    .catch(error => console.error(error))
                break;
            case "FULL":
                console.log("Full stack is selected");
                fetch(document.getElementById("FULLfetch").value )
                    .then(response => response.json())
                    .then(data => {
                        // Raw data encoded in base64
                        let raw = data.content;
                        let buff = Buffer.from(raw, 'base64');
                        // convert base64 raw data into hex string
                        let buffStr = buff.toString('hex');
                        console.log(buffStr);
                        let uint8View = Uint8Array.from(Buffer.from(buffStr, 'hex'));
                        console.log(uint8View);
                        fileContent = uint8View;
                        console.log("Full stack is uploading");
                        uploadButton.disabled = false;
                    })
                    .catch(error => console.error(error))
                break;
            case "LIGHT":
                console.log("Light stack is selected");
                fetch(document.getElementById("LIGHTfetch").value)
                    .then(response => response.json())
                    .then(data => {
                        // Raw data encoded in base64
                        let raw = data.content;
                        let buff = Buffer.from(raw, 'base64');
                        // convert base64 raw data into hex string
                        let buffStr = buff.toString('hex');
                        console.log(buffStr);
                        let uint8View = Uint8Array.from(Buffer.from(buffStr, 'hex'));
                        console.log(uint8View);
                        fileContent = uint8View;
                        console.log("Light stack is uploading");
                        uploadButton.disabled = false;
                    })
                    .catch(error => console.error(error))
                break;
            default:
                console.log("Selected option not found..")
        }
    }

    function handlerRadioSector(){
        let selectedBoardOption = document.getElementsByName("selectSector");
        document.getElementById("rebootSelectFilePart").style="display:''";
        for (let i = 0; i < selectedBoardOption.length; i++){
          if(selectedBoardOption[i].checked){
            switch (selectedBoardOption[i].value){
              case "application":
                uploadAction = "002";
                document.getElementById("wirelessBinaryList").style="display:none";
                document.getElementById("applicationBinaryList").style="display:''";
                break;
              case "wireless":
                uploadAction = "001"
                document.getElementById("applicationBinaryList").style="display:none";
                document.getElementById("wirelessBinaryList").style="display:''";
                break;
            }
          }
        }
      }

    const popoverSelectDevice = (
      <Popover id="popover-trigger-hover-focus" title="Popover bottom">
        <strong>Info :</strong> Select the device type.
      </Popover>
    );

    const popoverSelectCoprocessor = (
      <Popover id="popover-trigger-hover-focus" title="Popover bottom">
        <strong>Info :</strong> Select the coprocessor on which the firmware update will occur.
      </Popover>
    );

    const popoverApplicationBinary = (
      <Popover id="popover-trigger-hover-focus" title="Popover bottom">
        <strong>Info :</strong> Choose either a file from your device or file fetch from the STMicroelectronics Hotspot. <br />
        Then choose the first sector address. (default 0x7000).
      </Popover>
    );

    const popoverWirelessBinary = (
      <Popover id="popover-trigger-hover-focus" title="Popover bottom">
        <strong>Info :</strong> Choose either a file from your device or a file fetched from the STMicroelectronics Hotspot. <br />
        Then choose the first sector address. (default 0x7000).
      </Popover>
    );

    return (
    <div className="container-fluid">
        <div className="container">
            <h3>1. Select the device 
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="bottom"
                overlay={popoverSelectDevice}>
                <img className="iconInfo" src={iconInfo} ></img>
              </OverlayTrigger>
            </h3>                   
              <div className="input-group">
                <div className="input-group-text">
                  <input className="form-check-input mt-0" type="radio" value="WB5x" name='selectBoard' onClick={onDeviceRadioButtonClick}></input>
                </div>
                <input type="text" disabled={true} className="form-control" aria-label="Text input with radio button" value="STM32WB5x"></input>
                </div>
              <div className="input-group">
                <div className="input-group-text">
                  <input className="form-check-input mt-0" type="radio" value="WB3x" name='selectBoard' onClick={onDeviceRadioButtonClick}></input>
                </div>
                <input type="text" disabled={true} className="form-control" aria-label="Text input with radio button" value="STM32WB3x"></input>
              </div>
              <div className="input-group">
                <div className="input-group-text">
                  <input className="form-check-input mt-0" type="radio" value="WB1x" name='selectBoard' onClick={onDeviceRadioButtonClick}></input>
                </div>
                <input type="text" disabled={true} className="form-control" aria-label="Text input with radio button" value="STM32WB1x"></input>
              </div>

              <h3>2. Select the coprocessor
                <OverlayTrigger
                  trigger={['hover', 'focus']}
                  placement="bottom"
                  overlay={popoverSelectCoprocessor}>
                  <img className="iconInfo" src={iconInfo} ></img>
                </OverlayTrigger>
              </h3>
              <div className="input-group">
                <div className="input-group-text">
                  <input className="form-check-input mt-0" type="radio" value="application" name='selectSector' onClick={handlerRadioSector}></input>
                </div>
                <input type="text" disabled={true} className="form-control"  value="Application Coprocessor Binary"></input>
              </div>
              <div className="input-group">
                <div className="input-group-text">
                  <input className="form-check-input mt-0" type="radio" value="wireless" name='selectSector' onClick={handlerRadioSector}></input>
                </div>
                <input type="text" disabled={true} className="form-control"  value="Wireless Coprocessor Binary"></input>
              </div>
              <div id='rebootSelectFilePart' style={{"display": "none"}}>
                <div id='applicationBinaryList' style={{"display": "none"}}>
                  <h3>3. Select the binary file
                    <OverlayTrigger
                      trigger={['hover', 'focus']}
                      placement="bottom"
                      overlay={popoverApplicationBinary}>
                      <img className="iconInfo" src={iconInfo} ></img>
                    </OverlayTrigger>
                  </h3>
                  <div className="input-group">
                    <div className="input-group-text">
                      <input className="form-check-input mt-0" type="radio" value="P2P" name='selectBinary' onClick={onBinaryRadioButtonClick}></input>
                    </div>
                    <input type="text" disabled={true} className="form-control" id="P2Pfetch"></input>
                  </div>
                  <div className="input-group">
                    <div className="input-group-text">
                      <input className="form-check-input mt-0" type="radio" value="HR" name='selectBinary' onClick={onBinaryRadioButtonClick}></input>
                    </div>
                    <input type="text" disabled={true} className="form-control" id="HRfetch"></input>
                  </div>
                </div>

                <div id='wirelessBinaryList' style={{"display": "none"}}>
                  <h3>3. Select binary file
                  <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement="bottom"
                    overlay={popoverWirelessBinary}>
                    <img className="iconInfo" src={iconInfo} ></img>
                  </OverlayTrigger>
                  </h3>
                    <div className="input-group">
                      <div className="input-group-text">
                        <input className="form-check-input mt-0" type="radio" value="FULL" name='selectBinary' onClick={onBinaryRadioButtonClick}></input>
                      </div>
                      <input type="text" disabled={true} className="form-control" id="FULLfetch" value="stm32wb5x_BLE_Stack_full_fw.bin - PATH : STM32CubeWB/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_full_fw.bin"></input>
                    </div>
                    <div className="input-group">
                      <div className="input-group-text">
                        <input className="form-check-input mt-0" type="radio" value="LIGHT" name='selectBinary' onClick={onBinaryRadioButtonClick}></input>
                      </div>
                      <input type="text" disabled={true} className="form-control" id="LIGHTfetch" value="stm32wb5x_BLE_Stack_light_fw.bin - PATH : STM32CubeWB/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_light_fw.bin"></input>
                    </div>
                </div>
                <div className="mt-3 mb-3">
                  <input className="form-control fileInput" type="file" onChange={(e) => showFile(e)}></input>
                </div> 
                <div className="input-group mb-3">
                  <span className="input-group-text" id="startSectorChoise">Address 0x</span>
                  <input type="text" className="form-control" placeholder="..." aria-describedby="startSectorChoise" maxLength="4" id="startSectorInput" defaultValue={"7000"}></input>
                </div>
                <button className="secondaryButton w-100 mb-3 has-spinner" type="button" onClick={onUploadButtonClick} id="uploadButton" disabled={false}>Upload</button>
                <div class="progress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" id='progressUploadBar' aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style={{width: "0%"}}></div>
                </div>
              </div>
            </div>
        </div>

    );
};

export default Ota;