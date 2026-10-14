import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Button, Column, Row, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {Pressable, RefreshControl, View} from 'react-native';
import {useMyVcsTab} from './MyVcsTabController';
import {HomeScreenTabProps} from './HomeScreen';
import {AddVcModal} from './MyVcs/AddVcModal';
import {GetVcModal} from './MyVcs/GetVcModal';
import {useTranslation} from 'react-i18next';
import {GET_INDIVIDUAL_ID} from '../../shared/constants';
import {MessageOverlay} from '../../components/MessageOverlay';
import {VcItemContainer} from '../../components/VC/VcItemContainer';
import {
  BannerNotification,
  BannerStatusType,
} from '../../components/BannerNotification';
import {
  getErrorEventData,
  sendErrorEvent,
} from '../../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {ErrorView} from '../../components/ui/Error';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {WalletHome} from '../../components/revamp/WalletHome';
import {WalletHeader} from '../../components/revamp/WalletHeader';
import {BellIcon, CarouselIcon, UserIcon} from '../../components/revamp/Icons';
import {getVCsOrderedByPinStatus} from '../../shared/Utils';
import {SvgImage} from '../../components/ui/svg';
import {SearchBar} from '../../components/ui/SearchBar';
import {Icon} from 'react-native-elements';
import {VCMetadata} from '../../shared/VCMetadata';
import {useCopilot} from 'react-native-copilot';
import {isTranslationKeyFound} from '../../shared/commonUtil';

/**
 * Anything longer than this is a base64 photo or an encoded blob, never something a
 * person types into the search bar. Real names and addresses stay well under it.
 */
const MAX_INDEXED_VALUE_LENGTH = 512;

/**
 * An array this long is decoded binary (an mdoc portrait arrives as a byte array),
 * not a repeated human-readable field.
 */
const MAX_INDEXED_ARRAY_LENGTH = 200;

/**
 * `_sd`/`_sd_alg`/`cnf` are SD-JWT cryptographic material that survives into the
 * resolved payload, and `proof`/`issuerAuth`/`deviceSigned` are the equivalent for
 * the other formats. None of it is text anyone searches for.
 */
const SKIPPED_FIELDS = new Set([
  'biometrics',
  'id',
  'vcVer',
  '_sd',
  '_sd_alg',
  'cnf',
  'proof',
  'issuerAuth',
  'deviceSigned',
]);

const shouldSkipField = (key: string): boolean => SKIPPED_FIELDS.has(key);

/**
 * URLs are excluded because several credentials carry a presigned `qr_code` link
 * whose query string holds an Expires/Signature pair. Indexing those made common
 * substrings ("id", "http", "sign") match every card in the wallet.
 */
const isIndexableValue = (value: string): boolean =>
  value.length <= MAX_INDEXED_VALUE_LENGTH &&
  !value.startsWith('data:') &&
  !value.startsWith('http://') &&
  !value.startsWith('https://');

const collectSearchableValues = (value: any, collected: string[]): void => {
  if (value == null) return;
  // Numbers count: some issuers send ID numbers, pin codes and years unquoted, and
  // the old string-only check silently made those unsearchable.
  if (typeof value === 'number') {
    collected.push(String(value));
    return;
  }
  if (typeof value === 'string') {
    if (isIndexableValue(value)) collected.push(value);
    return;
  }
  if (typeof value !== 'object') return;
  if (Array.isArray(value) && value.length > MAX_INDEXED_ARRAY_LENGTH) return;
  // Arrays land here too, and their numeric keys never match shouldSkipField.
  for (const [key, nested] of Object.entries(value)) {
    if (shouldSkipField(key)) continue;
    collectSearchableValues(nested, collected);
  }
};

/**
 * mdoc keeps its claims as `[{elementIdentifier, elementValue}]` lists grouped under
 * namespaces. Only the values are indexed — pulling in the identifiers as well would
 * let "country" or "number" match every mdoc card in the wallet.
 */
