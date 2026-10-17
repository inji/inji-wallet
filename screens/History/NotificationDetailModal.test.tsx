import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {NotificationDetailModal} from './NotificationDetailModal';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {VCActivityLog} from '../../components/ActivityLogEvent';
import {VPShareActivityLog} from '../../components/VPShareActivityLogEvent';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      `${key}${options?.context ? `_${options.context}` : ''}${
        options?.idType ? `(${options.idType})` : ''
      }`,
    i18n: {language: 'en'},
  }),
}));

const SHARED_AT = new Date(2026, 9, 9, 15, 42).getTime();

const rowTexts = (getAllByLabelText: (label: RegExp) => any[]) =>
  getAllByLabelText(/^detailRow-/).map(row =>
    row.props.children.map((cell: any) => cell.props.children),
  );

describe('NotificationDetailModal', () => {
  it('shows who a credential was shared with and when', () => {
    const activity = new VCActivityLog({
      type: 'VC_SHARED',
      timestamp: SHARED_AT,
      deviceName: 'City Health Clinic',
      flow: VCItemContainerFlowType.VC_SHARE,
    });
    const {getByLabelText, getAllByLabelText} = render(
      <NotificationDetailModal
        activity={activity}
        onClose={jest.fn()}
        onBackToWallet={jest.fn()}
      />,
    );

    expect(getByLabelText('notificationDetailTitle').props.children).toBe(
      'notificationTitles.credentialShared_device(VcDetails:identityCard)',
    );
    expect(rowTexts(getAllByLabelText)).toEqual([
      ['detail.credential', 'VcDetails:identityCard'],
      ['detail.sharedWith', 'City Health Clinic'],
      ['detail.date', '09 Oct 2026, 3:42 PM'],
    ]);
  });

  it('uses the card and issuer names saved with the log', () => {
    const activity = new VCActivityLog({
      type: 'VC_DOWNLOADED',
      timestamp: SHARED_AT,
      credentialName: 'National ID',
      issuerName: 'National Identity Authority',
    });
    const {getByLabelText, getAllByLabelText} = render(
      <NotificationDetailModal
        activity={activity}
        onClose={jest.fn()}
        onBackToWallet={jest.fn()}
      />,
    );

    expect(getByLabelText('notificationDetailText').props.children).toBe(
      'text.VC_DOWNLOADED_issuer(National ID)',
    );
    expect(rowTexts(getAllByLabelText)).toEqual([
      ['detail.credential', 'National ID'],
      ['detail.issuedBy', 'National Identity Authority'],
      ['detail.date', '09 Oct 2026, 3:42 PM'],
    ]);
  });

  it("names the issuer from its metadata for logs saved without the issuer's name", () => {
    const activity = new VCActivityLog({
      type: 'VC_STATUS_CHANGED',
      vcStatus: 'REVOKED',
      timestamp: SHARED_AT,
    });
    const {getByLabelText, getAllByLabelText} = render(
      <NotificationDetailModal
        activity={activity}
        wellknown={{display: [{name: 'Road Transport Authority'}]}}
        onClose={jest.fn()}
        onBackToWallet={jest.fn()}
      />,
    );

    expect(getByLabelText('notificationDetailText').props.children).toBe(
      'text.VC_STATUS_CHANGED.REVOKED_issuer(VcDetails:identityCard)',
    );
    expect(rowTexts(getAllByLabelText)).toContainEqual([
      'detail.issuedBy',
      'Road Transport Authority',
    ]);
  });

  it('uses the unnamed text when the issuer is unknown', () => {
    const activity = new VCActivityLog({
      type: 'VC_STATUS_CHANGED',
      vcStatus: 'REVOKED',
      timestamp: SHARED_AT,
    });
    const {getByLabelText} = render(
      <NotificationDetailModal
        activity={activity}
        onClose={jest.fn()}
        onBackToWallet={jest.fn()}
      />,
    );

    expect(getByLabelText('notificationDetailText').props.children).toBe(
      'text.VC_STATUS_CHANGED.REVOKED(VcDetails:identityCard)',
    );
  });

  it('shows the status for a status change', () => {
    const activity = new VCActivityLog({
      type: 'VC_STATUS_CHANGED',
      vcStatus: 'REVOKED',
      timestamp: SHARED_AT,
    });
    const {getAllByLabelText} = render(
      <NotificationDetailModal
        activity={activity}
        onClose={jest.fn()}
        onBackToWallet={jest.fn()}
      />,
    );

    expect(rowTexts(getAllByLabelText)).toContainEqual([
      'detail.status',
      'VcDetails:revoked',
    ]);
  });

  it('lists the verifier and every shared detail for an in-person share', () => {
    const activity = new VCActivityLog({
      type: 'VC_SHARED_IN_PERSON',
      timestamp: SHARED_AT,
      deviceName: 'Metro Traffic Police',
      credentialName: 'Driving Licence',
      sharedDetails: ['family_name', 'portrait', 'age_over_18', 'birth_date'],
    });
    const {getByLabelText, getAllByLabelText} = render(
      <NotificationDetailModal
        activity={activity}
        onClose={jest.fn()}
        onBackToWallet={jest.fn()}
      />,
    );

    expect(getByLabelText('notificationDetailTitle').props.children).toBe(
      'notificationTitles.credentialShared_device(Driving Licence)',
    );
    expect(getByLabelText('notificationDetailText').props.children).toBe(
      'text.VC_SHARED_IN_PERSON_details(Driving Licence)',
    );
    expect(rowTexts(getAllByLabelText)).toEqual([
      ['detail.credential', 'Driving Licence'],
      ['detail.sharedWith', 'Metro Traffic Police'],
      [
        'detail.details',
        'Family name, portrait, age over 18 listAnd birth date',
      ],
      ['detail.date', '09 Oct 2026, 3:42 PM'],
    ]);
  });

  it('names the verifier and the shared cards for an online share', () => {
    const activity = new VPShareActivityLog({
      type: 'SHARED_SUCCESSFULLY',
      timestamp: SHARED_AT,
      verifierName: 'City Health Clinic',
      credentialName: 'National ID',
    });
    const {getByLabelText, getAllByLabelText} = render(
      <NotificationDetailModal
        activity={activity}
        onClose={jest.fn()}
        onBackToWallet={jest.fn()}
      />,
    );

    expect(getByLabelText('notificationDetailTitle').props.children).toBe(
      'notificationTitles.presentationShared_verifier',
    );
    expect(getByLabelText('notificationDetailText').props.children).toBe(
      'text.vp.SHARED_credentials',
    );
    expect(rowTexts(getAllByLabelText)).toEqual([
      ['detail.credential', 'National ID'],
      ['detail.sharedWith', 'City Health Clinic'],
      ['detail.date', '09 Oct 2026, 3:42 PM'],
    ]);
  });

  it('shows only the date for an online share logged without names', () => {
    const activity = new VPShareActivityLog({
      type: 'USER_DECLINED_CONSENT',
      timestamp: SHARED_AT,
    });
    const {getByLabelText, getAllByLabelText} = render(
      <NotificationDetailModal
        activity={activity}
        onClose={jest.fn()}
        onBackToWallet={jest.fn()}
      />,
    );

    expect(getByLabelText('notificationDetailTitle').props.children).toBe(
      'notificationTitles.requestDeclined',
    );
    expect(rowTexts(getAllByLabelText)).toEqual([
      ['detail.date', '09 Oct 2026, 3:42 PM'],
    ]);
  });

  it('wires the two buttons', () => {
    const onClose = jest.fn();
    const onBackToWallet = jest.fn();
    const {getByLabelText} = render(
      <NotificationDetailModal
        activity={
          new VCActivityLog({type: 'VC_RECEIVED', timestamp: SHARED_AT})
        }
        onClose={onClose}
        onBackToWallet={onBackToWallet}
      />,
    );

    fireEvent.press(getByLabelText('backToWallet'));
    fireEvent.press(getByLabelText('viewSharingHistory'));

    expect(onBackToWallet).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
