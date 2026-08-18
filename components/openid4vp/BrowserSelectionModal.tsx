import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Pressable, View} from 'react-native';
import {Button, Column, Row, Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import testIDProps from '../../shared/commonUtil';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {AvailableBrowser} from '../../shared/openID4VP/openid4vp.types';

export const BrowserSelectionModal: React.FC<
  BrowserSelectionModalProps
> = props => {
  const {t} = useTranslation('ScanScreen');
  const [browsers, setBrowsers] = useState<AvailableBrowser[]>([]);

  const {redirectUri, onRedirectHandled} = props;

  const redirectTo = async (browserId?: string) => {
    let redirected = false;
    try {
      redirected = await OpenID4VP.redirectToVerifier(redirectUri, browserId);
    } catch (error) {
      console.warn('Error during redirection:', error);
    }

    if (!redirected && browsers.length > 1) {
      return;
    }

    setBrowsers([]);
    onRedirectHandled();
  };

  useEffect(() => {
    if (!redirectUri) {
      setBrowsers([]);
      return;
    }

    let isActive = true;

    const resolveBrowsers = async () => {
      const availableBrowsers = await OpenID4VP.getAvailableBrowsers();
      if (!isActive) return;

      if (availableBrowsers.length > 1) {
        setBrowsers(availableBrowsers);
        return;
      }

      await redirectTo(availableBrowsers[0]?.id);
    };

    void resolveBrowsers();

    return () => {
      isActive = false;
    };
  }, [redirectUri]);

  return (
    <Modal
      visible={browsers.length > 1}
      transparent
      animationType="fade"
      onRequestClose={() => redirectTo(undefined)}
      {...testIDProps('browserSelectionModal')}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <Column
          margin="24"
          padding="24"
          backgroundColor={Theme.Colors.whiteBackgroundColor}
          style={{borderRadius: 12}}>
          <Text
            testID="browserSelectionTitle"
            margin="0 0 8 0"
            style={Theme.TextStyles.bold}
            size={'large'}>
            {t('status.browserSelection.title')}
          </Text>
          <Text
            testID="browserSelectionMessage"
            margin="0 0 20 0"
            style={Theme.TextStyles.regular}
            color={Theme.Colors.statusMessage}>
            {t('status.browserSelection.message')}
          </Text>

          {browsers.map(browser => (
            <Pressable
              key={browser.id}
              testID={`browserOption-${browser.id}`}
              onPress={() => redirectTo(browser.id)}>
              <Row align="space-between" crossAlign="center" margin="0 0 16 0">
                <Text style={Theme.TextStyles.regular}>
                  {browser.displayName}
                </Text>
                {browser.isDefault && (
                  <Text
                    style={Theme.TextStyles.regular}
                    color={Theme.Colors.statusMessage}>
                    {t('status.browserSelection.defaultBrowser')}
                  </Text>
                )}
              </Row>
            </Pressable>
          ))}

          <Button
            testID="browserSelectionSkipButton"
            type="clear"
            title={t('status.browserSelection.skip')}
            onPress={() => {
              setBrowsers([]);
              onRedirectHandled();
            }}
          />
        </Column>
      </View>
    </Modal>
  );
};

interface BrowserSelectionModalProps {
  redirectUri: string;
  onRedirectHandled: () => void;
}