const mdocClaimValues = (processedCredential: any): any[] => {
  const nameSpaces =
    processedCredential?.issuerSigned?.nameSpaces ??
    processedCredential?.nameSpaces;
  if (nameSpaces == null || typeof nameSpaces !== 'object') return [];
  return Object.values(nameSpaces)
    .flat()
    .map((claim: any) => claim?.elementValue);
};

/**
 * Every known credential shape is probed rather than switched on `format`, so a card
 * is indexed even if its stored metadata is missing or disagrees, and a new format
 * that lands in one of these shapes is picked up for free. Each lookup is a no-op
 * when the shape doesn't apply.
 *
 * Optional chaining throughout: an mso_mdoc VC keeps a CBOR string in `credential`
 * rather than an object, so reaching for `credential.credentialSubject` on one used
 * to throw and take the whole search down with it.
 */
const buildSearchableText = (vc: any): string => {
  const collected: string[] = [];
  const verifiableCredential = vc?.verifiableCredential;
  const processedCredential = verifiableCredential?.processedCredential;
  collectSearchableValues(vc?.vcMetadata?.credentialType, collected);
  collectSearchableValues(vc?.vcMetadata?.mosipIndividualId, collected);
  // ldp_vc
  collectSearchableValues(verifiableCredential?.credentialSubject, collected);
  collectSearchableValues(
    verifiableCredential?.credential?.credentialSubject,
    collected,
  );
  // vc+sd-jwt / dc+sd-jwt
  collectSearchableValues(processedCredential?.fullResolvedPayload, collected);
  // mso_mdoc
  collectSearchableValues(mdocClaimValues(processedCredential), collected);
  return collected.join('\n').toLowerCase();
};

