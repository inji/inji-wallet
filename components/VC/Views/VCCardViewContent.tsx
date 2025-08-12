import React from 'react';
import {ImageBackground, Pressable, View, Image, ImageBackgroundProps} from 'react-native';
import {VCMetadata} from '../../../shared/VCMetadata';
import {KebabPopUp} from '../../KebabPopUp';
import {Credential} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import {Column, Row} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {CheckBox, Icon} from 'react-native-elements';
import {SvgImage} from '../../ui/svg';
import {VcItemContainerProfileImage} from '../../VcItemContainerProfileImage';
import {isVCLoaded, getCredentialType, Display} from '../common/VCUtils';
import {VCItemFieldValue} from '../common/VCItemField';
import {WalletBinding} from '../../../screens/Home/MyVcs/WalletBinding';
import {VCVerification} from '../../VCVerification';
import {isActivationNeeded} from '../../../shared/openId4VCI/Utils';
import {VCItemContainerFlowType} from '../../../shared/Utils';
import {RemoveVcWarningOverlay} from '../../../screens/Home/MyVcs/RemoveVcWarningOverlay';
import {HistoryTab} from '../../../screens/Home/MyVcs/HistoryTab';
import {useCopilot} from 'react-native-copilot';
import {useTranslation} from 'react-i18next';
import testIDProps from '../../../shared/commonUtil';


export const VCCardViewContent: React.FC<VCItemContentProps> = ({isPinned = false, credential, verifiableCredentialData, wellknown, selectable, selected, service, onPress, flow, walletBindingResponse, KEBAB_POPUP, DISMISS, isKebabPopUp, vcMetadata, isInitialLaunch}) => {
  const wellknownDisplayProperty = new Display(wellknown);
    const vcSelectableButton =
    selectable &&
    (flow === VCItemContainerFlowType.VP_SHARE ? (
      <CheckBox
        checked={selected}
        checkedIcon={SvgImage.selectedCheckBox()}
        uncheckedIcon={
          <Icon
            name="check-box-outline-blank"
            color={Theme.Colors.uncheckedIcon}
            size={22}
          />
        }
        onPress={() => onPress()}
      />
    ) : (
      <CheckBox
        checked={selected}
        checkedIcon={
          <Icon name="check-circle" type="material" color={Theme.Colors.Icon} />
        }
        uncheckedIcon={
          <Icon
            name="radio-button-unchecked"
            color={Theme.Colors.uncheckedIcon}
          />
        }
        onPress={() => onPress()}
      />
    ));
  const issuerLogo = verifiableCredentialData.issuerLogo;
  const faceImage = verifiableCredentialData.face;
  const {start} = useCopilot();
  const {t} = useTranslation();

  return (
    <ImageBackground
      source={wellknownDisplayProperty.getBackgroundImage(Theme.CloseCard) as ImageBackgroundProps}
      resizeMode="stretch"
      imageStyle={Theme.Styles.vcBg}
      style={[
        Theme.Styles.backgroundImageContainer,
        wellknownDisplayProperty.getBackgroundColor(),
      ]}>
      <View
        onLayout={
          isInitialLaunch
            ? () => start(t('copilot:cardTitle'))
            : undefined
        }>
        <Row crossAlign="center" padding="3 0 0 3">
          <VcItemContainerProfileImage isPinned={isPinned} verifiableCredentialData={verifiableCredentialData} />
          <Column fill align={'space-around'} margin="0 10 0 10">
            <VCItemFieldValue
              key={'credentialType'}
              testID="credentialType"
              fieldValue={getCredentialType(wellknown)}
              fieldValueColor={wellknownDisplayProperty.getTextColor(
                Theme.Colors.Details,
              )}
            />
            <Row>
              <VCVerification
                vcMetadata={verifiableCredentialData?.vcMetadata}
                display={wellknownDisplayProperty}
              />
            </Row>
          </Column>

          {isVCLoaded(credential) && (
            <Image
              {...testIDProps('issuerLogo')}
              src={issuerLogo?.url}
              alt={issuerLogo?.alt_text}
              style={Theme.Styles.issuerLogo}
              resizeMode="cover"
            />
          )}

          {!Object.values(VCItemContainerFlowType).includes(flow) && (
            <>
              {!verifiableCredentialData?.vcMetadata.isExpired &&
                (!walletBindingResponse &&
                isActivationNeeded(verifiableCredentialData?.issuer)
                  ? SvgImage.walletUnActivatedIcon()
                  : SvgImage.walletActivatedIcon())}
              <Pressable
                onPress={KEBAB_POPUP}
                accessible={false}
                style={Theme.Styles.kebabPressableContainer}>
                <KebabPopUp
                  iconColor={wellknownDisplayProperty.getTextColor(
                    Theme.Colors.helpText,
                  )}
                  vcMetadata={vcMetadata}
                  iconName="dots-three-horizontal"
                  iconType="entypo"
                  isVisible={isKebabPopUp}
                  onDismiss={DISMISS}
                  service={service}
                  vcHasImage={faceImage !== undefined}
                />
              </Pressable>
            </>
          )}
          {vcSelectableButton}
        </Row>

        <WalletBinding service={service} vcMetadata={vcMetadata} />

        <RemoveVcWarningOverlay
          testID="removeVcWarningOverlay"
          service={service}
          vcMetadata={vcMetadata}
        />

        <HistoryTab service={service} vcMetadata={vcMetadata} />
      </View>
    </ImageBackground>
  );
};

export interface VCItemContentProps {
  context: any;
  credential: Credential;
  verifiableCredentialData: any;
  fields: [];
  wellknown: {};
  generatedOn: string;
  selectable: boolean;
  selected: boolean;
  isPinned?: boolean;
  service: any;
  onPress: () => void;
  isDownloading?: boolean;
  flow?: string;
  walletBindingResponse: {};
  KEBAB_POPUP: () => {};
  DISMISS: () => {};
  isKebabPopUp: boolean;
  vcMetadata: VCMetadata;
  isInitialLaunch?: boolean;
}