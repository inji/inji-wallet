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
    const {toJSON, getByText} = render(
      <DeviceInfoList deviceInfo={mockDeviceInfo} />,
    );
    expect(toJSON()).toMatchSnapshot();
    expect(getByText('Samsung Galaxy S21')).toBeTruthy();
  });

  it('should render with receiver mode', () => {
    const {toJSON, getByText} = render(
      <DeviceInfoList deviceInfo={mockDeviceInfo} of="receiver" />,
    );
    expect(toJSON()).toMatchSnapshot();
    expect(getByText('requestedBy')).toBeTruthy();
  });

  it('should render with sender mode', () => {
    const {toJSON, getByText} = render(
      <DeviceInfoList deviceInfo={mockDeviceInfo} of="sender" />,
    );
    expect(toJSON()).toMatchSnapshot();
    expect(getByText('sentBy')).toBeTruthy();
  });

  it('should handle empty device name', () => {
    const deviceInfo = {...mockDeviceInfo, deviceName: ''};
    const {toJSON} = render(<DeviceInfoList deviceInfo={deviceInfo} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
