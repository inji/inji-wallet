import React from 'react';
import {render} from '@testing-library/react-native';
import {QrLoginSuccess} from './QrLoginSuccessMessage';

jest.mock('../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('./QrLoginController', () => ({
  useQrLogin: () => ({
    isVerifyingSuccesful: true,
    isQrLoginViaDeepLink: false,
    logoUrl: 'https://example.com/logo.png',
    clientName: {eng: 'Test Client'},
  }),
}));

jest.mock('../../i18n', () => ({
  getClientNameForCurrentLanguage: (names: any) => names?.eng || 'Client',
}));

describe('QrLoginSuccess', () => {
  const defaultProps = {
    isVisible: true,
    onPress: jest.fn(),
    service: {} as any,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<QrLoginSuccess {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <QrLoginSuccess {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
