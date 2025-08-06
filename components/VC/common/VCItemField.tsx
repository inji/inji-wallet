import {Dimensions, View} from 'react-native';
import {Column, Row, Text} from '../../ui';
import {CustomTooltip} from '../../ui/ToolTip';
import {Theme} from '../../ui/styleUtils';
import React from 'react';
import {SvgImage} from '../../ui/svg';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';

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
            <Column align="flex-start">
              <View style={{marginBottom: 20}}>
                <Text weight="semibold">
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
              <View style={{marginBottom: 20}}>
                <Text weight="semibold">
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
              <View>
                <Text weight="semibold">
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
            </Column>
          }
        />
      )}
      {isDisclosed && (
      <Icon name="share-square-o" size={10} color="#666" style={{marginLeft:5, marginTop:3}} />
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
