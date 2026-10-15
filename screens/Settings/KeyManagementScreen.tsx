import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {NativeModules, TouchableOpacity, BackHandler, View} from 'react-native';
import DragList from 'react-native-draglist';
import {ListItem, Icon} from 'react-native-elements';
import {Text, Button} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {HelpScreen} from '../../components/HelpScreen';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {BackButton} from '../../components/ui/backButton/BackButton';
import {Copilot} from '../../components/ui/Copilot';
import {useCopilot} from 'react-native-copilot';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {
  getEndEventData,
  getImpressionEventData,
  sendEndEvent,
  sendImpressionEvent,
} from '../../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {KEY_MANAGEMENT_STEP, SUPPORTED_KEY_TYPES} from '../../shared/constants';
import {SvgImage} from '../../components/ui/svg';
import LinearGradient from 'react-native-linear-gradient';
import {HelpIcon} from '../../components/ui/HelpIcon';

const {RNSecureKeystoreModule} = NativeModules;

export const KeyManagementScreen: React.FC<KeyManagementScreenProps> = () => {
  const {t} = useTranslation('SetupKey');
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{params: KeyManagementScreenProps}, 'params'>>();
  const {controller, isClosed} = route.params;
  const {start} = useCopilot();
  const [keyOrder, setKeyOrder] = useState<{label: string; value: string}[]>(
    [],
  );

  useEffect(() => {
    const fetchSupportedKeyTypes = async () => {
      try {
        const result = JSON.parse(
          (await RNSecureKeystoreModule.getData('keyPreference'))[1],
        );
        const keys = Object.entries(result).map(([label, value]) => ({
          label,
          value,
        }));
        setKeyOrder(keys);
      } catch (error) {
        console.error('Error fetching supported key types:', error);
      }
    };
    fetchSupportedKeyTypes();
  }, []);

  useEffect(() => {
    const backAction = () => {
      controller.SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED();
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);
  const keyOrderRendermap = Object.fromEntries(
    Object.entries(SUPPORTED_KEY_TYPES).map(([key, value]) => [value, key]),
  );
  // Render item for drag list
  const renderItem = ({item, onDragStart, onDragEnd}) => (
    <TouchableOpacity onLongPress={onDragStart} onPressOut={onDragEnd}>
      <ListItem bottomDivider topDivider>
        <ListItem.Title style={Theme.KeyManagementScreenStyle.listItemTitle}>
          <Text testID={item.label} weight="regular">
            {keyOrderRendermap[item.value]}
          </Text>
        </ListItem.Title>
        <ListItem.Content />
        <Icon name="drag-handle" color={Theme.Colors.GrayIcon} />
      </ListItem>
    </TouchableOpacity>
  );

  const handleReorder = (fromIndex, toIndex) => {
    const newData = [...keyOrder];
    const item = newData.splice(fromIndex, 1)[0];
    newData.splice(toIndex, 0, item);
    setKeyOrder(newData);
  };

  const convertToKeyValue = items => {
    const result = {};
    items.forEach((item, index) => {
      result[index] = item.value;
    });
    return result;
  };

  const startTourGuide = () => {
    if (!controller.isKeyManagementTourGuideExplored) {
      start(t('copilot:keyManagementTitle'));
    }
  };

  // react-native-copilot measures its target the moment the tour starts, so starting
  // it from the outer screen's onLayout (as this used to) measured the DragList while
  // keyOrder was still [] — fetchSupportedKeyTypes hadn't resolved yet — giving it a
  // near-zero highlight rect. The tooltip then anchored just below that sliver, which
  // landed on top of the real, populated list once it rendered a moment later. Starting
  // from the DragList's own onLayout instead means the tour only ever measures it once
  // it has actual rows and a real height — onLayout fires again when the list grows
  // from empty to populated, so this simply waits for that later firing.
  const startTourGuideOnceListIsPopulated = () => {
    if (keyOrder.length > 0) {
      startTourGuide();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        elevation: 5,
        backgroundColor: '#ffffff',
      }}>
      <View style={Theme.KeyManagementScreenStyle.outerViewStyle}>
        <TouchableOpacity onPress={isClosed}>
          <BackButton
            onPress={() => {
              controller.SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED();
              navigation.goBack();
            }}
          />
        </TouchableOpacity>
        <Text
          testID="keyManagementHeadingSettingsScreen"
          style={Theme.KeyManagementScreenStyle.heading}>
          {t('header')}
        </Text>
        <HelpScreen source={'keyManagement'} triggerComponent={HelpIcon()} />
      </View>
      <BannerNotificationContainer />
      <View style={Theme.KeyManagementScreenStyle.copilotViewStyle}>
        <Copilot
          title={t('copilot:keyManagementTitle')}
          description={t('copilot:keyManagementDesc')}
          order={KEY_MANAGEMENT_STEP}>
          <DragList
            style={Theme.KeyManagementScreenStyle.dragViewStyleSettingsScreen}
            scrollEnabled={false}
            data={keyOrder}
            renderItem={renderItem}
            keyExtractor={item => item.value}
            onReordered={handleReorder}
            onLayout={startTourGuideOnceListIsPopulated}
          />
        </Copilot>
      </View>
      <Button
        testID="saveKeyOrderingPreference"
        type="gradient"
        title={t('save')}
        onPress={async () => {
          const keyOrderMap = convertToKeyValue(keyOrder);
          try {
            controller.SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED();
            await RNSecureKeystoreModule.storeData(
              'keyPreference',
              JSON.stringify(keyOrderMap),
            );
            controller.SET_KEY_ORDER_RESPONSE(true);
            sendImpressionEvent(
              getImpressionEventData(
                TelemetryConstants.FlowType.setKeyPriority,
                TelemetryConstants.EndEventStatus.success,
              ),
            );
          } catch (e) {
            sendImpressionEvent(
              getImpressionEventData(
                TelemetryConstants.FlowType.setKeyPriority,
                TelemetryConstants.EndEventStatus.failure,
              ),
            );
            controller.SET_KEY_ORDER_RESPONSE(false);
          }
        }}
        styles={{
          marginVertical: 30,
        }}
      />
    </View>
  );
};

interface KeyManagementScreenProps {
  isVisible: boolean;
  isClosed: () => void;
  controller: any;
}

export default KeyManagementScreen;
