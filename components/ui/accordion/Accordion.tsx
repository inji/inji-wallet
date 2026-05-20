import React, { useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { Icon } from 'react-native-elements';
import { Row, Text } from '../index';
import { Theme } from '../styleUtils';

interface AccordionProps {
  title: string | React.ReactNode;
  badge?: React.ReactNode;
  /** Any interactive element rendered on the right side of the header (e.g. a checkbox, radio, toggle). */
  headerAction?: React.ReactNode;
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
  defaultExpanded = false,
  stackBadge = false,
  containerStyle,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View style={containerStyle ?? Theme.AccordionStyles.container}>
      <Pressable
        onPress={() => setIsExpanded(prev => !prev)}
        style={Theme.AccordionStyles.expandButton}>
        <Row style={Theme.AccordionStyles.header}>
          <View
            style={
              stackBadge
                ? Theme.AccordionStyles.titleColumn
                : Theme.AccordionStyles.titleRow
            }>
            {typeof title === 'string' ? (
              <Text style={Theme.AccordionStyles.title}>{title}</Text>
            ) : (
              title
            )}
            {badge}
          </View>
          <Icon
            name={isExpanded ? 'expand-less' : 'expand-more'}
            color={Theme.Colors.Icon}
          />
          {headerAction}
        </Row>
      </Pressable>

      {isExpanded && children}
    </View>
  );
};
