// ******************************************************************************
// * @file    Reboot.js
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
import React, { useState } from 'react';
import { createLogElement } from "./Header";
import { OverlayTrigger, Popover } from 'react-bootstrap';
import iconInfo from '../images/iconInfo.svg';

const Reboot = (props) => {
  let rebootCharacteristic = props.rebootCharacteristic;
  let fileContent;
  let sectorLenght;

  function showFile(e) {
    fileContent = e.target.files[0];
    console.log(fileContent);
    // Determine the number of sectors to erase
    document.getElementById("numberSectorInput").value = (Math.floor(fileContent.size/sectorLenght) + 1)
    createLogElement(fileContent, 3, "P2Pserver FILE INFORMATION");
  }

function onDeviceRadioButtonClick() {
  // Determine the lenght of sectors
  let selectedBoardOption = document.getElementsByName("selectBoard");
  for (let i = 0; i < selectedBoardOption.length; i++){
    if(selectedBoardOption[i].checked){
      selectedBoardOption = selectedBoardOption[i].value;
    }
  }
  switch (selectedBoardOption){
    case "WB5x":
      sectorLenght = 4096;
      break;
    case "WB3x":
      sectorLenght = 4096;
      break;
    case "WB1x":
      sectorLenght = 2048;
      break;
    default:
      sectorLenght = 4096;
  }
  if (fileContent !== undefined) {
    // Determine the number of sectors to erase
    document.getElementById("numberSectorInput").value = (Math.floor(fileContent.size/sectorLenght) + 1)
  }
  
}

function indicationTimeout() {
  document.getElementById("rebootButton").innerHTML = `<div>Something went wrong... Please reset the device and refresh the page</div> <div class="spinner-border text-danger" role="status" style={float:right}></div>`
}

  // Handle the OTA application reboot procedure 
  function onRebootButtonClick(){

    //0x7000
    let sectorInput = document.getElementById("sectorInput").value;
    sectorInput = sectorInput.substring(0,1);

    // Determine the number of sectors to erase
    let numberOfsectorsToErase = document.getElementById("numberSectorInput").value;
    let rebootRequest = new Uint8Array(3);
    rebootRequest[0] = parseInt('01', 8); // Boot mode
    if (sectorLenght === 2048){
      rebootRequest[1] = sectorInput*2; // Sector index (default 14) for WB1x
    }else{
      rebootRequest[1] = sectorInput.toString(16); // Sector index (default 7) for WB5x and WB3x
    }
    rebootRequest[2] = numberOfsectorsToErase; // Number of sectors to erase
    rebootCharacteristic.characteristic.writeValue(rebootRequest);
    console.log(rebootRequest);
    createLogElement(rebootRequest, 2, "REBOOT");
    let rebootButton = document.getElementById("rebootButton");
    rebootButton.disabled = true;
    rebootButton.innerHTML = `<div>Wait for disconnection...</div> <div class="spinner-border text-success" role="status" style={float:right}></div>`
    setTimeout(indicationTimeout, 15000)
  }

  async function onBinaryRadioButtonClick() {
    let rebootButton = document.getElementById("rebootButton")
    rebootButton.disabled = true;
    let selectedOption = document.getElementsByName("selectBinary");
    for (let i = 0; i < selectedOption.length; i++){
      if(selectedOption[i].checked){
        selectedOption = selectedOption[i].value;
      }
    }
    
    switch (selectedOption) {
        case "P2P":
            console.log("P2P server is selected");
            fetch("https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE/BLE_p2pServer_ota/Binary/BLE_p2pServer_ota_reference.bin")
                .then(response => response.json())
                .then(data => {
                  fileContent = data;
                  console.log(fileContent);
                  // Determine the number of sectors to erase
                  document.getElementById("numberSectorInput").value = (Math.floor(fileContent.size/sectorLenght) + 1)
                })
                .catch(error => console.error(error))
            break;
        case "HR":
            console.log("Heart rate is selected");
            fetch("https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE/BLE_HeartRate_ota/Binary/BLE_HeartRate_ota_reference.bin")
                .then(response => response.json())
                .then(data => {
                  fileContent = data;
                  console.log(fileContent);
                  // Determine the number of sectors to erase
                  document.getElementById("numberSectorInput").value = (Math.floor(fileContent.size/sectorLenght) + 1)
                })
                .catch(error => console.error(error))
            break;
        case "FULL":
          console.log("Full stack is selected");
          fetch("https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_full_fw.bin")
              .then(response => response.json())
              .then(data => {
                fileContent = data;
                  console.log(fileContent);
                  // Determine the number of sectors to erase
                  document.getElementById("numberSectorInput").value = (Math.floor(fileContent.size/sectorLenght) + 1)
                })
                .catch(error => console.error(error))
          break;
        case "LIGHT":
            console.log("Light stack is selected");
            fetch("https://api.github.com/repos/STMicroelectronics/STM32CubeWB/contents/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_light_fw.bin")
                .then(response => response.json())
                .then(data => {
                  fileContent = data;
                  console.log(fileContent);
                  // Determine the number of sectors to erase
                  document.getElementById("numberSectorInput").value = (Math.floor(fileContent.size/sectorLenght) + 1)
                })
                .catch(error => console.error(error))
            break;
        default:
            console.log("Selected option not found..")
    }
    rebootButton.disabled = false;
  }

  function handlerRadioSector(){
    let selectedBoardOption = document.getElementsByName("selectSector");
    document.getElementById("rebootSelectFilePart").style="display:''";
    for (let i = 0; i < selectedBoardOption.length; i++){
      if(selectedBoardOption[i].checked){
        switch (selectedBoardOption[i].value){
          case "application":
            document.getElementById("wirelessBinaryList").style="display:none";
            document.getElementById("applicationBinaryList").style="display:''";
            break;
          case "wireless":
            document.getElementById("applicationBinaryList").style="display:none";
            document.getElementById("wirelessBinaryList").style="display:''";
            break;
        }
      }
    }
  }

  const popoverSelectDevice = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> Select the device type. <br />
      It will define the sectors size.
    </Popover>
  );

  const popoverSelectSectorDelete = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> Select the coprocessor on which the reboot will occur.
    </Popover>
  );

  const popoverApplicationBinary = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> Choose either a local binary file or a binary file fetched from the STMicroelectronics github.
    </Popover>
  );

  const popoverWirelessBinary = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> Choose either a local binary file or a binary file fetched from the STMicroelectronics github.
    </Popover>
  );

  const popoverSelectRange = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> No modifications are required in this section. <br />
      Will delete a range of sector. The number of sectors to delete is automaticaly calculated, but it is still customizable.
      
    </Popover>
  );

  return (
      <div className="accordion" id="accordionRebootPanel">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
              Firmware Update Over The Air - Panel
            </button>
          </h2>
          <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionRebootPanel">
            <div className="accordion-body">
              <h3>1. Select the device type
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

              <h3>2. Select sector to delete during the reboot
                <OverlayTrigger
                  trigger={['hover', 'focus']}
                  placement="bottom"
                  overlay={popoverSelectSectorDelete}>
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
                  <h3>3. Select binary file
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
                    <input type="text" disabled={true} className="form-control"  value="BLE_p2pServer_ota_reference.bin - PATH : STM32CubeWB/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE/BLE_p2pServer_ota/Binary/BLE_p2pServer_ota_reference.bin"></input>
                  </div>
                  <div className="input-group">
                    <div className="input-group-text">
                      <input className="form-check-input mt-0" type="radio" value="HR" name='selectBinary' onClick={onBinaryRadioButtonClick}></input>
                    </div>
                    <input type="text" disabled={true} className="form-control"  value="BLE_HeartRate_ota_reference.bin - PATH : STM32CubeWB/Projects/P-NUCLEO-WB55.Nucleo/Applications/BLE/BLE_HeartRate_ota/Binary/BLE_HeartRate_ota_reference.bin"></input>
                  </div>
                </div>

                <div id='wirelessBinaryList' style={{"display": "none"}}>
                  <h3>4. Select binary file
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
                      <input type="text" disabled={true} className="form-control"  value="stm32wb5x_BLE_Stack_full_fw.bin - PATH : STM32CubeWB/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_full_fw.bin"></input>
                    </div>
                    <div className="input-group">
                      <div className="input-group-text">
                        <input className="form-check-input mt-0" type="radio" value="LIGHT" name='selectBinary' onClick={onBinaryRadioButtonClick}></input>
                      </div>
                      <input type="text" disabled={true} className="form-control"  value="stm32wb5x_BLE_Stack_light_fw.bin - PATH : STM32CubeWB/Projects/STM32WB_Copro_Wireless_Binaries/STM32WB5x/stm32wb5x_BLE_Stack_light_fw.bin"></input>
                    </div>
                </div>
                <div className="mt-3 mb-3">
                  <input className="form-control fileInput" type="file" id="formFile" onChange={(e) => showFile(e)}></input>
                </div>
                <h3>4. Range of sectors to delete
                  <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement="bottom"
                    overlay={popoverSelectRange}>
                    <img className="iconInfo" src={iconInfo} ></img>
                  </OverlayTrigger>
                </h3>
                <div className="input-group">
                  <span className="input-group-text" id="sectorChoise">First sector address : 0x</span>
                  <input type="text" className="form-control" placeholder="..." aria-describedby="sectorChoise" maxLength="4" id="sectorInput" defaultValue={"7000"}></input>
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text" id="numberSectorChoise">Number of sectors to delete</span>
                  <input type="text" className="form-control" placeholder="..." aria-describedby="numberSectorChoise" maxLength="4" id="numberSectorInput" defaultValue={"0"}></input>
                </div>            
                <button className="secondaryButton w-100 mt-3" type="button" onClick={onRebootButtonClick} id="rebootButton">Reboot</button>
              </div>
            </div>
          </div>
        </div>
      </div>         
  );
};

export default Reboot;