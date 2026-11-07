import {formatDistanceToNow} from 'date-fns';
import * as DateFnsLocale from 'date-fns/locale';
import {TFunction} from 'react-i18next';
import {ActivityLog} from './ActivityLogEvent';
import {VCItemContainerFlowType} from '../shared/Utils';
import type {MdocShareLogType} from '../machines/mdocPresentation/mdocPresentationModel';

/** One card's part in an in-person mdoc share (Share nearby → Mobile ID QR code). */
export class MdocShareActivityLog implements ActivityLog {
  type: MdocShareLogType | '';
  timestamp: number;
  flow: string;
  /** Empty when the wallet had no card for the requested document. */
  _vcKey: string;
  issuer: string;
  credentialConfigurationId: string;
  docType: string;
  cardName: string;
  readerName: string;
  readerTrust: string;
  /** Element identifiers sent; empty when nothing was sent. */
  details: string[];

  constructor({
    type = '' as MdocShareLogType | '',
    timestamp = Date.now(),
    flow = VCItemContainerFlowType.MDOC_SHARE as string,
    _vcKey = '',
    issuer = '',
    credentialConfigurationId = '',
    docType = '',
    cardName = '',
    readerName = '',
    readerTrust = '',
    details = [] as string[],
  } = {}) {
    this.type = type;
    this.timestamp = timestamp;
    this.flow = flow;
    this._vcKey = _vcKey;
    this.issuer = issuer;
    this.credentialConfigurationId = credentialConfigurationId;
    this.docType = docType;
    this.cardName = cardName;
    this.readerName = readerName;
    this.readerTrust = readerTrust;
    this.details = details;
  }

  getActionText(t: TFunction) {
    return `${t(`ActivityLogText:mdocSharing:${this.type}`, {
      card: this.cardName,
      count: this.details.length,
    })}`;
  }

  static getLogFromObject(
    data: ConstructorParameters<typeof MdocShareActivityLog>[0],
  ): MdocShareActivityLog {
    return new MdocShareActivityLog(data);
  }

  getActionLabel(language: string) {
    return [
      this.readerName,
      formatDistanceToNow(this.timestamp, {
        addSuffix: true,
        locale: DateFnsLocale[language as keyof typeof DateFnsLocale],
      }),
    ]
      .filter(label => label?.trim() !== '')
      .join(' · ');
  }
}
