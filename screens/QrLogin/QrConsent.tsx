import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Column, Row, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {useQrLogin} from './QrLoginController';
import {Image} from 'react-native';
import {ListItem, Switch} from 'react-native-elements';
import {Modal} from '../../components/ui/Modal';
import {QrLoginRef} from '../../machines/QrLogin/QrLoginMachine';
import {ScrollView} from 'react-native';
import {getClientNameForCurrentLanguage} from '../../i18n';

export const QrConsent: React.FC<QrConsentProps> = props => {
  const {t} = useTranslation('QrLogin');
  const controller = useQrLogin(props);

  return (
    <Modal
      isVisible={props.isVisible}
      arrowLeft={true}
      headerTitle={t('consent')}
      headerElevation={5}
      onDismiss={props.onCancel}>
      <Column
        fill
        align="space-between"
        padding="24 24 0 24"
        style={{display: props.isVisible ? 'flex' : 'none'}}
        backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
        <Column>
          {controller.linkTransactionResponse && (
            <Row margin={'0 0 0 9'} crossAlign="center" align="center">
              <Image
                source={controller.logoUrl ? {uri: controller.logoUrl} : null}
                style={{width: 65, height: 65}}
              />
            </Row>
          )}
          <Text
            style={Theme.TextStyles.small}
            weight="bold"
            margin={'10 0 0 0'}>
            {getClientNameForCurrentLanguage(controller.clientName)}{' '}
            {t('access')}
          </Text>
        </Column>
        <ScrollView>
          <Column>
            {
              <Text
                style={Theme.TextStyles.small}
                weight="bold"
                margin={'10 0 0 0'}>
                {t('essentialClaims')}
              </Text>
            }

            {controller.essentialClaims.map((claim, index) => (
              <Row key={index} align={'space-between'} margin={'10 20 0 15'}>
                <Text
                  color={Theme.Colors.Details}
                  style={Theme.TextStyles.base}>
                  {t(claim[0].toUpperCase() + claim.slice(1))
                    .split('_')
                    .join(' ')}
                </Text>
                <Text
                  color={Theme.Colors.GrayIcon}
                  style={Theme.TextStyles.small}
                  weight="bold"
                  margin={'10 0 10 6'}>
                  {t('required')}
                </Text>
              </Row>
            ))}
          </Column>

          <Column>
            {
              <Text
                style={Theme.TextStyles.small}
                weight="bold"
                margin={'10 0 0 0'}>
                {t('voluntaryClaims')}
              </Text>
            }

            {controller.voluntaryClaims.map((claim, index) => (
              <ListItem
                key={index}
                bottomDivider
                containerStyle={Theme.claimsContainer.container}>
                <ListItem.Content>
                  <ListItem.Title>
                    <Text color={Theme.Colors.Details}>
                      {t(claim[0].toUpperCase() + claim.slice(1))
                        .split('_')
                        .join(' ')}
                    </Text>
                  </ListItem.Title>
                </ListItem.Content>

                <Switch
                  value={controller.isShare[claim]}
                  onValueChange={() =>
                    controller.SELECT_CONSENT(controller.isShare[claim], claim)
                  }
                  color={Theme.Colors.Icon}
                />
              </ListItem>
            ))}
          </Column>
        </ScrollView>
        <Column
          margin={'0 -20 0 -20'}
          style={Theme.Styles.bottomButtonsContainer}
          elevation={5}>
          <Button
            type="gradient"
            margin={'6 10 0 10'}
            styles={Theme.ButtonStyles.radius}
            title={t('allow')}
            onPress={props.onConfirm}
          />
          <Button
            margin={'10 10 0 10'}
            type="clear"
            title={t('cancel')}
            onPress={props.onCancel}
          />
        </Column>
      </Column>
    </Modal>
  );
};

interface QrConsentProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  service: QrLoginRef;
}
