import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ImageBackgroundProps,
  TouchableOpacity,
  View,
} from 'react-native';
import {ActivityIndicator} from '../../ui/ActivityIndicator';

import {
  Credential,
  CredentialWrapper,
  VerifiableCredential,
  VerifiableCredentialData,
  WalletBindingResponse,
} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import {Button, Column, Row, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {QrCodeOverlay} from '../../QrCodeOverlay';
import {SvgImage} from '../../ui/svg';
import {isActivationNeeded} from '../../../shared/openId4VCI/Utils';
import {
  BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS,
  DETAIL_VIEW_BOTTOM_SECTION_FIELDS,
  Display,
  fieldItemIterator,
} from '../common/VCUtils';
import {VCFormat} from '../../../shared/VCFormat';

import testIDProps from '../../../shared/commonUtil';
import {ShareableInfoModal} from './ShareableInfoModal';
import {SvgCss} from 'react-native-svg/css';
import {QR_IMAGE_ID} from '../../../shared/constants';

const getProfileImage = (face: any) => {
  if (face) {
    return (
      <Image source={{uri: face}} style={Theme.Styles.detailedViewImage} />
    );
  }
  return <></>;
};

export const VCDetailView: React.FC<VCItemDetailsProps> = (
  props: VCItemDetailsProps,
) => {
  const {t} = useTranslation('VcDetails');
  const logo = props.verifiableCredentialData.issuerLogo;
  const face = props.verifiableCredentialData.face;
  const verifiableCredential = props.credential;
  const wellknownDisplayProperty = new Display(props.wellknown);

  const {width: deviceWidth} = Dimensions.get('window');
  const CARD_WIDTH = deviceWidth * 0.8;
  const CARD_SPACING = 16;

  const shouldShowHrLine = verifiableCredential => {
    let availableFieldNames: string[] = [];
    if (props.verifiableCredentialData.vcMetadata.format === VCFormat.ldp_vc) {
      availableFieldNames = Object.keys(
        verifiableCredential?.credentialSubject,
      );
    } else if (
      props.verifiableCredentialData.vcMetadata.format === VCFormat.mso_mdoc
    ) {
      const namespaces =
        verifiableCredential['issuerSigned']?.['nameSpaces'] ??
        verifiableCredential['nameSpaces'] ??
        {};
      Object.keys(namespaces).forEach(namespace => {
        (namespaces[namespace] as Array<Object>).forEach(element => {
          availableFieldNames.push(
            `${namespace}~${element['elementIdentifier']}`,
          );
        });
      });
    } else if (
      props.verifiableCredentialData.vcMetadata.format === VCFormat.vc_sd_jwt ||
      props.verifiableCredentialData.vcMetadata.format === VCFormat.dc_sd_jwt
    ) {
      availableFieldNames = Object.keys(
        verifiableCredential?.fullResolvedPayload,
      );
    }
    for (const fieldName of availableFieldNames) {
      if (
        BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS.includes(fieldName)
      ) {
        return true;
      }
    }

    return false;
  };
  const [showQrOverlay, setShowQrOverlay] = useState(false);

  const [shareModalVisible, setShareModalVisible] = useState(false);

  if (props.loadingSvg) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Column scroll>
        {Array.isArray(props.svgTemplate) && props.svgTemplate.length > 0 ? (
          <Column padding="30 0 0 0">
            <FlatList
              data={props.svgTemplate}
              keyExtractor={(_, index) => `svg-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={props.svgTemplate.length > 1}
              snapToInterval={
                props.svgTemplate.length > 1
                  ? CARD_WIDTH + CARD_SPACING
                  : undefined
              }
              decelerationRate="fast"
              snapToAlignment="start"
              contentContainerStyle={{
                paddingHorizontal: 16,
                justifyContent: 'center',
                alignItems:
                  props.svgTemplate.length === 1 ? 'center' : 'flex-start',
              }}
              ItemSeparatorComponent={() => (
                <View style={{width: CARD_SPACING}} />
              )}
              renderItem={({item}) => {
                let aspectRatio: number | null = null;
                const match = item.match(/viewBox="0 0 (\d+) (\d+)"/);
                if (match) {
                  const [, w, h] = match.map(Number);
                  aspectRatio = h / w;
                }

                const targetWidth =
                  props.svgTemplate.length === 1
                    ? deviceWidth - 32
                    : CARD_WIDTH;
                const targetHeight = aspectRatio
                  ? targetWidth * aspectRatio
                  : targetWidth * 0.7;

                return (
                  <Column style={{width: targetWidth}}>
                    <SvgCss
                      xml={item}
                      width="100%"
                      height={targetHeight}
                      preserveAspectRatio="xMidYMid meet"
                    />

                    <View style={{height: 12}} />

                    {item.includes(QR_IMAGE_ID) && (
                      <Button
                        testID="zoomQrCode"
                        title="Tap to zoom QR Code"
                        type="gradient"
                        size="Large"
                        onPress={() => setShowQrOverlay(true)}
                      />
                    )}
                  </Column>
                );
              }}
            />

            {showQrOverlay && (
              <QrCodeOverlay
                verifiableCredential={
                  props.credentialWrapper as unknown as VerifiableCredential
                }
                meta={props.verifiableCredentialData.vcMetadata}
                showInlineQr={false}
                forceVisible={true}
                onClose={() => setShowQrOverlay(false)}
              />
            )}
          </Column>
        ) : (
          <Column fill>
            <Column
              padding="10 10 3 10"
              backgroundColor={Theme.Colors.DetailedViewBackground}>
              <ImageBackground
                imageStyle={Theme.Styles.vcDetailBg}
                resizeMethod="scale"
                resizeMode="stretch"
                style={[
                  Theme.Styles.openCardBgContainer,
                  wellknownDisplayProperty.getBackgroundColor(),
                ]}
                source={
                  wellknownDisplayProperty.getBackgroundImage(
                    Theme.OpenCard,
                  ) as ImageBackgroundProps
                }>
                <Row padding="14 14 0 14" margin="0 0 0 0">
                  <Column crossAlign="center">
                    {getProfileImage(face)}
                    <QrCodeOverlay
                      verifiableCredential={
                        props.credentialWrapper as unknown as VerifiableCredential
                      }
                      meta={props.verifiableCredentialData.vcMetadata}
                      showInlineQr={true}
                    />
                    <Column
                      width={80}
                      height={59}
                      crossAlign="center"
                      margin="12 0 0 0">
                      <Image
                        {...testIDProps('issuerLogo')}
                        src={logo?.url}
                        alt={logo?.alt_text}
                        style={Theme.Styles.issuerLogo}
                        resizeMethod="scale"
                        resizeMode="contain"
                      />
                    </Column>
                  </Column>
                  <Column
                    align="space-evenly"
                    margin={'0 0 0 24'}
                    style={{flex: 1}}>
                    {fieldItemIterator(
                      props.fields,
                      props.wellknownFieldsFlag,
                      verifiableCredential,
                      props.wellknown,
                      wellknownDisplayProperty,
                      false,
                      props,
                    )}
                  </Column>
                </Row>
                <>
                  <View
                    style={[
                      Theme.Styles.hrLine,
                      {
                        borderBottomColor:
                          wellknownDisplayProperty.getTextColor(
                            Theme.Styles.hrLine.borderBottomColor,
                          ),
                      },
                    ]}></View>
                  <Column padding="0 14 14 14">
                    {shouldShowHrLine(verifiableCredential) &&
                      fieldItemIterator(
                        DETAIL_VIEW_BOTTOM_SECTION_FIELDS,
                        true,
                        verifiableCredential,
                        props.wellknown,
                        wellknownDisplayProperty,
                        true,
                        props,
                      )}
                  </Column>
                  {props.credential.disclosedKeys != null && (
                    <DisclosureInfoNote />
                  )}
                </>
              </ImageBackground>
            </Column>
          </Column>
        )}
      </Column>
      {!props.svgTemplate &&
        props.vcHasImage &&
        !props.verifiableCredentialData?.vcMetadata.isExpired && (
          <View
            style={{
              position: 'relative',
              backgroundColor: Theme.Colors.DetailedViewBackground,
            }}>
            {props.activeTab !== 1 &&
              (!props.walletBindingResponse &&
              isActivationNeeded(props.verifiableCredentialData?.issuer) ? (
                <Column
                  padding="10"
                  style={Theme.Styles.detailedViewActivationPopupContainer}>
                  <Row>
                    <Column crossAlign="flex-start" margin={'2 0 0 10'}>
                      {SvgImage.WalletUnActivatedLargeIcon()}
                    </Column>
                    <Column crossAlign="flex-start" margin={'5 18 13 8'}>
                      <Text
                        testID="offlineAuthDisabledHeader"
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 14,
                        }}
                        color={Theme.Colors.statusLabel}
                        margin={'0 18 0 0'}>
                        {t('offlineAuthDisabledHeader')}
                      </Text>
                      <Text
                        testID="offlineAuthDisabledMessage"
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                        }}
                        color={Theme.Colors.statusMessage}
                        margin={'0 18 0 0'}>
                        {t('offlineAuthDisabledMessage')}
                      </Text>
                    </Column>
                  </Row>
                  <Button
                    testID="enableVerification"
                    title={t('enableVerification')}
                    onPress={props.onBinding}
                    type="gradient"
                    size="Large"
                    disabled={
                      !props.verifiableCredentialData.vcMetadata.isVerified
                    }
                  />
                </Column>
              ) : (
                <Column
                  style={Theme.Styles.detailedViewActivationPopupContainer}
                  padding="10">
                  <Row>
                    <Column crossAlign="flex-start" margin={'2 0 0 10'}>
                      {SvgImage.WalletActivatedLargeIcon()}
                    </Column>
                    <Column crossAlign="flex-start" margin={'5 18 13 8'}>
                      <Text
                        testID="profileAuthenticated"
                        color={Theme.Colors.statusLabel}
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 14,
                        }}
                        margin={'0 18 0 0'}>
                        {isActivationNeeded(
                          props.verifiableCredentialData?.issuer,
                        )
                          ? t('profileAuthenticated')
                          : t('credentialActivated')}
                      </Text>
                    </Column>
                  </Row>
                </Column>
              ))}
          </View>
        )}
      {props.credential.disclosedKeys != null && (
        <View
          style={{
            padding: 16,
            backgroundColor: Theme.Colors.DetailedViewBackground,
            borderTopWidth: 1,
            borderTopColor: Theme.Colors.lightGreyBackgroundColor,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => setShareModalVisible(true)}
            testID="viewShareableInfoLink"
            style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Feather name="eye" size={20} color={'#007AFF'} />
            <Text
              style={{
                color: '#007AFF',
                fontSize: 16,
                fontFamily: 'Inter_500Medium',
              }}>
              {t('View Shareable Information')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ShareableInfoModal
        isVisible={shareModalVisible}
        onDismiss={() => setShareModalVisible(false)}
        disclosedPaths={Array.from(props.credential.disclosedKeys ?? {}) || []}
      />
    </>
  );
};

export const DisclosureInfoNote = () => {
  const {t} = useTranslation('VcDetails');
  return (
    <View style={Theme.DisclosureInfo.view}>
      <Row align="flex-start">
        <Icon
          name="share-square-o"
          size={18}
          color={Theme.Colors.DetailsLabel}
          style={{marginTop: 2, marginRight: 8}}
        />
        <Text style={Theme.DisclosureInfo.text}>{t('disclosureInfoNote')}</Text>
      </Row>
    </View>
  );
};

export interface VCItemDetailsProps {
  fields: any[];
  wellknown: any;
  wellknownFieldsFlag: boolean;
  credential: VerifiableCredential | Credential;
  verifiableCredentialData: VerifiableCredentialData;
  walletBindingResponse?: WalletBindingResponse;
  credentialWrapper: CredentialWrapper;
  onBinding?: () => void;
  activeTab?: Number;
  vcHasImage: boolean;
  svgTemplate?: string[] | null;
  svgRendererError?: string | null;
  loadingSvg?: string | null;
}