export const MyVcsTab: React.FC<HomeScreenTabProps> = props => {
  const {t} = useTranslation('MyVcsTab');
  const controller = useMyVcsTab(props);
  const vcMetadataOrderedByPinStatus = getVCsOrderedByPinStatus(
    controller.vcMetadatas,
  );
  const [clearSearchIcon, setClearSearchIcon] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredSearchData, setFilteredSearchData] = useState<
    Array<Record<string, VCMetadata>>
  >([]);
  const [showPinVc, setShowPinVc] = useState(true);
  const [stackView, setStackView] = useState(false);
  const navigation = useNavigation<any>();
  const showWalletHome = vcMetadataOrderedByPinStatus.length > 0 && !stackView;
  const [highlightCardLayout, setHighlightCardLayout] = useState<null | {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'success' | 'failure';
  }>(null);

  const getId = () => {
    controller.DISMISS();
    controller.GET_VC();
  };

  const clearIndividualId = () => {
    GET_INDIVIDUAL_ID({id: '', idType: 'UIN'});
  };

  const onFocusSearch = () => {
    setShowPinVc(false);
  };

  const clearSearchText = () => {
    filterVcs('');
    setClearSearchIcon(false);
    setShowPinVc(true);
  };
  const {start} = useCopilot();

  // The tour starts automatically only while onboarding (a fresh install, until the first tour is
  // finished or dismissed), or when isTourGuide is turned on by the Settings "tour guide" button.
  // Don't set isTourGuide anywhere else: an effect here used to set it on every mount until the
  // first credential was downloaded, which replayed the whole tour on every app open.
  const shouldStartTour = controller.isOnboarding || controller.isTourGuide;

  /**
   * Covers the Settings "Replay tour guide". The onLayout below is what starts the tour
   * on first launch — deliberately, so the first step is measured after native layout
   * rather than during the mount commit — but that signal never arrives on a replay:
   * Home is already mounted and laid out by then, nothing re-lays out, and onLayout
   * doesn't fire again. The flag turning on is the only signal in that case, and since
   * the screen is already laid out there's nothing left to wait for.
   *
   * Only the off->on transition, never the mount: on mount previous and current already
   * agree, so this stays out of the way and leaves the first-launch path to onLayout. If
   * the tab was unmounted while in Settings it remounts instead, and onLayout covers it.
   */
  const wasStartingTourRef = useRef(shouldStartTour);
  useEffect(() => {
    const justTurnedOn = shouldStartTour && !wasStartingTourRef.current;
    wasStartingTourRef.current = shouldStartTour;
    if (justTurnedOn) {
      start(t('copilot:downloadTitle'));
    }
  }, [shouldStartTour]);

  useEffect(() => {
    if (!props.isViewingVc) {
      controller.RESET_HIGHLIGHT?.();
      setHighlightCardLayout(null);
    }
  }, [props.isViewingVc]);

  useEffect(() => {
    filterVcs(search);
  }, [controller.vcData]);

  /**
   * One lowercased blob of searchable text per card, rebuilt only when the stored VCs
   * change rather than on every keystroke. Walking the whole credential JSON per
   * keypress was both slow and, because the walk short-circuited on the first hit,
   * dependent on key order.
   */
  const searchIndex = useMemo(() => {
    const index: Record<string, string> = {};
    for (const [vcKey, vc] of Object.entries(controller.vcData ?? {})) {
      // null/undefined means the card is still downloading — nothing to index yet.
      if (vc == null) continue;
      index[vcKey] = buildSearchableText(vc);
    }
    return index;
  }, [controller.vcData]);

  /**
   * Every whitespace-separated token has to appear somewhere in the card's text, in
   * any order and across any combination of fields. That is what makes "doe john"
   * and "john doe" both find the same card even though the credential stores the
   * given and family names in separate fields, and it also makes a stray trailing
   * space harmless.
   */
  const filterVcs = (searchText: string) => {
    setSearch(searchText);
    const tokens = searchText.toLowerCase().split(/\s+/).filter(Boolean);
    const filteredData: Array<Record<string, VCMetadata>> = [];

    // Driven off the same ordered list the unfiltered view renders, so results keep
    // pinned cards on top instead of falling back to insertion order.
    for (const vcMetadata of vcMetadataOrderedByPinStatus) {
      const vcKey = vcMetadata.getVcKey();
      const searchableText = searchIndex[vcKey];
      if (searchableText === undefined) continue;
      if (tokens.every(token => searchableText.includes(token))) {
        filteredData.push({[vcKey]: vcMetadata});
      }
    }

    setFilteredSearchData(filteredData);

    const isSearchNotEmpty = tokens.length > 0;
    setClearSearchIcon(isSearchNotEmpty);
    setShowPinVc(!isSearchNotEmpty);
  };

  useEffect(() => {
    if (controller.areAllVcsLoaded) {
      controller.RESET_STORE_VC_ITEM_STATUS();
      controller.RESET_IN_PROGRESS_VCS_DOWNLOADED();
    }
    if (controller.inProgressVcDownloads?.size > 0) {
      controller.SET_STORE_VC_ITEM_STATUS();
    }

    if (controller.showHardwareKeystoreNotExistsAlert) {
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.appOnboarding,
          TelemetryConstants.ErrorId.doesNotExist,
          TelemetryConstants.ErrorMessage.hardwareKeyStore,
        ),
      );
    }

    if (controller.isTampered) {
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.appLogin,
          TelemetryConstants.ErrorId.vcsAreTampered,
          TelemetryConstants.ErrorMessage.vcsAreTampered,
        ),
      );
    }
  }, [
    controller.areAllVcsLoaded,
    controller.inProgressVcDownloads,
    controller.isTampered,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      filterVcs('');
    }, []),
  );

  let failedVCsList = [];
  controller.downloadFailedVcs.forEach(vc => {
    failedVCsList.push(`\n${vc.idType}:${vc.displayId}`);
  });

  const isVerificationFailed = controller.verificationErrorMessage !== '';

  const translationKey = `errors.verificationFailed.${controller.verificationErrorMessage}`;

  const verificationErrorMessage = isTranslationKeyFound(translationKey, t)
    ? t(translationKey)
    : t(`errors.verificationFailed.ERR_GENERIC`);

  const downloadFailedVcsErrorMessage = `${t(
    'errors.downloadLimitExpires.message',
  )}${failedVCsList}`;

  const isDownloadFailedVcs =
    useIsFocused() &&
    controller.downloadFailedVcs.length >= 1 &&
    !controller.AddVcModalService &&
    !controller.GetVcModalService;
  const numberOfCardsAvailable = !showPinVc
    ? filteredSearchData.length
    : controller.vcMetadatas.length;

  const cardsAvailableText =
    numberOfCardsAvailable > 1
      ? numberOfCardsAvailable + ' ' + t('common:cards')
      : numberOfCardsAvailable + ' ' + t('common:card');

  return (
    <React.Fragment>
      {/* Starts the tour on first launch, once this screen has actually laid out. The
          Settings replay used to call start() synchronously alongside
          navigation.navigate() to Home, before Home had mounted at all (see
          SettingScreenController's INJI_TOUR_GUIDE); this onLayout is that wait. Replays
          are handled by the effect above instead, since they don't re-trigger layout.

          start() is given the step's name rather than called bare because a bare start()
          takes whichever step is registered with the lowest order at that instant, with
          no retry — steps register in a useEffect, so if the first step hadn't registered
          yet the tour silently began on the wrong one and misreported its position. Naming
          the step uses the library's wait-for-it path instead: it retries via
          requestAnimationFrame until that step exists.

          That retry has no timeout, so the name must match a step that actually exists —
          naming a removed step leaves the tour retrying forever and looking like a dead
          button. Keep this in sync with whichever step holds order 1 (see copilotTestID). */}
      <Column
        fill
        style={{display: props.isVisible ? 'flex' : 'none'}}
        onLayout={
          shouldStartTour ? () => start(t('copilot:downloadTitle')) : undefined
        }>
        {controller.isRequestSuccessful && (
          <BannerNotification
            type={BannerStatusType.SUCCESS}
            message={t('downloadingYourCard')}
            onClosePress={() => {
              controller.RESET_STORE_VC_ITEM_STATUS();
              clearIndividualId();
            }}
            key={'downloadingVcPopup'}
            testId={'downloadingVcPopup'}
          />
        )}
        {showWalletHome ? (
          <WalletHome
            vcMetadatas={vcMetadataOrderedByPinStatus}
            searchIndex={searchIndex}
            onViewDetails={service => controller.VIEW_VC(service)}
            onAdd={() => props.onAddCredential?.()}
            onStackView={() => setStackView(true)}
            refreshing={controller.isRefreshingVcs}
            onRefresh={controller.REFRESH}
          />
        ) : (
          <WalletHeader
            countText={cardsAvailableText}
            onAvatar={() => navigation.navigate(BOTTOM_TAB_ROUTES.settings)}
            onAdd={() => props.onAddCredential?.()}
            searching={false}
            menu={[
              {
                label: 'Profile',
                icon: col => <UserIcon color={col} />,
                onPress: () => navigation.navigate(BOTTOM_TAB_ROUTES.settings),
              },
              {
                label: 'Notifications',
                icon: col => <BellIcon color={col} />,
                onPress: () => navigation.navigate(BOTTOM_TAB_ROUTES.history),
              },
              ...(stackView
                ? [
                    {
                      label: 'Carousel view',
                      icon: (col: string) => <CarouselIcon color={col} />,
                      onPress: () => setStackView(false),
                      separated: true,
                    },
                  ]
                : []),
            ]}
          />
        )}
        <Column fill pY={2} pX={8} style={showWalletHome && {display: 'none'}}>
          {vcMetadataOrderedByPinStatus.length > 0 && stackView && (
            <React.Fragment>
              <Column
                scroll
                margin="0 0 20 0"
                padding="0 0 100 0"
                backgroundColor={Theme.Colors.lightGreyBackgroundColor}
                refreshControl={
                  <RefreshControl
                    refreshing={controller.isRefreshingVcs}
                    onRefresh={controller.REFRESH}
                  />
                }>
                <Row style={Theme.SearchBarStyles.vcSearchBarContainer}>
                  <SearchBar
                    isVcSearch
                    searchIconTestID="searchIssuerIcon"
                    searchBarTestID="issuerSearchBar"
                    search={search}
                    placeholder={t('searchByName')}
                    onFocus={onFocusSearch}
                    onChangeText={filterVcs}
                    onLayout={() => filterVcs('')}
                  />
                  {clearSearchIcon && (
                    <Pressable
                      onPress={clearSearchText}
                      style={Theme.SearchBarStyles.clearSearch}>
                      <Icon
                        testID="clearingIssuerSearchIcon"
                        name="circle-with-cross"
                        type="entypo"
                        size={18}
                        color={Theme.Colors.DetailsLabel}
                      />
                    </Pressable>
                  )}
                </Row>
                <Row pY={11} pX={8}>
                  {numberOfCardsAvailable > 0 && (
                    <Text style={{fontFamily: 'Montserrat_500Medium'}}>
                      {cardsAvailableText}
                    </Text>
                  )}
                </Row>
                {showPinVc &&
                  vcMetadataOrderedByPinStatus.map((vcMetadata, index) => {
                    const vcKey = vcMetadata.getVcKey();

                    const isSuccessHighlighted =
                      controller.reverificationSuccess.status &&
                      controller.reverificationSuccess.vcKey === vcKey;

                    const isFailureHighlighted =
                      controller.reverificationfailure.status &&
                      controller.reverificationfailure.vcKey === vcKey;
                    const highlightType = isSuccessHighlighted
                      ? 'success'
                      : isFailureHighlighted
                      ? 'failure'
                      : null;

                    return (
                      <VcItemContainer
                        key={vcKey}
                        vcMetadata={vcMetadata}
                        margin="0 2 8 2"
                        onPress={controller.VIEW_VC}
                        isDownloading={controller.inProgressVcDownloads?.has(
                          vcKey,
                        )}
                        isPinned={vcMetadata.isPinned}
                        isInitialLaunch={controller.isInitialDownloading}
                        isTopCard={index === 0}
                        onMeasured={rect => {
                          if (highlightType && !highlightCardLayout) {
                            setHighlightCardLayout({
                              ...rect,
                              type: highlightType,
                            });
                          }
                        }}
                      />
                    );
                  })}
                {filteredSearchData.length > 0 && !showPinVc
                  ? filteredSearchData.map(vcMetadataObj => {
                      const [vcKey, vcMetadata] =
                        Object.entries(vcMetadataObj)[0];
                      return (
                        <VcItemContainer
                          key={vcKey}
                          vcMetadata={vcMetadata}
                          margin="0 2 8 2"
                          onPress={controller.VIEW_VC}
                          isDownloading={controller.inProgressVcDownloads?.has(
                            vcKey,
                          )}
                          isPinned={vcMetadata.isPinned}
                        />
                      );
                    })
                  : filteredSearchData.length === 0 &&
                    search &&
                    !showPinVc && (
                      <Column
                        fill
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingTop: 170,
                        }}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: 18,
                            fontFamily: 'Montserrat_600SemiBold',
                          }}>
                          {t('noCardsTitle')}
                        </Text>
                        <Text
                          style={{
                            textAlign: 'center',
                            lineHeight: 17,
                            paddingTop: 10,
                            fontSize: 14,
                            fontFamily: 'Montserrat_400Regular',
                          }}>
                          {t('noCardsDescription')}
                        </Text>
                      </Column>
                    )}
              </Column>
            </React.Fragment>
          )}
          {controller.vcMetadatas.length === 0 && (
            <React.Fragment>
              <Column
                scroll
                fill
                style={Theme.Styles.homeScreenContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={controller.isRefreshingVcs}
                    onRefresh={controller.REFRESH}
                  />
                }>
                <View
                  style={{
                    alignItems: 'center',
                  }}>
                  {SvgImage.DigitalIdentity()}
                  <Text
                    testID="bringYourDigitalID"
                    style={{paddingTop: 3}}
                    align="center"
                    weight="bold"
                    margin="33 0 6 0"
                    lineHeight={1}>
                    {t('bringYourDigitalID')}
                  </Text>
                  <Text
                    testID="generateVcFABDescription"
                    style={{
                      ...Theme.TextStyles.bold,
                      paddingTop: 3,
                    }}
                    color={Theme.Colors.textLabel}
                    align="center"
                    margin="0 12 30 12">
                    {t('generateVcFABDescription')}
                  </Text>
                </View>
              </Column>
            </React.Fragment>
          )}
        </Column>
      </Column>

      {controller.AddVcModalService && (
        <AddVcModal service={controller.AddVcModalService} onPress={getId} />
      )}

      {controller.GetVcModalService && (
        <GetVcModal service={controller.GetVcModalService} />
      )}

      <MessageOverlay
        testID="keyStoreNotExists"
        isVisible={controller.showHardwareKeystoreNotExistsAlert}
        title={t('errors.keystoreNotExists.title')}
        message={t('errors.keystoreNotExists.message')}
        onButtonPress={controller.ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS}
        buttonText={t('errors.keystoreNotExists.riskOkayText')}
        minHeight={'auto'}>
        <Row>
          <Button
            testID="ok"
            type="gradient"
            title={t('errors.keystoreNotExists.riskOkayText')}
            onPress={controller.ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS}
            margin={[0, 8, 0, 0]}
          />
        </Row>
      </MessageOverlay>

      <MessageOverlay
        isVisible={controller.isBindingError}
        title={controller.walletBindingError}
        onButtonPress={controller.DISMISS}
      />
      <MessageOverlay
        isVisible={controller.isTampered}
        title={t('errors.vcIsTampered.title')}
        message={t('errors.vcIsTampered.message')}
        onButtonPress={controller.REMOVE_TAMPERED_VCS}
        buttonText={t('common:ok')}
        minHeight={'auto'}
      />

      <MessageOverlay
        isVisible={isDownloadFailedVcs}
        title={t('errors.downloadLimitExpires.title')}
        message={downloadFailedVcsErrorMessage}
        onButtonPress={controller.DELETE_VC}
        buttonText={t('common:ok')}
        minHeight={'auto'}
      />

      {isVerificationFailed && (
        <ErrorView
          testID="verificationError"
          isVisible={isVerificationFailed}
          isModal={true}
          alignActionsOnEnd
          title={t('errors.verificationFailed.title')}
          message={verificationErrorMessage}
          image={SvgImage.PermissionDenied()}
          showClose={false}
          primaryButtonText="goBack"
          primaryButtonEvent={controller.RESET_VERIFY_ERROR}
          primaryButtonTestID="goBack"
          customStyles={{marginTop: '30%'}}
        />
      )}

      {controller.isNetworkOff && (
        <ErrorView
          testID="networkOffError"
          isVisible={controller.isNetworkOff}
          isModal
          title={t('errors.noInternetConnection.title')}
          message={t('errors.noInternetConnection.message')}
          onDismiss={controller.DISMISS}
          image={SvgImage.NoInternetConnection()}
          showClose
          primaryButtonText="tryAgain"
          primaryButtonEvent={controller.TRY_AGAIN}
          primaryButtonTestID="tryAgain"
        />
      )}
      <MessageOverlay
        overlayMode="highlight"
        isVisible={!!highlightCardLayout && !props.isViewingVc}
        cardLayout={highlightCardLayout ?? undefined}
        onBackdropPress={() => {
          controller.RESET_HIGHLIGHT();
          setHighlightCardLayout(null);
        }}
      />
    </React.Fragment>
  );
};
