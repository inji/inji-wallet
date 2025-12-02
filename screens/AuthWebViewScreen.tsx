import React, {useEffect, useRef, useState, useCallback} from 'react';
import psl from 'psl';
import {
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  BackHandler,
  SafeAreaView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {Ionicons} from '@expo/vector-icons';
import VciClient from '../shared/vciClient/VciClient';
import {Theme} from '../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {isAndroid} from '../shared/constants';

const AuthWebViewScreen: React.FC<any> = ({route, navigation}) => {
  const {authorizationURL, clientId, redirectUri, controller} = route.params;
  const webViewRef = useRef<WebView>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [shouldRenderWebView, setShouldRenderWebView] = useState(false);
  const {t} = useTranslation('authWebView');
  const WEBVIEW_INIT_DELAY_MS = 300;

  const hostName = new URL(authorizationURL).hostname; // example.mosip.net
  const parsed = psl.parse(hostName);
  const rootDomain = parsed.domain || hostName;
  const ALERT_TITLE = t('title', {
    wallet: 'Inji Wallet',
    domain: rootDomain || 'mosip.net',
  });
  const ALERT_MESSAGE = t('message');

  const handleBackPress = useCallback(() => {
    return true;
  }, []);

  useEffect(() => {
    if (!authorizationURL || !clientId || !redirectUri) {
      console.error('Missing required parameters for authentication');
      navigation.goBack();
      return;
    }

    navigation.setOptions({gestureEnabled: false});

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    Alert.alert(ALERT_TITLE, ALERT_MESSAGE, [
      {
        text: t('cancel'),
        style: 'cancel',
        onPress: () => {
          controller.CANCEL();
          navigation.goBack();
        },
      },
      {
        text: t('continue'),
        style: 'default',
        onPress: () => setShowWebView(true),
      },
    ]);

    return () => backHandler.remove();
  }, [
    authorizationURL,
    clientId,
    redirectUri,
    navigation,
    controller,
    handleBackPress,
  ]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isAndroid()) {
      setShouldRenderWebView(true);

      timeoutId = setTimeout(() => {
        setShouldRenderWebView(false);
      }, WEBVIEW_INIT_DELAY_MS);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleNavigationRequest = (request: any) => {
    const {url} = request;
    if (url.startsWith(redirectUri)) {
      try {
        const uri = new URL(url);
        const code = uri.searchParams.get('code');

        if (!code) {
          controller.CANCEL();
          navigation.goBack();
          return false;
        }

        VciClient.getInstance().sendAuthCode(code);
        navigation.goBack();
        return false;
      } catch (err: any) {
        console.error('Error parsing redirect URL:', err);
        controller.CANCEL();
        navigation.goBack();
        return false;
      }
    }

    return true;
  };

  const Header = () => (
    <View style={Theme.AuthWebViewScreenStyle.header}>
      <TouchableOpacity
        onPress={() => {
          controller.CANCEL();
          navigation.goBack();
        }}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={Theme.AuthWebViewScreenStyle.headerText}>Authenticate</Text>
      <View style={{width: 24}} />
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <Header />
      {shouldRenderWebView && !showWebView && (
        <WebView style={{width: 0, height: 0}} source={{uri: 'about:blank'}} />
      )}
      {showWebView && (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{uri: authorizationURL}}
          onShouldStartLoadWithRequest={handleNavigationRequest}
          startInLoadingState
          renderLoading={() => (
            <View style={Theme.AuthWebViewScreenStyle.loader}>
              <ActivityIndicator size="large" />
            </View>
          )}
          javaScriptEnabled
          incognito
          sharedCookiesEnabled={false}
          thirdPartyCookiesEnabled={false}
        />
      )}
    </SafeAreaView>
  );
};

export default AuthWebViewScreen;
