import React from 'react';
import Svg, {Image} from 'react-native-svg';
import {Theme} from './styleUtils';
import Home from '../../assets/Home_tab_icon.svg';
import History from '../../assets/History_tab_icon.svg';
import ShareWithSelfie from '../../assets/Share_with_selfie.svg';
import CheckedIcon from '../../assets/CheckedIcon.svg';
import UnCheckedIcon from '../../assets/UnCheckedIcon.svg';
import Share from '../../assets/Scan_tab_icon.svg';
import Settings from '../../assets/Settings.svg';
import PinICon from '../../assets/Pin_Icon.svg';
import LockIcon from '../../assets/Lock_Icon1.svg';
import DigitalIdentity from '../../assets/Digital_Identity_Icon1.svg';
import ReceiveCard from '../../assets/Receive_Card.svg';
import ReceivedCards from '../../assets/Received_Cards.svg';
import ProgressIcon from '../../assets/Progress_Icon1.svg';
import testIDProps from '../../shared/commonUtil';
import Logo from '../../assets/Inji_Logo.svg';
import WarningLogo from '../../assets/Warning_Icon.svg';
import OtpVerificationIcon from '../../assets/Otp_Verification_Icon.svg';
import FlipCameraIcon from '../../assets/Flip_Camera_Icon.svg';
import CameraCaptureIcon from '../../assets/Camera_Capture_Icon.svg';
import SuccessLogo from '../../assets/Success_Message_Icon1.svg';
import ErrorLogo from '../../assets/Error_Message_Icon.svg';
import SuccessHomeIcon from '../../assets/Success_home_iocn.svg';
import SuccessHistoryIcon from '../../assets/Success_history_iocn.svg';
import NoInternetConnection from '../../assets/No_Internet_Connection.svg';
import SomethingWentWrong from '../../assets/Something_Went_Wrong.svg';
import ErrorOccurred from '../../assets/Error_Occurred.svg';
import MagnifierZoom from '../../assets/Magnifier_Zoom.svg';
import GoogleDriveIcon from '../../assets/Gdrive_Logo.svg';
import GoogleDriveIconSmall from '../../assets/google-drive-28.svg';
import ICloudLogo from '../../assets/Icloud-Logo.svg';
import KebabIcon from '../../assets/Detailed_view_kebab_icon.svg';
import {displayType} from '../../machines/Issuers/IssuersMachine';
import {IssuerProps} from '../openId4VCI/Issuer';
import Backup from '../../assets/Backup.svg';
import PermissionDenied from '../../assets/Permission_Denied.svg';
import OutlinedShieldedIcon from '../../assets/Outlined_Shielded_Icon.svg';
import OutlinedPinIcon from '../../assets/Outlined_Pin_Icon.svg';
import OutlinedDeleteIcon from '../../assets/Outlined_Delete_Icon.svg';
import OutlinedScheduleIcon from '../../assets/Outlined_Schedule_Icon.svg';
import OutlinedShareWithSelfieIcon from '../../assets/Outlined_Share_With_Selfie_Icon.svg';
import OutlinedShareIcon from '../../assets/Outlined_Share_Icon.svg';
import ColoredInfo from '../../assets/Colored_Info.svg';
import Info from '../../assets/Info.svg';
import Search from '../../assets/Search.svg';
import CloudUploadDoneIcon from '../../assets/Cloud_Upload_Done_Icon.svg';
import SettingsLanguage from '../../assets/Language_Icon.svg';
import SettingsBiometric from '../../assets/biometric_unlock.svg';
import SettingsAboutInji from '../../assets/about_inji.svg';
import SettingsBackup from '../../assets/cloud_upload.svg';
import SettingsLogOut from '../../assets/logout_icon.svg';
import RestoreIcon from '../../assets/restoreIconBackup.svg';
import QuestionIcon from '../../assets/questionIcon.svg';
import CopyIcon from '../../assets/file_copy.svg';
import StarIcon from '../../assets/credentialRegestryStar.svg';
import SelectedCheckBox from '../../assets/Selected_Check_Box.svg';
import ReverifyIcon from '../../assets/Reverify.svg';
import Logomark from '../../assets/Logomark.svg';
import StatusValidIcon from '../../assets/Status_Valid_Icon.svg';
import StatusPendingIcon from '../../assets/Status_Pending_Icon.svg';
import StatusExpiredIcon from '../../assets/Status_Expired_Icon.svg';
import StatusRevokedIcon from '../../assets/Status_Revoked_Icon.svg';
import WalletActivatedIcon from '../../assets/Wallet_Activated_Icon.svg';
import WalletUnActivatedIcon from '../../assets/Wallet_UnActivated_Icon.svg';
import WalletActivatedLargeIcon from '../../assets/Wallet_Activated_Large_Icon.svg';
import WalletUnActivatedLargeIcon from '../../assets/Wallet_UnActivated_Large_Icon.svg';
import DoneIcon from "../../assets/done-icon.svg"
import CircleArrowRight from "../../assets/arrow-circle-broken-right.svg"

