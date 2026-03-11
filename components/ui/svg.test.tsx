import React from 'react';
import {render} from '@testing-library/react-native';
import {SvgImage} from './svg';

// The svg mock is already set up via jest.config moduleNameMapper
// Theme is auto-resolved, commonUtil is already mocked in jest-init

jest.mock('../../machines/Issuers/IssuersMachine', () => ({
  displayType: {},
}));

jest.mock('../openId4VCI/Issuer', () => ({
  IssuerProps: {},
}));

describe('SvgImage', () => {
  const noArgMethods = [
    'selectedCheckBox',
    'copyIcon',
    'questionIcon',
    'logOutIcon',
    'restoreIcon',
    'starIcon',
    'WalletUnActivatedLargeIcon',
    'WalletActivatedLargeIcon',
    'walletActivatedLargeIcon',
    'OutlinedShareIcon',
    'OutlinedShareWithSelfieIcon',
    'outlinedDeleteIcon',
    'OutlinedScheduleIcon',
    'OutlinedShieldedIcon',
    'ReverifyIcon',
    'OutlinedPinIcon',
    'InjiSmallLogo',
    'ProgressIcon',
    'LockIcon',
    'DigitalIdentity',
    'ReceiveCard',
    'ReceivedCards',
    'WarningLogo',
    'OtpVerificationIcon',
    'FlipCameraIcon',
    'CameraCaptureIcon',
    'SuccessLogo',
    'SuccessHomeIcon',
    'SuccessHistoryIcon',
    'ErrorLogo',
    'PermissionDenied',
    'CloudUploadDoneIcon',
    'NoInternetConnection',
    'SomethingWentWrong',
    'ErrorOccurred',
    'MagnifierZoom',
    'coloredInfo',
    'info',
    'ShareWithSelfie',
    'CheckedIcon',
    'UnCheckedIcon',
    'SearchIcon',
    'fingerprintIcon',
    'faceIdIcon',
    'abotInjiIcon',
  ];

  it.each(noArgMethods)('%s() returns a valid node', method => {
    expect((SvgImage as any)[method]()).toBeTruthy();
  });

  it('methods with arguments return valid nodes', () => {
    const MockLogo = () => null;
    expect(SvgImage.defaultIssuerLogo(MockLogo)).toBeTruthy();
    expect(SvgImage.MosipLogo({width: 100, height: 100})).toBeTruthy();
    expect(SvgImage.kebabIcon('testKebab')).toBeTruthy();
    expect(SvgImage.walletUnActivatedIcon(20, 24)).toBeTruthy();
    expect(SvgImage.walletActivatedIcon(20, 24)).toBeTruthy();
    expect(SvgImage.home(true)).toBeTruthy();
    expect(SvgImage.home(false)).toBeTruthy();
    expect(SvgImage.share(true)).toBeTruthy();
    expect(SvgImage.history(true)).toBeTruthy();
    expect(SvgImage.settings(true)).toBeTruthy();
    expect(SvgImage.pinIcon({marginTop: 5})).toBeTruthy();
    expect(SvgImage.InjiLogo({width: 200, height: 60})).toBeTruthy();
    expect(SvgImage.DataBackupIcon(40, 40)).toBeTruthy();
    expect(SvgImage.GoogleDriveIcon(40, 40)).toBeTruthy();
    expect(SvgImage.GoogleDriveIconSmall(28, 28)).toBeTruthy();
    expect(SvgImage.ICloudIcon(40, 40)).toBeTruthy();
    expect(SvgImage.settingsLanguageIcon(24)).toBeTruthy();
    expect(SvgImage.backUpAndRestoreIcon(24, 24)).toBeTruthy();
    expect(SvgImage.logoIcon(40, 40)).toBeTruthy();
    expect(SvgImage.statusValidIcon(32, 32)).toBeTruthy();
    expect(SvgImage.statusPendingIcon(32, 32)).toBeTruthy();
    expect(SvgImage.statusExpiredIcon(32, 32)).toBeTruthy();
    expect(SvgImage.statusRevokedIcon(32, 32)).toBeTruthy();
    expect(SvgImage.doneIcon('#000', 20, 20, 'testDone')).toBeTruthy();
    expect(SvgImage.circleArrowRight('#000', 20, 20, 'testArrow')).toBeTruthy();
    expect(SvgImage.adaptiveBiometricIcon('FACE', 24)).toBeTruthy();
    expect(SvgImage.adaptiveBiometricIcon('FINGERPRINT', 24)).toBeTruthy();
    expect(SvgImage.adaptiveBiometricIcon('NONE', 24)).toBeTruthy();
  });

  it('IssuerIcon renders with display details', () => {
    const issuer = {
      testID: 'testIssuer',
      displayDetails: {logo: {url: 'https://example.com/logo.png', uri: ''}},
    };
    expect(SvgImage.IssuerIcon(issuer as any)).toBeTruthy();
  });
});
