import React from 'react';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Modal} from '../../../components/ui/Modal';
import {Centered, Column, Text} from '../../../components/ui';
import {ActivityLogText} from '../../../components/ActivityLogText';
import {useKebabPopUp} from '../../../components/KebabPopUpController';
import {VCMetadata} from '../../../shared/VCMetadata';
import {ActorRefFrom} from 'xstate';
import {VCItemMachine} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';

export const HistoryTab: React.FC<HistoryTabProps> = props => {
  const {t} = useTranslation('HistoryScreen');
  const controller = useKebabPopUp(props);

  return (
    <>
      <Modal
        headerTitle={t('historyHeaderLabel')}
        isVisible={controller.isShowActivities}
        onDismiss={controller.DISMISS}>
        <Column fill>
          {controller.activities
            .filter(
              activity =>
                activity._vcKey ===
                VCMetadata.fromVC(props.vcMetadata).getVcKey(),
            )
            .map(activity => (
              <ActivityLogText
                key={`${activity.timestamp}-${activity._vcKey}`}
                activity={activity}
              />
            ))}
          {controller.activities.length === 0 && (
            <Centered fill>
              <Icon
                testID="sentiment-dissatisfied"
                style={{marginBottom: 20}}
                size={40}
                name="sentiment-dissatisfied"
              />
              <Text
                testID="noHistory"
                style={{paddingTop: 3}}
                align="center"
                weight="semibold"
                margin="0 0 4 0">
                {t('noHistory')}
              </Text>
            </Centered>
          )}
        </Column>
      </Modal>
    </>
  );
};

export interface HistoryTabProps {
  service: ActorRefFrom<typeof VCItemMachine>;
  vcMetadata: VCMetadata;
}
