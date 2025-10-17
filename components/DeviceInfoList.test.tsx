import React from 'react';
import {render} from '@testing-library/react-native';
import {DeviceInfoList, DeviceInfo} from './DeviceInfoList';

describe('DeviceInfoList Component', () => {
  const mockDeviceInfo: DeviceInfo = {
    deviceName: 'Samsung Galaxy S21',
    name: 'John Doe',
    deviceId: 'device123',
  };

  it('should render DeviceInfoList component', () => {
    const {toJSON} = render(<DeviceInfoList deviceInfo={mockDeviceInfo} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with receiver mode', () => {
    const {toJSON} = render(
      <DeviceInfoList deviceInfo={mockDeviceInfo} of="receiver" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render with sender mode', () => {
    const {toJSON} = render(
      <DeviceInfoList deviceInfo={mockDeviceInfo} of="sender" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render without of prop', () => {
    const {toJSON} = render(<DeviceInfoList deviceInfo={mockDeviceInfo} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should handle different device names', () => {
    const deviceNames = [
      'iPhone 14 Pro',
      'Google Pixel 7',
      'OnePlus 11',
      'Samsung Galaxy S23',
    ];

    deviceNames.forEach(deviceName => {
      const deviceInfo = {...mockDeviceInfo, deviceName};
      const {toJSON} = render(<DeviceInfoList deviceInfo={deviceInfo} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  it('should handle different user names', () => {
    const names = ['Alice Smith', 'Bob Johnson', 'Charlie Brown'];

    names.forEach(name => {
      const deviceInfo = {...mockDeviceInfo, name};
      const {toJSON} = render(<DeviceInfoList deviceInfo={deviceInfo} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  it('should handle different device IDs', () => {
    const deviceIds = ['device001', 'device002', 'device003'];

    deviceIds.forEach(deviceId => {
      const deviceInfo = {...mockDeviceInfo, deviceId};
      const {toJSON} = render(<DeviceInfoList deviceInfo={deviceInfo} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  it('should handle empty device name', () => {
    const deviceInfo = {...mockDeviceInfo, deviceName: ''};
    const {toJSON} = render(<DeviceInfoList deviceInfo={deviceInfo} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should handle long device names', () => {
    const deviceInfo = {
      ...mockDeviceInfo,
      deviceName: 'Very Long Device Name With Many Characters',
    };
    const {toJSON} = render(<DeviceInfoList deviceInfo={deviceInfo} />);
    expect(toJSON()).toBeTruthy();
  });
});