export class SvgImage {
  static selectedCheckBox() {
    return <SelectedCheckBox />;
  }
  static copyIcon(): React.ReactNode {
    return (
      <CopyIcon
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }
  static questionIcon() {
    return (
      <QuestionIcon
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }
  static logOutIcon(): any {
    return (
      <SettingsLogOut
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }

  static restoreIcon(): any {
    return (
      <RestoreIcon
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }

  static defaultIssuerLogo(defaultLogo: any) {
    const DefaultLogo = defaultLogo;
    return <DefaultLogo />;
  }

  static starIcon() {
    return (
      <StarIcon
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }

  static MosipLogo(props: LogoProps) {
    const {width, height} = props;
    return <Logo width={width} height={height} />;
  }

  static kebabIcon(testId: string) {
    return (
      <KebabIcon
        {...testIDProps(testId)}
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }

  static walletUnActivatedIcon(width = 16, height = 20) {
    return (
      <WalletUnActivatedIcon
        width={width}
        height={height}
        {...testIDProps('wallet-unactivated-icon')}
      />
    );
  }

  static walletActivatedIcon(width = 16, height = 20) {
    return (
      <WalletActivatedIcon
        width={width}
        height={height}
        {...testIDProps('wallet-activated-icon')}
      />
    );
  }

  static WalletUnActivatedLargeIcon() {
    return (
      <WalletUnActivatedLargeIcon
        {...testIDProps('wallet-unactivated-large-icon')}
      />
    );
  }

  static WalletActivatedLargeIcon() {
    return (
      <WalletActivatedLargeIcon
        {...testIDProps('wallet-activated-large-icon')}
      />
    );
  }

  static walletActivatedLargeIcon() {
    return (
      <WalletActivatedLargeIcon {...testIDProps('walletActivatedLargeIcon')} />
    );
  }

  static home(focused: boolean) {
    //NOTE: Here tab icons names should be same with key "name" in main.ts
    return (
      <Home
        color1={
          focused ? Theme.Colors.linearGradientStart : Theme.Colors.GrayIcon
        }
        color2={
          focused ? Theme.Colors.linearGradientEnd : Theme.Colors.GrayIcon
        }
      />
    );
  }

  static share(focused: boolean) {
    //NOTE: Here tab icons names should be same with key "name" in main.ts
    return (
      <Share
        color1={
          focused ? Theme.Colors.linearGradientStart : Theme.Colors.GrayIcon
        }
        color2={
          focused ? Theme.Colors.linearGradientEnd : Theme.Colors.GrayIcon
        }
      />
    );
  }

  static OutlinedShareIcon() {
    return (
      <OutlinedShareIcon
        {...testIDProps('outlined-share-icon')}
        style={{
          marginLeft: 5,
        }}
      />
    );
  }

  static OutlinedShareWithSelfieIcon() {
    return (
      <OutlinedShareWithSelfieIcon
        {...testIDProps('outlined-share-with-selfie-icon')}
        style={{
          marginLeft: 5,
        }}
      />
    );
  }

  static outlinedDeleteIcon() {
    return (
      <OutlinedDeleteIcon
        {...testIDProps('outlined-delete-icon')}
        style={{
          marginLeft: 5,
        }}
      />
    );
  }

  static OutlinedScheduleIcon() {
    return (
      <OutlinedScheduleIcon
        {...testIDProps('outlined-schedule-icon')}
        style={{
          marginLeft: 5,
        }}
      />
    );
  }

  static OutlinedShieldedIcon() {
    return (
      <OutlinedShieldedIcon
        {...testIDProps('outlined-shielded-icon')}
        style={{
          marginLeft: 5,
        }}
      />
    );
  }

  static ReverifyIcon() {
    return <ReverifyIcon />;
  }

  static OutlinedPinIcon() {
    return <OutlinedPinIcon {...testIDProps('outlinedPinIcon')} />;
  }

  static history(focused: boolean) {
    //NOTE: Here tab icons names should be same with key "name" in main.ts
    return (
      <History
        color1={
          focused ? Theme.Colors.linearGradientStart : Theme.Colors.GrayIcon
        }
        color2={
          focused ? Theme.Colors.linearGradientEnd : Theme.Colors.GrayIcon
        }
      />
    );
  }

  static settings(focused: boolean) {
    //NOTE: Here tab icons names should be same with key "name" in main.ts
    return (
      <Settings
        color1={
          focused ? Theme.Colors.linearGradientStart : Theme.Colors.GrayIcon
        }
        color2={
          focused ? Theme.Colors.linearGradientEnd : Theme.Colors.GrayIcon
        }
      />
    );
  }

  static pinIcon(customStyle?: object) {
    return (
      <PinICon
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        style={[Theme.Styles.pinIcon, customStyle]}
        {...testIDProps('pinIcon')}
      />
    );
  }

  static InjiSmallLogo() {
    const InjiLogoSmall = Theme.InjiLogoSmall;
    return <InjiLogoSmall {...testIDProps('injiSmallLogo')} />;
  }

  static ProgressIcon() {
    return (
      <ProgressIcon
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        color3={Theme.Colors.LinearGradientStroke}
        {...testIDProps('progressingLogo')}
      />
    );
  }

  static LockIcon() {
    return (
      <LockIcon
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        style={{alignSelf: 'center'}}
      />
    );
  }

  static InjiLogo(props: LogoProps) {
    const InjiLogo = Theme.HomeScreenLogo;
    return (
      <InjiLogo
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        width={props.width}
        height={props.height}
        {...testIDProps('injiLogo')}
      />
    );
  }

  static DigitalIdentity() {
    return (
      <DigitalIdentity
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
      />
    );
  }

  static ReceiveCard() {
    return (
      <ReceiveCard
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        stroke={Theme.Colors.IconBg}
      />
    );
  }

  static ReceivedCards() {
    return (
      <ReceivedCards
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        stroke={Theme.Colors.IconBg}
      />
    );
  }

  static IssuerIcon(issuer: IssuerProps) {
    return (
      <Svg
        width="40"
        height="40"
        {...testIDProps(`issuerIcon-${issuer.testID}`)}>
        <Image
          href={getIssuerLogo(issuer.displayDetails)}
          x="0"
          y="0"
          height="40"
          width="40"
        />
      </Svg>
    );
  }

  static WarningLogo() {
    return <WarningLogo />;
  }

  static OtpVerificationIcon() {
    return (
      <OtpVerificationIcon
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
      />
    );
  }

  static FlipCameraIcon() {
    const {width, height} = Theme.CameraEnabledStyles.cameraFlipIcon;
    return (
      <FlipCameraIcon
        {...testIDProps('flipCameraIcon')}
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        width={width}
        height={height}
      />
    );
  }

  static CameraCaptureIcon() {
    return (
      <CameraCaptureIcon
        {...testIDProps('CameraCaptureIcon')}
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
      />
    );
  }

  static DataBackupIcon(width: number, height: number) {
    return (
      <Backup
        {...testIDProps('dataBackupIcon')}
        color1={Theme.Colors.Icon}
        width={width}
        height={height}
      />
    );
  }

  static SuccessLogo() {
    return <SuccessLogo {...testIDProps('SuccessLogo')} />;
  }

  static SuccessHomeIcon() {
    return (
      <SuccessHomeIcon
        {...testIDProps('SuccessHomeIcon')}
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        stroke={Theme.Colors.IconBg}
      />
    );
  }

  static SuccessHistoryIcon() {
    return (
      <SuccessHistoryIcon
        {...testIDProps('SuccessHistoryIcon')}
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        stroke={Theme.Colors.IconBg}
      />
    );
  }

  static ErrorLogo() {
    return <ErrorLogo {...testIDProps('ErrorLogo')} />;
  }

  static PermissionDenied() {
    return <PermissionDenied {...testIDProps('permissionDeniedImage')} />;
  }

  static CloudUploadDoneIcon() {
    return <CloudUploadDoneIcon {...testIDProps('cloudUploadDoneIcon')} />;
  }

  static NoInternetConnection() {
    return (
      <NoInternetConnection {...testIDProps('noInternetConnectionImage')} />
    );
  }

  static SomethingWentWrong() {
    return <SomethingWentWrong {...testIDProps('somethingWentWrongImage')} />;
  }

  static ErrorOccurred() {
    return <ErrorOccurred {...testIDProps('errorOccurredImage')} />;
  }

  static MagnifierZoom() {
    return <MagnifierZoom />;
  }

  static coloredInfo() {
    return (
      <ColoredInfo
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
        {...testIDProps('coloredInfoIcon')}
      />
    );
  }

  static info() {
    return (
      <Info
        color1={Theme.Colors.tooltipIcon}
        width={14}
        height={14}
        {...testIDProps('infoIcon')}
      />
    );
  }

  static ShareWithSelfie() {
    return (
      <ShareWithSelfie
        color1={Theme.Colors.linearGradientStart}
        color2={Theme.Colors.linearGradientEnd}
        {...testIDProps('shareWithSelfieIcon')}
      />
    );
  }

  static CheckedIcon() {
    return (
      <CheckedIcon color1={Theme.Colors.Icon} {...testIDProps('checkedIcon')} />
    );
  }

  static UnCheckedIcon() {
    return <UnCheckedIcon {...testIDProps('unCheckedIcon')} />;
  }

  static GoogleDriveIcon(width: number, height: number) {
    return (
      <GoogleDriveIcon
        width={width}
        height={height}
        {...testIDProps('googleDriveIcon')}
      />
    );
  }

  static GoogleDriveIconSmall(width: number, height: number) {
    return (
      <GoogleDriveIconSmall
        width={width}
        height={height}
        {...testIDProps('googleDriveIconSmall')}
      />
    );
  }

  static ICloudIcon(width: number, height: number) {
    return (
      <ICloudLogo
        width={width}
        height={height}
        {...testIDProps('iCloudIcon')}
      />
    );
  }

  static SearchIcon() {
    return <Search {...testIDProps('searchIcon')} />;
  }

  static settingsLanguageIcon(size) {
    return (
      <SettingsLanguage
        width={size}
        height={size}
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }

  static fingerprintIcon(size?: number | undefined) {
    return (
      <SettingsBiometric
        height={size}
        width={size}
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }

  static abotInjiIcon() {
    return (
      <SettingsAboutInji
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }

  static backUpAndRestoreIcon(height: number, width: number) {
    return (
      <SettingsBackup
        height={height}
        width={width}
        color1={Theme.Colors.linearIconGradientStart}
        color2={Theme.Colors.linearIconGradientEnd}
      />
    );
  }
  static logoIcon(height: number, width: number) {
    return <Logomark height={height} width={width} />;
  }

  static statusValidIcon(width = 24, height = 24) {
    return (
      <StatusValidIcon
        width={width}
        height={height}
        {...testIDProps('statusValidIcon')}
      />
    );
  }

  static statusPendingIcon(width = 24, height = 24) {
    return (
      <StatusPendingIcon
        width={width}
        height={height}
        {...testIDProps('statusPendingIcon')}
      />
    );
  }

  static statusExpiredIcon(width = 24, height = 24) {
    return (
      <StatusExpiredIcon
        width={width}
        height={height}
        {...testIDProps('statusExpiredIcon')}
      />
    );
  }

  static statusRevokedIcon(width = 24, height = 24) {
    return (
      <StatusRevokedIcon
        width={width}
        height={height}
        {...testIDProps('statusRevokedIcon')}
      />
    );
  }

  static doneIcon(color = Theme.Colors.disabled, height = 16, width = 16, testID = 'doneIcon') {
    return (
      <DoneIcon
        color={color}
        {...testIDProps(testID)}
        height={height}
        width={width}
      />
    )
  }

  static circleArrowRight(color = Theme.Colors.disabled, height = 16, width = 16, testID = 'circleArrowRightIcon') {
    return (
      <CircleArrowRight
        width={width}
        height={height}
        color={color}
        {...testIDProps(testID)}
      />
    )
  }
}

function getIssuerLogo(props: displayType) {
  return {uri: props.logo.url || props.logo.uri};
}

interface LogoProps {
  width: number;
  height: number;
}
