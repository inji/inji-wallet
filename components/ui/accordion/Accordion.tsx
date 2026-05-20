import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Row, Text} from '../index';
import {Theme} from '../styleUtils';

interface AccordionProps {
  title: string;
  badge?: React.ReactNode;
  /** Any interactive element rendered on the right side of the header (e.g. a checkbox, radio, toggle). */
  headerAction?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  badge = null,
  headerAction = null,
  defaultExpanded = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View style={Theme.AccordionStyles.container}>
      <Pressable
        onPress={() => setIsExpanded(prev => !prev)}
        style={Theme.AccordionStyles.expandButton}>
        <Row style={Theme.AccordionStyles.header}>
          <Row style={Theme.AccordionStyles.titleRow}>
            <Text style={Theme.AccordionStyles.title}>{title}</Text>
            {badge}
          </Row>
          {headerAction}
          <Icon
            name={isExpanded ? 'expand-less' : 'expand-more'}
            color={Theme.Colors.Icon}
          />
        </Row>
      </Pressable>

      {isExpanded && children}
    </View>
  );
};
