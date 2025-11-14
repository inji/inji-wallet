import {formatDistanceToNow} from 'date-fns';
import {getCredentialTypeFromWellKnown} from './VC/common/VCUtils';
import * as DateFnsLocale from 'date-fns/locale';
import {VCItemContainerFlowType} from '../shared/Utils';
import {TFunction} from 'react-i18next';

export type ActivityLogType =
  | '' // replacement for undefined
  | 'VC_SHARED'
  | 'VC_RECEIVED'
  | 'VC_RECEIVED_NOT_SAVED'
  | 'VC_DELETED'
  | 'VC_DOWNLOADED'
  | 'VC_SHARED_WITH_VERIFICATION_CONSENT'
  | 'VC_RECEIVED_WITH_PRESENCE_VERIFIED'
  | 'VC_RECEIVED_BUT_PRESENCE_VERIFICATION_FAILED'
  | 'PRESENCE_VERIFIED_AND_VC_SHARED'
  | 'PRESENCE_VERIFICATION_FAILED'
  | 'QRLOGIN_SUCCESFULL'
  | 'WALLET_BINDING_SUCCESSFULL'
  | 'WALLET_BINDING_FAILURE'
  | 'VC_REMOVED'
  | 'VC_STATUS_CHANGED'
  | 'TAMPERED_VC_REMOVED';

export interface ActivityLog {
  getActionText(t: TFunction, wellknown: Object | undefined);
}

export class VCActivityLog implements ActivityLog {
  id: string;
  credentialConfigurationId: string;
  _vcKey: string;
  timestamp: number;
  deviceName: string;
  type: ActivityLogType;
  issuer: string;
  flow: string;
  vcStatus?: string;

  constructor({
    id = '',
    idType = [],
    _vcKey = '',
    type = '',
    timestamp = Date.now(),
    deviceName = '',
    issuer = '',
    credentialConfigurationId = '',
    flow = VCItemContainerFlowType.VC_SHARE,
    vcStatus = '',
  } = {}) {
    this.id = id;
    this.idType = idType;
    this._vcKey = _vcKey;
    this.type = type;
    this.timestamp = timestamp;
    this.deviceName = deviceName;
    this.issuer = issuer;
    this.credentialConfigurationId = credentialConfigurationId;
    this.flow = flow;
    this.vcStatus = vcStatus;
  }

  getActionText(t: TFunction, wellknown: Object | undefined) {
    const formattedVcStatus = this.vcStatus ? `.${this.vcStatus}` : '';
    if (!!this.credentialConfigurationId && wellknown) {
      const cardType = getCredentialTypeFromWellKnown(
        wellknown,
        this.credentialConfigurationId,
      );
      return `${t(this.type + formattedVcStatus, {
        idType: cardType,
        vcStatus: this.vcStatus,
      })}`;
    }

    return `${t(this.type + formattedVcStatus, {idType: '', vcStatus: this.vcStatus})}`;
  }

  static getLogFromObject(data: Object): VCActivityLog {
    return new VCActivityLog(data);
  }

  getActionLabel(language: string) {
    return [
      this.deviceName,
      formatDistanceToNow(this.timestamp, {
        addSuffix: true,
        locale: DateFnsLocale[language],
      }),
    ]
      .filter(label => label?.trim() !== '')
      .join(' · ');
  }
}
