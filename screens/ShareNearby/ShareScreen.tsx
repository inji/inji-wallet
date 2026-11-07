import {Theme} from '../../components/ui/styleUtils';
import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Column} from '../../components/ui';
import {Header} from '../../components/ui/Header';
import {HelpIcon} from '../../components/ui/HelpIcon';
import Back from '../../assets/shareNearby/back.svg';
import {MdocPresentationScreen} from './MdocPresentationScreen';
import {MdocReadiness} from './readiness/MdocReadiness';
import {useShareScreen} from './ShareScreenController';
import {ShareHeader} from './share/ShareHeader';
import {ShareTabs} from './share/ShareTabs';
import {ShareContent} from './share/ShareContent';
import {ShareHelpSheet} from './share/ShareHelpSheet';
import {BluetoothOffSheet} from './readiness/BluetoothOffSheet';

const styles = Theme.ShareNearbyStyles;

export function ShareScreen() {
  const {t} = useTranslation('ShareNearby');
  const shareScreenController = useShareScreen();
  const {presentationController, readinessController} = shareScreenController;
  const isShowingMdocContent =
    !!presentationController || shareScreenController.isShowingMdocReadiness;
  // MDQ-01–04: the code and connection screens carry the "Mobile ID QR code" header.
  const isShowingCodeScreens =
    !!presentationController?.isShowingEngagement ||
    !!presentationController?.isShowingExpiredCode;
  const handleHeaderBack = presentationController
    ? presentationController.isStoppingPresentation
      ? undefined
      : presentationController.handleBackOrCancel
    : readinessController.CANCEL;
  return (
    <Column safe safeEdges={['top', 'left', 'right']} style={styles.root}>
      {isShowingMdocContent ? (
        <>
          <Header
            safeArea={false}
            elevation={0}
            title={t(
              isShowingCodeScreens
                ? 'entry.mdocTitle'
                : presentationController
                ? 'title'
                : 'nearby',
            )}
            containerStyle={styles.header}
            titleStyle={[styles.headerText, styles.centeredText]}
            headerLeft={
              handleHeaderBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('back')}
                  onPress={handleHeaderBack}
                  style={({pressed}) => [
                    styles.iconButton,
                    pressed && styles.pressed,
                  ]}>
                  <Back />
                </Pressable>
              ) : undefined
            }
            headerRight={
              presentationController ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('help')}
                  onPress={presentationController.OPEN_HELP}
                  style={({pressed}) => [
                    styles.helpButton,
                    pressed && styles.pressed,
                  ]}>
                  <HelpIcon />
                </Pressable>
              ) : undefined
            }
          />
          {presentationController?.isReviewingRequest ? (
            // The review scrolls its own content and pins its actions (frames 25–40).
            <View style={styles.flexible}>
              <MdocPresentationScreen
                presentationController={presentationController}
              />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled">
              <View style={styles.content}>
                {presentationController ? (
                  <MdocPresentationScreen
                    presentationController={presentationController}
                  />
                ) : (
                  <MdocReadiness readinessController={readinessController} />
                )}
              </View>
            </ScrollView>
          )}
        </>
      ) : (
        <>
          <ShareHeader onHelp={shareScreenController.OPEN_HELP} />
          <ShareTabs
            selectedTab={shareScreenController.selectedTab}
            onSelectTab={shareScreenController.SELECT_TAB}
          />
          <ShareContent
            selectedTab={shareScreenController.selectedTab}
            hasMdocCredential={shareScreenController.hasMdocCredential}
            hasEndedWithoutSharing={
              shareScreenController.hasEndedWithoutSharing
            }
            onDismissSessionEnded={shareScreenController.DISMISS_SESSION_ENDED}
            onPresent={shareScreenController.PRESENT_MDOC}
            onReceive={shareScreenController.RECEIVE_CARD}
            onHelp={shareScreenController.OPEN_HELP}
          />
          <ShareHelpSheet
            visible={shareScreenController.isHelpVisible}
            onClose={shareScreenController.CLOSE_HELP}
          />
          <BluetoothOffSheet
            visible={shareScreenController.isShowingBluetoothSheet}
            onTurnOn={readinessController.TURN_ON_BLUETOOTH}
            onOpenSettings={readinessController.OPEN_SETTINGS}
            onCancel={readinessController.CANCEL}
          />
        </>
      )}
    </Column>
  );
}
