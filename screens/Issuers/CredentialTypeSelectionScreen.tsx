import {Modal} from '../../components/ui/Modal';
import React from 'react';
import {useIssuerScreenController} from './IssuerScreenController';
import {FlatList, View} from 'react-native';
import {CredentialType} from '../../components/openId4VCI/CredentialType';
import {removeWhiteSpace} from '../../shared/commonUtil';
import {HomeRouteProps} from '../../routes/routeTypes';
import {RootRouteProps} from '../../routes';
import {getDisplayObjectForCurrentLanguage} from '../../shared/openId4VCI/Utils';
import {Theme} from '../../components/ui/styleUtils';
import {Column, Text} from '../../components/ui';
import {useTranslation} from 'react-i18next';

export const CredentialTypeSelectionScreen: React.FC<
  HomeRouteProps | RootRouteProps
> = props => {
  const controller = useIssuerScreenController(props);
  const {t} = useTranslation('IssuersScreen');
  const selectedIssuerDisplayObject = controller.selectedIssuer.display
    ? getDisplayObjectForCurrentLanguage(controller.selectedIssuer.display)
    : {};

  return (
    <Modal
      testID="credentialTypeSelectionScreen"
      isVisible={controller.isSelectingCredentialType}
      arrowLeft={true}
      headerTitle={selectedIssuerDisplayObject?.name}
      headerElevation={2}
      onDismiss={() => controller.CANCEL()}>
      <Column style={Theme.IssuersScreenStyles.issuerListOuterContainer}>
        <Text
          testID="credentialTypeSelectionScreenDescription"
          style={{
            ...Theme.TextStyles.regularGrey,
            ...Theme.IssuersScreenStyles.issuersSearchSubText,
          }}>
          {t('credentialTypeDescription')}
        </Text>
        <View style={Theme.IssuersScreenStyles.issuersContainer}>
          <FlatList
            data={controller.supportedCredentialTypes}
            numColumns={1}
            keyExtractor={item => item.id}
            renderItem={({item}) => {
              return (
                <CredentialType
                  testID={removeWhiteSpace(item.id)}
                  key={item.id}
                  displayDetails={selectedIssuerDisplayObject}
                  item={item}
                  onPress={() => controller.SELECTED_CREDENTIAL_TYPE(item)}
                  {...props}
                />
              );
            }}
          />
        </View>
      </Column>
    </Modal>
  );
};
