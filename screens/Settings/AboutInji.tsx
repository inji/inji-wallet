import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions, Pressable, I18nManager, View} from 'react-native';
import {Modal} from '../../components/ui/Modal';
import {Column, Row, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {ListItem} from 'react-native-elements';
import {CopyButton} from '../../components/CopyButton';
import testIDProps from '../../shared/commonUtil';
import {__InjiVersion} from '../../shared/GlobalVariables';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {SvgImage} from '../../components/ui/svg';
import LinearGradient from 'react-native-linear-gradient';

export const AboutInji: React.FC<AboutInjiProps> = ({appId, renderTrigger}) => {
  const {t} = useTranslation('AboutInji');

  const [showAboutInji, setShowAboutInji] = useState(false);

  return (
    <React.Fragment>
      {renderTrigger ? (
        renderTrigger(() => setShowAboutInji(true))
      ) : (
        <Pressable
          onPress={() => {
            setShowAboutInji(!showAboutInji);
          }}>
          <ListItem {...testIDProps('aboutInji')} topDivider bottomDivider>
            {SvgImage.abotInjiIcon()}
            <ListItem.Content>
              <ListItem.Title
                {...testIDProps('aboutInjiTitle')}
                style={Theme.AboutInjiScreenStyle.titleStyle}>
                <Text weight="semibold" color={Theme.Colors.settingsLabel}>
                  {t('aboutInji')}
                </Text>
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </Pressable>
      )}
      <Modal
        testID="aboutInji"
        isVisible={showAboutInji}
        headerTitle={t('header')}
        headerElevation={2}
        arrowLeft={true}
        onDismiss={() => {
          setShowAboutInji(!showAboutInji);
        }}>
        <BannerNotificationContainer />
        <LinearGradient
          colors={Theme.Colors.GradientColorsLight}
          start={Theme.LinearGradientDirection.start}
          end={Theme.LinearGradientDirection.end}>
          <Row
            testID="appID"
            crossAlign="flex-start"
            style={Theme.Styles.primaryRow}>
            <Row>
              <Text
                weight="semibold"
                style={Theme.AboutInjiScreenStyle.appIdTitleStyle}>
                {t('appID')}
              </Text>
              <Text
                weight="semibold"
                style={Theme.AboutInjiScreenStyle.appIdTextStyle}>
                {I18nManager.isRTL ? appId : ' : ' + appId}
              </Text>
            </Row>
            <CopyButton content={appId} />
          </Row>
        </LinearGradient>
        <Column
          align="space-between"
          style={Theme.AboutInjiScreenStyle.containerStyle}>
          <Column>
            <Text
              testID="aboutDetails"
              style={Theme.AboutInjiScreenStyle.aboutDetailstextStyle}>
              {t('aboutDetails')}
            </Text>
          </Column>

          <Column
            pY={25}
            align="space-between"
            crossAlign="center"
            style={Theme.Styles.versionContainer}>
            <Row style={Theme.AboutInjiScreenStyle.injiVersionContainerStyle}>
              <Text
                testID="tuvaliVersion"
                weight="semibold"
                style={Theme.AboutInjiScreenStyle.injiVersionTitle}
                color={Theme.Colors.aboutVersion}>
                {t('version') + ' : '}
              </Text>
              <Text
                weight="semibold"
                style={Theme.AboutInjiScreenStyle.injiVersionText}
                color={Theme.Colors.aboutVersion}>
                {__InjiVersion.getValue()}
              </Text>
            </Row>
            <View style={Theme.AboutInjiScreenStyle.horizontalLineStyle} />
            <Column
              crossAlign="center"
              style={Theme.AboutInjiScreenStyle.footerContainer}>
              <Row style={Theme.AboutInjiScreenStyle.poweredByRow}>
                <View style={Theme.AboutInjiScreenStyle.logoStyle}>
                  {SvgImage.logoIcon(40, 40)}
                </View>

                <Text
                  weight="semibold"
                  style={Theme.AboutInjiScreenStyle.poweredByTextStyle}
                  color="black">
                  {t('poweredBy')}
                </Text>
              </Row>
            </Column>
          </Column>
        </Column>
      </Modal>
    </React.Fragment>
  );
};

interface AboutInjiProps {
  /** Draws the row that opens the About page, in place of the default list item. */
  renderTrigger?: (open: () => void) => React.ReactNode;
  isVisible?: boolean;
  appId?: string;
}
