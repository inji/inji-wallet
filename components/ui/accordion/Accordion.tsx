import React, { useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { Icon } from 'react-native-elements';
import { Row, Text } from '../index';
import { Theme } from '../styleUtils';

interface AccordionProps {
  title: string | React.ReactNode;
  badge?: React.ReactNode;
  /** Any interactive element rendered on the RIGHT side of the header (e.g. a badge). Rendered outside the toggle Pressable. */
  headerAction?: React.ReactNode;
  /** Any interactive element rendered on the LEFT side of the header (e.g. a checkbox). Rendered outside the toggle Pressable. */
  headerActionLeft?: React.ReactNode;
  defaultExpanded?: boolean;
  /** When true, badge renders below the title in a column layout instead of beside it. */
  stackBadge?: boolean;
  /** Override the outer container style. When omitted the default card style (border + shadow) is used. */
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  badge = null,
  headerAction = null,
  headerActionLeft = null,
  defaultExpanded = false,
  stackBadge = false,
  containerStyle,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View style={containerStyle ?? Theme.AccordionStyles.container}>
      <Row style={Theme.AccordionStyles.header}>
        {headerActionLeft}
        <Pressable
          onPress={() => setIsExpanded(prev => !prev)}
          style={Theme.AccordionStyles.expandButton}>
          <Row crossAlign="center">
            <View
              style={[
                stackBadge
                  ? Theme.AccordionStyles.titleColumn
                  : Theme.AccordionStyles.titleRow,
                headerActionLeft ? {flex: 1} : undefined,
              ]}>
              {typeof title === 'string' ? (
                <Text style={Theme.AccordionStyles.title}>{title}</Text>
              ) : (
                title
              )}
              {badge}
            </View>
            <Icon
              name={isExpanded ? 'expand-less' : 'expand-more'}
              color={Theme.Colors.GrayIcon}
            />
          </Row>
        </Pressable>
        {headerAction}
      </Row>

      {isExpanded && children}
    </View>
  );
};
