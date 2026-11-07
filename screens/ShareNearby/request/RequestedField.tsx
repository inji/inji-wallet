import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {
  Checkbox,
  CheckboxSelectionType,
} from '../../../components/ui/checkbox/Checkbox';
import Copy from '../../../assets/shareNearby/copy.svg';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

export function RequestedField({
  label,
  checked,
  disabled,
  intentToRetain,
  onToggleRequestedField,
  onOpenRetentionHelp,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  intentToRetain: boolean;
  onToggleRequestedField: () => void;
  onOpenRetentionHelp: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={reviewStyles.field}>
      <Checkbox
        testId={label}
        selectionType={CheckboxSelectionType.MULTIPLE}
        accessibilityLabel={label}
        checked={checked}
        disabled={disabled}
        onPress={onToggleRequestedField}
        size={22}
        checkedColor={Theme.ShareNearbyColors.accent}
        containerStyle={[
          reviewStyles.checkboxBase,
          reviewStyles.checkboxTarget,
        ]}
      />
      <View style={styles.flexible}>
        <Text style={reviewStyles.fieldLabel}>{label}</Text>
        {!checked && !disabled ? (
          <Text style={styles.small}>{t('request.notShared')}</Text>
        ) : (
          intentToRetain && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('request.retentionHelp')}
              onPress={onOpenRetentionHelp}
              style={reviewStyles.retention}>
              <Copy />
              <Text style={[styles.small, styles.flexible]}>
                {t('request.retained')}
              </Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}
