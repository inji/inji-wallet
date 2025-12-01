import {Dimensions, View} from 'react-native';
import {Column, Row, Text} from '../../ui';
import {CustomTooltip} from '../../ui/ToolTip';
import {Theme} from '../../ui/styleUtils';
import React from 'react';
import {SvgImage} from '../../ui/svg';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import {STATUS_FIELD_NAME} from './VCUtils';
import {StatusTooltipContent} from './VcStatustooTip';

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
          {fieldName === STATUS_FIELD_NAME ? t('VcDetails:status') : fieldName}
        </Text>
      )}

      {fieldName == STATUS_FIELD_NAME && (
        <CustomTooltip
          testID="statusToolTip"
          triggerComponent={SvgImage.info()}
          triggerComponentStyles={{marginLeft: 2, marginTop: 2}}
          toolTipContent={<StatusTooltipContent />}
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
  fieldValue: any;
  testID: string;
  fieldValueColor?: string;
}) => {
  if (React.isValidElement(fieldValue)) {
    return <View testID={`${testID}Value`}>{fieldValue}</View>;
  }

  return (
    <Text
      testID={`${testID}Value`}
      color={textColor}
      style={Theme.Styles.fieldItemValue}>
      {fieldValue}
    </Text>
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
