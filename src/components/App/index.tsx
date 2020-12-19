import { Button, Col, Divider, notification, Row, Statistic, Tag } from 'antd';
import Layout from 'antd/lib/layout';
import { Content, Footer } from 'antd/lib/layout/layout';
import React, { useState } from "react";
import { CheckCircleOutlined, DisconnectOutlined, ExperimentOutlined, FieldTimeOutlined, LikeOutlined, RightCircleOutlined } from '@ant-design/icons';
import { AIR_CONDITION_CHARACTERSTICS, Characteristic, SERVICE_UUID_3, SERVICE_UUID, SERVICE_UUID_2 } from "../../consts";

type CharacteristicValueType = string | number | undefined;
interface CharacteristicViewProps {
  title: string;
  value: string | number | undefined;
  icon?: React.ReactNode;
}

const enc = new TextDecoder("utf-8");

let server: BluetoothRemoteGATTServer;
let device: BluetoothDevice | undefined;

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
  const [UPTIME, setUPTIME] = useState<CharacteristicValueType>(undefined);
  const [status, setStatus] = useState<'disconnected' | 'disconnecting' | 'connected' | 'error'>('disconnected');

  const handleDisconnectBtnClick = async () => {
    if (status === 'connected' && server) {
      setStatus('disconnecting');
      notification.info({
        message: `Disconnecting...`,
        description: '',
      });
      server.disconnect();
    }
  }

  const handleCharacteristicValueChanged = (event: Event) => ({ type }: Characteristic) => {
    const { target }: any = event;
    if (!event || !target) {
      return;
    }
    const { value } = target;
    const decodedValue = enc.decode(value);
    switch (type) {
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
      case 'UPTIME':
        setUPTIME(decodedValue);
        break;
      default:
        break;
    }
  }

  const handleConnectBtnClick = async () => {
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            // services: [SERVICE_UUID, SERVICE_UUID_2],
            name: "Air condition GATT server"
          }
        ],
        optionalServices: [SERVICE_UUID, SERVICE_UUID_2, SERVICE_UUID_3]
      });
    } catch (error) {
      notification.info({
        message: `Connection aborted`,
        description: `${error}`
      });
      setStatus('error');
      console.error(error);
      return;
    }

    if (!device || !device.gatt) {
      return;
    }

    const deviceDisconnectEventHandler = (event: Event) => {
      notification.info({
        message: `Device disconnected`,
      });
      setStatus('disconnected');
      if (device) {
        device.removeEventListener('gattserverdisconnected', deviceDisconnectEventHandler);
      }
    }

    device.addEventListener('gattserverdisconnected', deviceDisconnectEventHandler);

    server = await device.gatt.connect();

    const services = await server.getPrimaryServices();

    const createCharacteristicsNotification = async (characteristic: BluetoothRemoteGATTCharacteristic) => {
      try {
        const airConditionCharacteristics = AIR_CONDITION_CHARACTERSTICS.find(c => c.uuid === characteristic.uuid);
        if (!airConditionCharacteristics) {
          notification.error({
            message: `Characteristic with UUID: ${characteristic.uuid} not found!`,
            description: '',
          });
          return;
        }
        const c = await characteristic.startNotifications();
        c.addEventListener("characteristicvaluechanged", event => handleCharacteristicValueChanged(event)(airConditionCharacteristics));
      } catch (error) {
        notification.error({
          message: `Error`,
          description: JSON.stringify(error),
        });
        console.error(error);
      }
    }

    services.forEach(async service => {
      console.log(service);

      const serviceCharacteristics = await service.getCharacteristics();

      serviceCharacteristics.forEach(async characteristic => createCharacteristicsNotification(characteristic));
    });

    notification.success({
      message: `Connected`,
      description: '',
    });
    setStatus('connected');

  };

  return (
    <>
      <Layout className="layout">
        <Content style={{
          margin: '20px 20px',
          padding: '15px 15px',
          backgroundColor: 'white'
        }}>
          <Row align='middle' justify='center'>
            <Col span={24}>
              <h1 style={{ textAlign: 'center' }}>
                Welcome to the <b>Air Condition</b> app
              </h1>
            </Col>
            <Col sm={24}>
              <p style={{ textAlign: 'center' }}>
                Enable the chrome flag{" "}
                <a href="chrome://flags/#enable-experimental-web-platform-features">
                  #enable-experimental-web-platform-features
                </a>{" "}
                <br />
                and open in a new window.
              </p>
            </Col>
            <Col sm={24} md={18} lg={12} xl={8}>
              <Row justify='space-between'>
                <Col style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0em 1em 0 0', display: 'inline-block', padding: 0 }}>
                      Status:
                    </p>
                    <Tag icon={<CheckCircleOutlined />} color={status === 'connected' ? "success" : 'blue'}>
                      {status === 'connected' ? `Connected` : `Disconnected`}
                    </Tag>
                  </div>
                </Col>
                <Col>
                  {status !== 'connected' &&
                    <Button type='primary' onClick={handleConnectBtnClick}>
                      Connect
                    </Button>
                  }
                  {status === 'connected' &&
                    <Button danger onClick={handleDisconnectBtnClick} icon={<DisconnectOutlined />}>
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
            <CharacteristicView title='NH3' value={NH3} />
            <CharacteristicView title='CO' value={CO} />
            <CharacteristicView title='NO2' value={NO2} />
            <CharacteristicView title='C3H8' value={C3H8} />
            <CharacteristicView title='C4H10' value={C4H10} />
            <CharacteristicView title='CH4' value={CH4} />
            <CharacteristicView title='H2' value={H2} />
            <CharacteristicView title='C2H5OH' value={C2H5OH} />
            <CharacteristicView title='O2' value={O2} />
            <CharacteristicView title='UPTIME' value={UPTIME} icon={<FieldTimeOutlined />} />
          </Row>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Marcin Jońca, 2020</Footer>
      </Layout>
    </>
  );
};

const CharacteristicView: React.FC<CharacteristicViewProps> = ({ title, value = 'unknown', icon = <></> }) => {
  return (
    <Col xs={24} sm={12} md={8} xl={6} xxl={4}>
      <div style={{ padding: '10px' }}>
        <Statistic title={title} value={value} prefix={icon} />
      </div>
    </Col>
  )
}
