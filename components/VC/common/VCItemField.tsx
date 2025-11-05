import {Dimensions, View} from 'react-native';
import {Column, Row, Text} from '../../ui';
import {CustomTooltip} from '../../ui/ToolTip';
import {Theme} from '../../ui/styleUtils';
import React from 'react';
import {SvgImage} from '../../ui/svg';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import ExpiredStatus from '../../../assets/Expired_Status.svg';
import RevokedStatus from '../../../assets/Revoked_Status.svg';
import ValidStatus from '../../../assets/Valid_Status.svg';
import PendingStatus from '../../../assets/Pending_Status.svg';

export const VCItemFieldName = ({
  fieldName,
  testID,
  fieldNameColor: textColor = Theme.Colors.DetailsLabel,
  isDisclosed = false,
}: {
  fieldName: string;
  testID: string;
  fieldNameColor?: string;
  isDisclosed?: boolean;
}) => {
  const {t} = useTranslation('ViewVcModal');
  return (
    <Row>
      {fieldName && (
        <Text
          testID={`${testID}Title`}
          color={textColor}
          style={Theme.Styles.fieldItemTitle}>
          {fieldName}
        </Text>
      )}

      {fieldName == t('VcDetails:status') && (
        <CustomTooltip
          testID="statusToolTip"
          width={Dimensions.get('screen').width * 0.8}
          height={Dimensions.get('screen').height * 0.28}
          triggerComponent={SvgImage.info()}
          triggerComponentStyles={{marginLeft: 2, marginTop: 2}}
          toolTipContent={
            <Column>
              <Row style={{width: '100%'}}>
                <View style={{marginRight: 6}}>
                  <ValidStatus width={20} height={20} />
                </View>
                <View style={{marginBottom: 15, marginTop: 1}}>
                  <Text
                    weight="semibold"
                    style={Theme.Styles.tooltipContentTitle}>
                    {t('statusToolTipContent.valid.title')}
                  </Text>
                  <Text
                    weight="regular"
                    style={[
                      Theme.Styles.tooltipContentDescription,
                      {marginTop: 3},
                    ]}>
                    {t('statusToolTipContent.valid.description')}
                  </Text>
                </View>
              </Row>

              <Row style={{width: '100%'}}>
                <View style={{marginRight: 6}}>
                  <PendingStatus width={20} height={20} />
                </View>
                <View style={{marginBottom: 15, marginTop: 1}}>
                  <Text
                    weight="semibold"
                    style={Theme.Styles.tooltipContentTitle}>
                    {t('statusToolTipContent.pending.title')}
                  </Text>
                  <Text
                    weight="regular"
                    style={[
                      Theme.Styles.tooltipContentDescription,
                      {marginTop: 3},
                    ]}>
                    {t('statusToolTipContent.pending.description')}
                  </Text>
                </View>
              </Row>

              <Row style={{width: '100%'}}>
                <View style={{marginRight: 6}}>
                  <ExpiredStatus width={20} height={20} />
                </View>
                <View style={{marginBottom: 15, marginTop: 1}}>
                  <Text
                    weight="semibold"
                    style={Theme.Styles.tooltipContentTitle}>
                    {t('statusToolTipContent.expired.title')}
                  </Text>
                  <Text
                    weight="regular"
                    style={[
                      Theme.Styles.tooltipContentDescription,
                      {marginTop: 3},
                    ]}>
                    {t('statusToolTipContent.expired.description')}
                  </Text>
                </View>
              </Row>

              <Row style={{width: '100%'}}>
                <View style={{marginRight: 6}}>
                  <RevokedStatus width={20} height={20} />
                </View>
                <View style={{marginTop: 1}}>
                  <Text
                    weight="semibold"
                    style={Theme.Styles.tooltipContentTitle}>
                    {t('statusToolTipContent.revoked.title')}
                  </Text>
                  <Text
                    weight="regular"
                    style={[
                      Theme.Styles.tooltipContentDescription,
                      {marginTop: 3},
                    ]}>
                    {t('statusToolTipContent.revoked.description')}
                  </Text>
                </View>
              </Row>
            </Column>
          }
        />
      )}
      {isDisclosed && (
        <Icon
          name="share-square-o"
          size={10}
          color="#666"
          style={{marginLeft: 5, marginTop: 3}}
        />
      )}
    </Row>
  );
};

export const VCItemFieldValue = ({
  fieldValue,
  testID,
  fieldValueColor: textColor = Theme.Colors.Details,
}: {
  fieldValue: string;
  testID: string;
  fieldValueColor?: string;
}) => {
  return (
    <>
      <Text
        testID={`${testID}Value`}
        color={textColor}
        style={Theme.Styles.fieldItemValue}>
        {fieldValue}
      </Text>
    </>
  );
};

export const VCItemField: React.FC<VCItemFieldProps> = props => {
  return (
    <Column>
      <VCItemFieldName {...props} />
      <VCItemFieldValue {...props} />
    </Column>
  );
};

interface VCItemFieldProps {
  fieldName: string;
  fieldValue: string;
  testID: string;
  fieldNameColor?: string;
  fieldValueColor?: string;
  isDisclosed?: boolean;
}
