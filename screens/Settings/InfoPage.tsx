import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Modal} from '../../components/ui/Modal';
import {ScaledText} from '../../components/revamp/ScaledText';
import {fonts} from '../../components/revamp/tokens';
import {useRevampTheme} from '../../components/revamp/useRevampTheme';

/** A plain text page opened from Settings, such as Help and support or the privacy policy. */
export const InfoPage: React.FC<{
  isVisible: boolean;
  title: string;
  body: string;
  testID: string;
  onDismiss: () => void;
}> = ({isVisible, title, body, testID, onDismiss}) => {
  const {c} = useRevampTheme();
  return (
    <Modal
      testID={testID}
      isVisible={isVisible}
      headerTitle={title}
      arrowLeft={true}
      onDismiss={onDismiss}>
      <ScrollView contentContainerStyle={styles.body}>
        <ScaledText style={[styles.text, {color: c.ink}]}>{body}</ScaledText>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  body: {padding: 24},
  text: {fontFamily: fonts.regular, fontSize: 16, lineHeight: 24},
});
