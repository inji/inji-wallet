import React from 'react';
import {Text, View} from 'react-native';
import {Column, Row} from './Layout';
import {Theme} from './styleUtils';
import testIDProps from '../../shared/commonUtil';
import {BackButton} from './backButton/BackButton';

export const Header: React.FC<HeaderProps> = ({goBack, title, testID}) => {
  return (
    <Column safe align="center" testID={testID}>
      <Row elevation={2}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 18,
            marginBottom: 22,
            marginVertical: 16,
            marginLeft: 10,
          }}>
          <BackButton onPress={goBack} />
          <Row fill align={'center'}>
            <Column>
              <View style={{alignItems: 'center', marginLeft: -40}}>
                <Text
                  style={Theme.TextStyles.semiBoldHeader}
                  {...testIDProps('title')}>
                  {title}
                </Text>
              </View>
            </Column>
          </Row>
        </View>
      </Row>
    </Column>
  );
};

interface HeaderProps {
  title?: string;
  goBack: () => void;
  testID: string;
}
