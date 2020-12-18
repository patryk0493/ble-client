import React, { PureComponent } from "react";

import Button, { TYPE_BUTTON as BUTTON_TYPE_BUTTON } from "../Button";
import Icon, { TYPE_BLUETOOTH as ICON_TYPE_BLUETOOTH } from "../Icon";

import "./styles.css";

var myCharacteristic;

export default class App extends PureComponent {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const serviceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
    const characteristicUuid = "a9c871ea-408b-11eb-b378-0242ac130002";
    const log = console.log;

    navigator.bluetooth
      .requestDevice({
        filters: [
          {
            services: [serviceUuid]
          }
        ]
      })
      .then((device) => {
        log(device);
        log("Connecting to GATT Server...");
        return device.gatt.connect();
      })
      .then((server) => {
        log("Getting Service...");
        return server.getPrimaryService(serviceUuid);
      })
      .then((service) => {
        log("Getting Characteristic...");
        return service.getCharacteristic(characteristicUuid);
      })
      .then((characteristic) => {
        myCharacteristic = characteristic;
        return myCharacteristic.startNotifications().then((_) => {
          log("> Notifications started");
          myCharacteristic.addEventListener(
            "characteristicvaluechanged",
            (event) => {
              let value = event.target.value;

              let a = [];
              // Convert raw data bytes to hex values just for the sake of showing something.
              // In the "real" world, you'd use data.getUint8, data.getUint16 or even
              // TextDecoder to process raw data bytes.

              var enc = new TextDecoder("utf-8");
              log(enc.decode(value));
              for (let i = 0; i < value.byteLength; i++) {
                a.push(
                  // "0x" + ("00" + value.getUint8(i).toString(16)).slice(-2)
                  "0x" + ("00" + value.getUint8(i).toString(16)).slice(-2)
                );
              }
              log("> " + a.join(" "));
            }
          );
        });
      })
      .catch((error) => {
        console.error("Error: " + error);
      });
  }

  render() {
    return (
      <div className="App">
        <h1>
          Bluetooth API
          <Icon type={ICON_TYPE_BLUETOOTH} />
        </h1>

        <h2>Interact with Bluetooth devices on the Web</h2>

        <p>
          Enable the chrome flag{" "}
          <a href="chrome://flags/#enable-experimental-web-platform-features">
            #enable-experimental-web-platform-features
          </a>{" "}
          <br />
          and open in a new window.
        </p>

        <p>
          <Button type={BUTTON_TYPE_BUTTON} onClick={this.handleClick}>
            Push Me
          </Button>
        </p>
      </div>
    );
  }
}
