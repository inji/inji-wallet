import React from 'react';
import {useTranslation} from 'react-i18next';
import {TextItem} from './ui/TextItem';

export const DeviceInfoList: React.FC<DeviceInfoProps> = props => {
  const {t} = useTranslation('DeviceInfoList');

  return (
    <React.Fragment>
      <TextItem
        divider
        label={props.of === 'receiver' ? t('requestedBy') : t('sentBy')}
        text={t(props.deviceInfo.deviceName)}
      />
      {props.deviceInfo.name ? (
        <TextItem divider label={t('name')} text={props.deviceInfo.name} />
      ) : null}
      {props.deviceInfo.deviceId ? (
        <TextItem
          divider
          label={t('deviceRefNumber')}
          text={props.deviceInfo.deviceId}
        />
      ) : null}
    </React.Fragment>
  );
};

interface DeviceInfoProps {
  deviceInfo: DeviceInfo;
  of?: string;
}

export interface DeviceInfo {
  deviceName: string;
  name: string;
  deviceId: string;
}
