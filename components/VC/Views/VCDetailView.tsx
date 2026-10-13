import React, {useEffect, useRef, useState} from 'react';
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
import {
  IssuerQrCodeImage,
  IssuerQrCodePlaceholder,
} from '../../IssuerQrCodeImage';
import {
  getCredentialId,
  getCredissuerCredentialId,
  getIssuerQrCodeUrl,
  isCredissuerCredential,
} from '../../../shared/qr/issuerQrCode';
import {fetchIssuerQrCodeImage} from '../../../shared/credissuer/credentialsApi';
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

/** Key for one issuer-QR lookup: both inputs to the lookup, or null when there is no lookup. */
const getIssuerQrLookupKey = (
  credissuerCredentialId: string | null,
  vcId: string | null,
): string | null =>
  credissuerCredentialId === null
    ? null
    : JSON.stringify([credissuerCredentialId, vcId]);

export const VCDetailView: React.FC<VCItemDetailsProps> = (
  props: VCItemDetailsProps,
) => {
  const {t} = useTranslation('VcDetails');
  const logo = props.verifiableCredentialData.issuerLogo;
  const face = props.verifiableCredentialData.face;
  const verifiableCredential = props.credential;
  const wellknownDisplayProperty = new Display(props.wellknown);
  // The QR image the wallet saved for this credential (at download, or on the first open after
  // it). When there is one it is all the card needs: no lookup, no network.
  const walletCredential = props.credentialWrapper as unknown as
    | VerifiableCredential
    | undefined;
  const savedIssuerQrCode = walletCredential?.issuerQrCode ?? null;
  // The link inside the VC itself; it expires within a day, so it is only a last resort.
  const storedIssuerQrCodeUrl = getIssuerQrCodeUrl(verifiableCredential);
  // From the token response for new downloads. Older CredIssuer credentials carry it (or a
  // template-specific equivalent) in credentialSubject instead.
  const credissuerCredentialId =
    walletCredential?.credissuerCredentialId ??
    (isCredissuerCredential(verifiableCredential)
      ? getCredissuerCredentialId(verifiableCredential)
      : null);
  const vcId = getCredentialId(verifiableCredential);
  // Identifies which credential a lookup result belongs to. The result is stored together with
  // this key, and a result counts only while the key matches the credential being rendered.
  // Resetting state from the effect isn't enough: the effect runs after the render in which the
  // credential changed, so that render would still show the previous credential's QR.
  // Null once a QR is saved, which is what stops the lookup from running on every open.
  const issuerQrLookupKey = savedIssuerQrCode
    ? null
    : getIssuerQrLookupKey(credissuerCredentialId, vcId);
  const [issuerQrLookup, setIssuerQrLookup] = useState<{
    key: string;
    url: string | null;
  } | null>(null);
  // A CredIssuer card must not show any QR until the fresh lookup has settled. Otherwise the slot
  // shows a placeholder first (the stored image, or the wallet-generated QR when there is none),
  // and swaps to the fresh one only when the API answers, up to 15 s later. A verifier that scans
  // during that window gets a QR that doesn't verify, which made verification look intermittent.
  // Being derived, this is already true on the first render and on the first render after the
  // credential changes, so no frame ever shows a QR that belongs to nobody or to someone else.
  const isFetchingIssuerQrCode =
    issuerQrLookupKey !== null && issuerQrLookup?.key !== issuerQrLookupKey;
  const freshIssuerQrCodeUrl =
    issuerQrLookup?.key === issuerQrLookupKey ? issuerQrLookup.url : null;
  const issuerQrCodeUrl =
    savedIssuerQrCode ?? freshIssuerQrCodeUrl ?? storedIssuerQrCodeUrl;
  // The stored link expires within a day and the fresh one needs the network, so an issuer QR
  // image that fails to load is an expected case (offline, a day after download), not an edge
  // case. When it fails, the wallet-generated QR is shown instead, because it works offline.
  // The failed URL is stored rather than a boolean, so a different URL (e.g. after the credential
  // changes) is never mistaken for the one that failed and gets its own chance to load.
  const [failedIssuerQrCodeUrl, setFailedIssuerQrCodeUrl] = useState<
    string | null
  >(null);
  const showIssuerQrCode =
    !!issuerQrCodeUrl && issuerQrCodeUrl !== failedIssuerQrCodeUrl;

  // A ref, not an effect dependency: the parent passes a new function on every render, which
  // would otherwise restart the lookup each time.
  const onIssuerQrCodeFetchedRef = useRef(props.onIssuerQrCodeFetched);
  onIssuerQrCodeFetchedRef.current = props.onIssuerQrCodeFetched;

  useEffect(() => {
    const key = issuerQrLookupKey;
    if (!credissuerCredentialId || key === null) {
      return;
    }
    let cancelled = false;
    fetchIssuerQrCodeImage(credissuerCredentialId, vcId)
      .then(qrCode => {
        if (cancelled) return;
        setIssuerQrLookup({key, url: qrCode});
        // Saved with the credential, so this lookup happens once, not on every open.
        if (qrCode) {
          onIssuerQrCodeFetchedRef.current?.(qrCode, credissuerCredentialId);
        }
      })
      .catch(error => {
        console.error('Error fetching issuer QR code from CredIssuer:', error);
        // Settled with no fresh QR, so the link inside the VC or the wallet QR shows.
        if (!cancelled) setIssuerQrLookup({key, url: null});
      });
    return () => {
      cancelled = true;
    };
  }, [issuerQrLookupKey, credissuerCredentialId, vcId]);

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
        const entries = namespaces[namespace];
        if (Array.isArray(entries)) {
          entries.forEach((element: {elementIdentifier?: string}) => {
            const id = element?.elementIdentifier;
            if (typeof id === 'string' && id.length > 0) {
              availableFieldNames.push(`${namespace}~${id}`);
            }
          });
        } else if (entries && typeof entries === 'object') {
          // CBOR→JSON sometimes represents IssuerSigned nameSpaces as map(elementId → value), not an array.
          Object.keys(entries as Record<string, unknown>).forEach(elementId => {
            availableFieldNames.push(`${namespace}~${elementId}`);
          });
        }
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
                onCloseDetails={props.onCloseDetails}
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
                    {isFetchingIssuerQrCode ? (
                      <IssuerQrCodePlaceholder />
                    ) : showIssuerQrCode ? (
                      <IssuerQrCodeImage
                        qrCodeUrl={issuerQrCodeUrl}
                        onLoadError={setFailedIssuerQrCodeUrl}
                      />
                    ) : (
                      <QrCodeOverlay
                        verifiableCredential={
                          props.credentialWrapper as unknown as VerifiableCredential
                        }
                        meta={props.verifiableCredentialData.vcMetadata}
                        showInlineQr={true}
                        onCloseDetails={props.onCloseDetails}
                      />
                    )}
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
  /** Closes the whole VC-details modal. The mDoc share flow needs this: dismissing
   * only the QR overlay leaves this modal covering the Home screen it navigates to. */
  onCloseDetails?: () => void;
  /** Saves a CredIssuer QR that had to be fetched on open, so it is never fetched again. */
  onIssuerQrCodeFetched?: (
    issuerQrCode: string,
    credissuerCredentialId: string,
  ) => void;
}
