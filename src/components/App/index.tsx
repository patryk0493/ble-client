import { Button, Col, Divider, notification, Row, Statistic, Tag } from 'antd';
import Layout from 'antd/lib/layout';
import { Content, Footer } from 'antd/lib/layout/layout';
import React, { useState } from "react";
import { CheckCircleOutlined, LikeOutlined } from '@ant-design/icons';
import { SERVICE_UUID, KNOWN_CHARACTERSTICS } from "../../consts";
import "./styles.css";

const enc = new TextDecoder("utf-8");

type CharacteristicValueType = string | number | undefined;

let server: BluetoothRemoteGATTServer;

export default () => {

  const [NH3, setNH3] = useState<CharacteristicValueType>(undefined);
  const [CO, setCO] = useState<CharacteristicValueType>(undefined);
  const [NO2, setNO2] = useState<CharacteristicValueType>(undefined);
  const [C3H8, setC3H8] = useState<CharacteristicValueType>(undefined);
  const [C4H10, setC4H10] = useState<CharacteristicValueType>(undefined);
  const [CH4, setCH4] = useState<CharacteristicValueType>(undefined);
  const [H2, setH2] = useState<CharacteristicValueType>(undefined);
  const [C2H5OH, setC2H5OH] = useState<CharacteristicValueType>(undefined);
  const [O2, setO2] = useState<CharacteristicValueType>(undefined);
  const [status, setStatus] = useState<'disconnected' | 'disconnecting' | 'connected' | 'error'>('disconnected');

  const handleDisconnectClick = async () => {
    if (status === 'connected' && server) {
      setStatus('disconnecting');
      notification.info({
        message: `Disconnecting...`,
        description: '',
      });
      server.disconnect();
    }
  }

  const handleClick = async () => {
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          services: [SERVICE_UUID],
        }
      ]
    });
    if (!device || !device.gatt) {
      return;
    }

    const deviceDisconnectEventHandler = (event: Event) => {
      notification.info({
        message: `Device disconnected`,
      });
      setStatus('disconnected');
      device.removeEventListener('gattserverdisconnected', deviceDisconnectEventHandler);
    }

    device.addEventListener('gattserverdisconnected', deviceDisconnectEventHandler);

    server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);

    const characteristics = await service.getCharacteristics();

    characteristics.forEach(async characteristic => {
      console.log(characteristic);
      const c = KNOWN_CHARACTERSTICS.find(c => c.uuid === characteristic.uuid);
      if (!c) {
        notification.error({
          message: `Charanteristic with UUID: ${characteristic.uuid} not found!`,
          description: '',
        });
        return;
      }

      try {
        const a = await characteristic.startNotifications();
        a.addEventListener("characteristicvaluechanged", (event) => {
          const t: any = event.target;
          if (!event || !event.target) {
            return;
          }
          const { value } = t;
          const decodedValue = enc.decode(value);
          switch (c.type) {
            case 'NH3':
              setNH3(decodedValue);
              break;
            case 'CO':
              setCO(decodedValue);
              break;
            case 'NO2':
              setNO2(decodedValue);
              break;
            case 'C3H8':
              setC3H8(decodedValue);
              break;
            case 'C4H10':
              setC4H10(decodedValue);
              break;
            case 'CH4':
              setCH4(decodedValue);
              break;
            case 'H2':
              setH2(decodedValue);
              break;
            case 'C2H5OH':
              setC2H5OH(decodedValue);
              break;
            case 'O2':
              setO2(decodedValue);
              break;
            default:
              break;
          }
        });
      } catch (error) {
        notification.error({
          message: `Error`,
          description: JSON.stringify(error),
        });
      }
    });

    notification.success({
      message: `Connected`,
      description: '',
    });
    setStatus('connected');

    // characteristicOne.addEventListener("characteristicvaluechanged", ({ target }) => {
    //   const t: any = target;
    //   if (!target) {
    //     return;
    //   }
    //   const { value } = t;
    //   setVal(enc.decode(value));
    // });
  };

  return (
    <>
      <Layout className="layout">
        <Content style={{ margin: '50px 50px', padding: '20px 20px', backgroundColor: 'white' }} >
          <Row align='middle' justify='center'>
            <Col span={18} >
              <h1>
                Welcome to the <b>Air Condition </b>app
              </h1>
            </Col>
            <div className="App">
              <p>
                Enable the chrome flag{" "}
                <a href="chrome://flags/#enable-experimental-web-platform-features">
                  #enable-experimental-web-platform-features
                </a>{" "}
                <br />
                and open in a new window.
              </p>
            </div>
            <Col span={18}>
              <Row justify='space-between'>
                <Col>
                  <p style={{ margin: '0em 1em 0 0', display: 'inline-block', padding: 0 }}>Status:</p>
                  <Tag icon={<CheckCircleOutlined />} color={status === 'connected' ? "success" : 'blue'}>
                    {status === 'connected' ? `Connected` : `Disconnected`}
                  </Tag>
                </Col>
                <Col>
                  {
                    status !== 'connected' &&
                    <Button type='primary' onClick={handleClick}>
                      Connect
                    </Button>
                  }
                  {
                    status === 'connected' &&
                    <Button color={'red'} onClick={handleDisconnectClick}>
                      Disconnect
                    </Button>
                  }
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider orientation="left" plain>
            Sensors values:
          </Divider>
          <Row>
            <Characteristic title='NH3' value={NH3} />
            <Characteristic title='CO' value={CO} />
            <Characteristic title='NO2' value={NO2} />
            <Characteristic title='C3H8' value={C3H8} />
            <Characteristic title='C4H10' value={C4H10} />
            <Characteristic title='CH4' value={CH4} />
            <Characteristic title='H2' value={H2} />
            <Characteristic title='C2H5OH' value={C2H5OH} />
            <Characteristic title='O2' value={O2} />
          </Row>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Marcin Jońca 2020</Footer>
      </Layout>
    </>
  );
};

const Characteristic: React.FC<{ title: string, value: string | number | undefined }> = ({ title, value = 'unknown' }) => {
  return (
    <Col xs={24} sm={12} md={6} xl={4}>
      <div style={{ padding: '10px' }}>
        <Statistic title={title} value={value} prefix={<LikeOutlined />} />
      </div>
    </Col>
  )
}
