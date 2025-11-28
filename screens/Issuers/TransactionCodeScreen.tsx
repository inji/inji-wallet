import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Column, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
  ModalProps,
} from 'react-native';
import {isIOS} from '../../shared/constants';
import {SvgImage} from '../../components/ui/svg';
import {getScreenHeight} from '../../shared/commonUtil';
import {PinInput} from '../../components/PinInput';
import {Modal} from '../../components/ui/Modal';
import {CancelDownloadModal} from './ConfirmationModal';
import {Icon, Input} from 'react-native-elements';

export const TransactionCodeModal: React.FC<ExtendedModalProps> = props => {
  const {t} = useTranslation('transactionCodeScreen');
  const {isSmallScreen, screenHeight} = getScreenHeight();
  const [transactionCode, setTransactionCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [textLineCount, setTextLineCount] = useState(0);
  const maxLines = 2;

  const validateCode = (code: string): string => {
    if (!code.trim()) return t('emptyCodeError');
    if (!/^[a-zA-Z0-9]+$/.test(code)) return t('invalidCharacters');
    return '';
  };

  const handleVerify = () => {
    const error = validateCode(transactionCode);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage('');
    props.onVerify?.(transactionCode);
  };

  const handleChange = (text: string) => {
    if (!touched) setTouched(true);
    setTransactionCode(text);
    let error;
    if (touched) error = validateCode(text);
    setErrorMessage(error);
  };

  return (
    <>
      {showCancelConfirm ? (
        <CancelDownloadModal
          onCancel={() => setShowCancelConfirm(false)}
          onConfirm={props.onDismiss ?? (() => {})}
          visible={showCancelConfirm}
        />
      ) : (
        <Modal
          isVisible={props.visible ?? false}
          onDismiss={() => setShowCancelConfirm(true)}>
          <KeyboardAvoidingView
            style={
              isSmallScreen
                ? {flex: 1, paddingHorizontal: 10}
                : Theme.Styles.keyboardAvoidStyle
            }
            behavior={isIOS() ? 'padding' : 'height'}>
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}>
              <View style={{height: 700}}>
                <Column
                  crossAlign="center"
                  style={
                    isSmallScreen
                      ? null
                      : {
                          maxHeight: screenHeight,
                          flex: 1,
                          justifyContent: 'space-around',
                          marginBottom: 20,
                        }
                  }>
                  {SvgImage.OtpVerificationIcon()}
                  <View>
                    <Column crossAlign="center">
                      <Text
                        testID="otpVerificationHeader"
                        weight="bold"
                        style={Theme.TextStyles.header}>
                        {t('TransactionCode')}
                      </Text>
                      <Text
                        style={{marginTop: 15}}
                        testID="otpVerificationDescription"
                        color={Theme.Colors.RetrieveIdLabel}
                        numLines={showFullDescription ? undefined : 2}
                        ellipsizeMode="tail"
                        weight="semibold"
                        size="small"
                        align="center"
                        onTextLayout={e => {
                          if (textLineCount !== e.nativeEvent.lines.length) {
                            setTextLineCount(e.nativeEvent.lines.length);
                          }
                        }}>
                        {t(`${props.description || t('description')}`)}
                      </Text>
                      {textLineCount > maxLines && (
                        <Text
                          onPress={() => setShowFullDescription(prev => !prev)}
                          style={
                            Theme.TransactionCodeScreenStyle.showMoreButton
                          }>
                          {showFullDescription
                            ? t('Show less ↑')
                            : t('Show more ↓')}
                        </Text>
                      )}
                    </Column>
                  </View>

                  {(props.error || errorMessage) && (
                    <View style={Theme.TransactionCodeScreenStyle.errorView}>
                      <Text
                        testID="otpVerificationError"
                        align="center"
                        color={Theme.Colors.errorMessage}>
                        {errorMessage || props.error}
                      </Text>
                    </View>
                  )}

                  <View style={{alignItems: 'center'}}>
                    {(!props.inputMode ||
                      (props.inputMode && props.inputMode === 'numeric')) &&
                    props.length &&
                    props.length <= 6 ? (
                      <>
                        <PinInput
                          testID="pinInput"
                          length={props.length}
                          autosubmit={false}
                          onChange={handleChange}
                          onDone={(code: string) => {
                            const error = validateCode(code);
                            if (error) {
                              setErrorMessage(error);
                              return;
                            }
                            setErrorMessage('');
                            props.onVerify?.(code);
                            props.onDismiss?.();
                          }}
                        />
                        <Button
                          styles={{marginTop: 30}}
                          disabled={transactionCode.length == 0}
                          title={t('verify')}
                          type="gradient"
                          onPress={handleVerify}
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          containerStyle={{
                            width: Dimensions.get('window').width - 80,
                            alignSelf: 'center',
                          }}
                          placeholder={t('placeholder')}
                          placeholderTextColor="#ACACAC"
                          inputContainerStyle={{
                            borderBottomColor: '#C1C1C1',
                            borderBottomWidth: 1,
                            marginBottom: 16,
                          }}
                          inputStyle={
                            Theme.TransactionCodeScreenStyle.inputStyle
                          }
                          maxLength={props.length ?? 30}
                          autoFocus
                          secureTextEntry={!showCode}
                          value={transactionCode}
                          keyboardType={
                            props.inputMode === 'numeric'
                              ? 'numeric'
                              : 'default'
                          }
                          onChangeText={handleChange}
                          rightIcon={
                            <Icon
                              name={showCode ? 'eye-off' : 'eye'}
                              type="feather"
                              size={20}
                              color="#888"
                              onPress={() => setShowCode(prev => !prev)}
                            />
                          }
                        />
                        <Button
                          disabled={transactionCode.length == 0}
                          title="Verify"
                          type="gradient"
                          onPress={handleVerify}
                        />
                      </>
                    )}
                  </View>
                </Column>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </>
  );
};

interface ExtendedModalProps extends ModalProps {
  onVerify?: (transactionCode: string) => void;
  error?: string;
  description?: string;
  inputMode?: 'text' | 'numeric';
  length?: number;
}
