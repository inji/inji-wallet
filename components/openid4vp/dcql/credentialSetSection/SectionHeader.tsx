import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {Icon} from 'react-native-elements';
import {View} from "react-native";
import {Theme} from "../../../ui/styleUtils";
import {Badge} from "../../../ui/badge/Badge";
import {Text} from '../../../ui';
import {WhyWeNeedDocumentsOverlay} from "../../overlay/WhyWeNeedDocumentsOverlay";

export default function SectionHeader(props: {
  required: boolean,
  sectionSatisfied: boolean,
  stepLabel: string | undefined,
  testId: string,
}) {
  const {t} = useTranslation('SendVPScreen');
  const [showDocumentsInfo, setShowDocumentsInfo] = useState<boolean>(false)

  function handleShowDocumentsInfo() {
    setShowDocumentsInfo((prevState) => !prevState)
  }

  return <View style={Theme.DcqlStyles.sectionHeader}>
    <View style={Theme.DcqlStyles.sectionHeaderSpacer}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={Theme.DcqlStyles.sectionTitle}>
          {props.required
            ? t('dcqlSection.mandatoryCards')
            : t('dcqlSection.optionalCards')}
        </Text>
        {props.sectionSatisfied && (
          <Icon
            name="check-circle"
            color={Theme.Colors.Icon}
            size={16}
            containerStyle={Theme.DcqlStyles.sectionSatisfiedIcon}
          />
        )}
      </View>
      {props.stepLabel && (
        <Text style={Theme.DcqlStyles.sectionStepLabel}>{props.stepLabel}</Text>
      )}
    </View>
    <WhyWeNeedDocumentsOverlay
      isVisible={showDocumentsInfo}
      onClose={handleShowDocumentsInfo}
    />
    <Badge
      addInfoIcon
      onPress={handleShowDocumentsInfo}
      testId={`${props.testId}-required-badge`}
      text={
        props.required
          ? t('dcqlSection.required')
          : t('dcqlSection.notRequired')
      }
      borderColor={
        props.required
          ? Theme.Colors.BadgeColors.requiredBorder
          : Theme.Colors.BadgeColors.optionalBorder
      }
      bgColor={
        props.required ? Theme.Colors.BadgeColors.requiredBg : Theme.Colors.BadgeColors.optionalBg
      }
      textColor={
        props.required
          ? Theme.Colors.BadgeColors.requiredText
          : Theme.Colors.BadgeColors.optionalText
      }
    />
  </View>
}
