import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {BackHandler} from 'react-native';
import {Text as RNText} from 'react-native';

// Mock i18next before any imports
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock i18n initialization
jest.mock('../../i18n', () => ({}));

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return class NativeEventEmitter {
    addListener = jest.fn();
    removeListener = jest.fn();
    removeAllListeners = jest.fn();
  };
});

// Mock Modal component
jest.mock('./Modal', () => ({
  Modal: ({children, testID}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return <View testID={testID}>{children}</View>;
  },
}));

// Mock Header component
jest.mock('./Header', () => ({
  Header: ({testID}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return <View testID={testID} />;
  },
}));

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    callback();
  },
}));

jest.mock('../../shared/constants', () => ({
  isIOS: jest.fn(() => false),
  isAndroid: jest.fn(() => true),
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

// Mock theme utilities
jest.mock('./styleUtils', () => ({
  Theme: {
    ErrorStyles: {
      image: {},
      title: {},
      message: {},
      additionalMessage: {},
    },
    ModalStyles: {
      modal: {},
    },
    Colors: {
      whiteBackgroundColor: '#FFFFFF',
    },
    TextStyles: {
      base: {},
      regular: {},
      semibold: {},
      bold: {},
      smaller: {},
      small: {},
      normal: {},
      large: {},
      larger: {},
    },
    ButtonStyles: {
      solid: {},
      outline: {},
      clear: {},
      gradient: {},
      fill: {},
      disabledOutlineButton: {},
      small: {},
      medium: {},
      large: {},
    },
    spacing: jest.fn(() => ({})),
  },
  Spacing: {},
}));

// Mock React Native Elements
jest.mock('react-native-elements', () => ({
  Button: ({onPress, title, testID, type}: any) => {
    const React = require('react');
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  },
}));

// Mock Button component
jest.mock('./Button', () => ({
  Button: ({onPress, title, testID}: any) => {
    const React = require('react');
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  },
}));

// Mock Text component
jest.mock('./Text', () => ({
  Text: ({children, testID, ...props}: any) => {
    const React = require('react');
    const {Text as RNText} = require('react-native');
    return (
      <RNText testID={testID} {...props}>
        {children}
      </RNText>
    );
  },
}));

// Mock Layout components (Column, Row)
jest.mock('./Layout', () => ({
  Column: ({children, testID, ...props}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return (
      <View testID={testID} {...props}>
        {children}
      </View>
    );
  },
  Row: ({children, testID, ...props}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return (
      <View testID={testID} {...props}>
        {children}
      </View>
    );
  },
}));

// Now import the component after mocks
import {ErrorView, ErrorProps} from './Error';

// Mock BackHandler after imports
jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => ({
  remove: jest.fn(),
}));

jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => {});

describe('ErrorView', () => {
  const defaultProps: ErrorProps = {
    testID: 'error-view',
    isVisible: true,
    title: 'Error Title',
    message: 'Error Message',
    image: <RNText>Error Icon</RNText>,
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('should render with minimum required props', () => {
      const {getByText, getByTestId} = render(<ErrorView {...defaultProps} />);

      expect(getByTestId('error-viewTitle')).toBeTruthy();
      expect(getByTestId('error-viewMessage')).toBeTruthy();
      expect(getByText('Error Title')).toBeTruthy();
      expect(getByText('Error Message')).toBeTruthy();
    });

    it('should render with testID prop', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} testID="custom-error" />,
      );
      expect(getByTestId('custom-error')).toBeTruthy();
    });

    it('should render title with correct testID', () => {
      const {getByTestId} = render(<ErrorView {...defaultProps} />);
      expect(getByTestId('error-viewTitle')).toBeTruthy();
    });

    it('should render message with correct testID', () => {
      const {getByTestId} = render(<ErrorView {...defaultProps} />);
      expect(getByTestId('error-viewMessage')).toBeTruthy();
    });

    it('should render image element', () => {
      const {getByText} = render(<ErrorView {...defaultProps} />);
      expect(getByText('Error Icon')).toBeTruthy();
    });
  });

  describe('Additional Message', () => {
    it('should render additional message when provided', () => {
      const {getByTestId, getByText} = render(
        <ErrorView
          {...defaultProps}
          additionalMessage="Additional error details"
        />,
      );
      expect(getByTestId('error-viewAdditionalMessage')).toBeTruthy();
      expect(getByText('Additional error details')).toBeTruthy();
    });

    it('should not render additional message when not provided', () => {
      const {queryByTestId} = render(<ErrorView {...defaultProps} />);
      expect(queryByTestId('error-viewAdditionalMessage')).toBeNull();
    });
  });

  describe('Modal Mode', () => {
    it('should render as modal when isModal is true', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} isModal={true} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should render as full screen when isModal is false', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} isModal={false} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should render with showClose true by default in modal', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} isModal={true} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should render with showClose false when specified in modal', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} isModal={true} showClose={false} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should call onDismiss when provided in modal', () => {
      const onDismiss = jest.fn();
      render(
        <ErrorView {...defaultProps} isModal={true} onDismiss={onDismiss} />,
      );
      // Modal is rendered
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Button Actions - Not Aligned On End', () => {
    it('should render primary button when primaryButtonText is provided', () => {
      const primaryButtonEvent = jest.fn();
      const {getByText} = render(
        <ErrorView
          {...defaultProps}
          primaryButtonText="Primary Action"
          primaryButtonEvent={primaryButtonEvent}
          primaryButtonTestID="primary-button"
        />,
      );
      expect(getByText('Primary Action')).toBeTruthy();
    });

    it('should call primaryButtonEvent when primary button is pressed', () => {
      const primaryButtonEvent = jest.fn();
      const {getByTestId} = render(
        <ErrorView
          {...defaultProps}
          primaryButtonText="Primary Action"
          primaryButtonEvent={primaryButtonEvent}
          primaryButtonTestID="primary-button"
        />,
      );
      fireEvent.press(getByTestId('primary-button'));
      expect(primaryButtonEvent).toHaveBeenCalledTimes(1);
    });

    it('should render text button when textButtonText is provided', () => {
      const textButtonEvent = jest.fn();
      const {getByText} = render(
        <ErrorView
          {...defaultProps}
          textButtonText="Text Action"
          textButtonEvent={textButtonEvent}
          textButtonTestID="text-button"
        />,
      );
      expect(getByText('Text Action')).toBeTruthy();
    });

    it('should call textButtonEvent when text button is pressed', () => {
      const textButtonEvent = jest.fn();
      const {getByTestId} = render(
        <ErrorView
          {...defaultProps}
          textButtonText="Text Action"
          textButtonEvent={textButtonEvent}
          textButtonTestID="text-button"
        />,
      );
      fireEvent.press(getByTestId('text-button'));
      expect(textButtonEvent).toHaveBeenCalledTimes(1);
    });

    it('should render both primary and text buttons', () => {
      const primaryButtonEvent = jest.fn();
      const textButtonEvent = jest.fn();
      const {getByText} = render(
        <ErrorView
          {...defaultProps}
          primaryButtonText="Primary"
          primaryButtonEvent={primaryButtonEvent}
          textButtonText="Secondary"
          textButtonEvent={textButtonEvent}
        />,
      );
      expect(getByText('Primary')).toBeTruthy();
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render try again button with outline type', () => {
      const tryAgainEvent = jest.fn();
      const {getByText} = render(
        <ErrorView
          {...defaultProps}
          primaryButtonText="tryAgain"
          primaryButtonEvent={tryAgainEvent}
          primaryButtonTestID="try-again-button"
        />,
      );
      expect(getByText('tryAgain')).toBeTruthy();
    });

    it('should not render primary button when primaryButtonText is not provided', () => {
      const {queryByTestId} = render(
        <ErrorView {...defaultProps} primaryButtonTestID="primary-button" />,
      );
      expect(queryByTestId('primary-button')).toBeNull();
    });

    it('should not render text button when textButtonText is not provided', () => {
      const {queryByTestId} = render(
        <ErrorView {...defaultProps} textButtonTestID="text-button" />,
      );
      expect(queryByTestId('text-button')).toBeNull();
    });
  });

  describe('Button Actions - Aligned On End', () => {
    it('should render buttons aligned on end when alignActionsOnEnd is true', () => {
      const primaryButtonEvent = jest.fn();
      const {getByText} = render(
        <ErrorView
          {...defaultProps}
          alignActionsOnEnd={true}
          primaryButtonText="Primary Action"
          primaryButtonEvent={primaryButtonEvent}
        />,
      );
      expect(getByText('Primary Action')).toBeTruthy();
    });

    it('should render primary button with gradient type when aligned on end', () => {
      const primaryButtonEvent = jest.fn();
      const {getByTestId} = render(
        <ErrorView
          {...defaultProps}
          alignActionsOnEnd={true}
          primaryButtonText="Primary"
          primaryButtonEvent={primaryButtonEvent}
          primaryButtonTestID="primary-button-end"
        />,
      );
      expect(getByTestId('primary-button-end')).toBeTruthy();
    });

    it('should render text button when aligned on end', () => {
      const textButtonEvent = jest.fn();
      const {getByTestId} = render(
        <ErrorView
          {...defaultProps}
          alignActionsOnEnd={true}
          textButtonText="Text Action"
          textButtonEvent={textButtonEvent}
          textButtonTestID="text-button-end"
        />,
      );
      expect(getByTestId('text-button-end')).toBeTruthy();
    });

    it('should call primaryButtonEvent when aligned on end button is pressed', () => {
      const primaryButtonEvent = jest.fn();
      const {getByTestId} = render(
        <ErrorView
          {...defaultProps}
          alignActionsOnEnd={true}
          primaryButtonText="Primary"
          primaryButtonEvent={primaryButtonEvent}
          primaryButtonTestID="primary-button-end"
        />,
      );
      fireEvent.press(getByTestId('primary-button-end'));
      expect(primaryButtonEvent).toHaveBeenCalledTimes(1);
    });

    it('should call textButtonEvent when aligned on end button is pressed', () => {
      const textButtonEvent = jest.fn();
      const {getByTestId} = render(
        <ErrorView
          {...defaultProps}
          alignActionsOnEnd={true}
          textButtonText="Text"
          textButtonEvent={textButtonEvent}
          textButtonTestID="text-button-end"
        />,
      );
      fireEvent.press(getByTestId('text-button-end'));
      expect(textButtonEvent).toHaveBeenCalledTimes(1);
    });

    it('should render both buttons when aligned on end', () => {
      const primaryButtonEvent = jest.fn();
      const textButtonEvent = jest.fn();
      const {getByText} = render(
        <ErrorView
          {...defaultProps}
          alignActionsOnEnd={true}
          primaryButtonText="Primary"
          primaryButtonEvent={primaryButtonEvent}
          textButtonText="Text"
          textButtonEvent={textButtonEvent}
        />,
      );
      expect(getByText('Primary')).toBeTruthy();
      expect(getByText('Text')).toBeTruthy();
    });
  });

  describe('GoBack Functionality', () => {
    it('should render header with goBack when goBack is provided', () => {
      const goBack = jest.fn();
      const {getByTestId} = render(
        <ErrorView {...defaultProps} isModal={false} goBack={goBack} />,
      );
      expect(getByTestId('errorHeader')).toBeTruthy();
    });

    it('should not render header when goBack is not provided', () => {
      const {queryByTestId} = render(
        <ErrorView {...defaultProps} isModal={false} />,
      );
      expect(queryByTestId('errorHeader')).toBeNull();
    });

    it('should not render header in modal mode even with goBack', () => {
      const goBack = jest.fn();
      const {queryByTestId} = render(
        <ErrorView {...defaultProps} isModal={true} goBack={goBack} />,
      );
      expect(queryByTestId('errorHeader')).toBeNull();
    });
  });

  describe('Hardware Back Button', () => {
    it('should add back handler on focus', () => {
      const onDismiss = jest.fn();
      render(<ErrorView {...defaultProps} onDismiss={onDismiss} />);
      expect(BackHandler.addEventListener).toHaveBeenCalledWith(
        'hardwareBackPress',
        expect.any(Function),
      );
    });

    it('should call onDismiss when hardware back button is pressed', () => {
      const onDismiss = jest.fn();
      render(<ErrorView {...defaultProps} onDismiss={onDismiss} />);

      const backHandler = (BackHandler.addEventListener as jest.Mock).mock
        .calls[0][1];
      const result = backHandler();

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should not crash when onDismiss is not provided and back is pressed', () => {
      render(<ErrorView {...defaultProps} />);

      const backHandler = (BackHandler.addEventListener as jest.Mock).mock
        .calls[0][1];
      expect(() => backHandler()).not.toThrow();
    });

    it('should remove back handler on cleanup', () => {
      const removeMock = jest.fn();
      (BackHandler.addEventListener as jest.Mock).mockReturnValue({
        remove: removeMock,
      });

      const {unmount} = render(<ErrorView {...defaultProps} />);
      unmount();

      expect(removeMock).toHaveBeenCalled();
    });
  });

  describe('Exit App With Timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should trigger exit flow after timeout when exitAppWithTimer is true on Android', async () => {
      const textButtonEvent = jest.fn();
      const {isIOS} = require('../../shared/constants');
      (isIOS as jest.Mock).mockReturnValue(false);

      render(
        <ErrorView
          {...defaultProps}
          exitAppWithTimer={true}
          textButtonEvent={textButtonEvent}
        />,
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(textButtonEvent).toHaveBeenCalledTimes(1);
        expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
      });
    });

    it('should trigger exit flow after timeout when exitAppWithTimer is true on iOS', async () => {
      const textButtonEvent = jest.fn();
      const {isIOS} = require('../../shared/constants');
      (isIOS as jest.Mock).mockReturnValue(true);

      render(
        <ErrorView
          {...defaultProps}
          exitAppWithTimer={true}
          textButtonEvent={textButtonEvent}
        />,
      );

      jest.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(textButtonEvent).toHaveBeenCalledTimes(1);
        expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
      });
    });

    it('should not trigger exit flow when exitAppWithTimer is false', () => {
      const textButtonEvent = jest.fn();
      render(
        <ErrorView
          {...defaultProps}
          exitAppWithTimer={false}
          textButtonEvent={textButtonEvent}
        />,
      );

      jest.advanceTimersByTime(5000);

      expect(textButtonEvent).not.toHaveBeenCalled();
      expect(BackHandler.exitApp).not.toHaveBeenCalled();
    });

    it('should not trigger exit flow when exitAppWithTimer is undefined', () => {
      const textButtonEvent = jest.fn();
      render(
        <ErrorView {...defaultProps} textButtonEvent={textButtonEvent} />,
      );

      jest.advanceTimersByTime(5000);

      expect(textButtonEvent).not.toHaveBeenCalled();
      expect(BackHandler.exitApp).not.toHaveBeenCalled();
    });

    it('should clear timeout on unmount before triggering', () => {
      const textButtonEvent = jest.fn();
      const {unmount} = render(
        <ErrorView
          {...defaultProps}
          exitAppWithTimer={true}
          textButtonEvent={textButtonEvent}
        />,
      );

      jest.advanceTimersByTime(1000);
      unmount();
      jest.advanceTimersByTime(5000);

      expect(textButtonEvent).not.toHaveBeenCalled();
      expect(BackHandler.exitApp).not.toHaveBeenCalled();
    });
  });

  describe('Custom Styles', () => {
    it('should apply customStyles when provided', () => {
      const customStyles = {backgroundColor: 'red', padding: 20};
      const {getByTestId} = render(
        <ErrorView {...defaultProps} customStyles={customStyles} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should apply customImageStyles when provided', () => {
      const customImageStyles = {width: 100, height: 100};
      const {getByTestId} = render(
        <ErrorView {...defaultProps} customImageStyles={customImageStyles} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should use default empty object for customStyles when not provided', () => {
      const {getByTestId} = render(<ErrorView {...defaultProps} />);
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should use default empty object for customImageStyles when not provided', () => {
      const {getByTestId} = render(<ErrorView {...defaultProps} />);
      expect(getByTestId('error-view')).toBeTruthy();
    });
  });

  describe('Optional Props', () => {
    it('should handle goBackType prop', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} goBackType="outline" />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should handle goBackButtonVisible prop', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} goBackButtonVisible={true} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should handle tryAgain prop', () => {
      const tryAgain = jest.fn();
      const {getByTestId} = render(
        <ErrorView {...defaultProps} tryAgain={tryAgain} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should handle tryAgain as null', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} tryAgain={null} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should handle helpText prop', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} helpText="Help information" />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should handle testIDTextButton prop', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} testIDTextButton="custom-text-button" />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });

    it('should handle testIDTextButton as null', () => {
      const {getByTestId} = render(
        <ErrorView {...defaultProps} testIDTextButton={null} />,
      );
      expect(getByTestId('error-view')).toBeTruthy();
    });
  });

  describe('Complex Scenarios', () => {
    it('should render error view with all props provided', () => {
      const goBack = jest.fn();
      const tryAgain = jest.fn();
      const onDismiss = jest.fn();
      const primaryButtonEvent = jest.fn();
      const textButtonEvent = jest.fn();

      const {getByText, getByTestId} = render(
        <ErrorView
          testID="complex-error"
          customStyles={{padding: 10}}
          customImageStyles={{width: 50}}
          goBackType="outline"
          isModal={false}
          isVisible={true}
          showClose={true}
          alignActionsOnEnd={false}
          title="Complex Error"
          message="Complex error message"
          additionalMessage="Additional details"
          helpText="Help text"
          image={<RNText>Complex Icon</RNText>}
          goBack={goBack}
          goBackButtonVisible={true}
          tryAgain={tryAgain}
          onDismiss={onDismiss}
          primaryButtonText="Primary"
          primaryButtonEvent={primaryButtonEvent}
          testIDTextButton="text-button-id"
          textButtonText="Text"
          textButtonEvent={textButtonEvent}
          primaryButtonTestID="primary-btn"
          textButtonTestID="text-btn"
        />,
      );

      expect(getByText('Complex Error')).toBeTruthy();
      expect(getByText('Complex error message')).toBeTruthy();
      expect(getByText('Additional details')).toBeTruthy();
      expect(getByText('Complex Icon')).toBeTruthy();
      expect(getByTestId('errorHeader')).toBeTruthy();
    });

    it('should render modal with all buttons and actions', () => {
      const onDismiss = jest.fn();
      const primaryButtonEvent = jest.fn();
      const textButtonEvent = jest.fn();

      const {getByText, getByTestId} = render(
        <ErrorView
          testID="modal-error"
          isModal={true}
          isVisible={true}
          showClose={true}
          alignActionsOnEnd={true}
          title="Modal Error"
          message="Modal error message"
          image={<RNText>Modal Icon</RNText>}
          onDismiss={onDismiss}
          primaryButtonText="Retry"
          primaryButtonEvent={primaryButtonEvent}
          textButtonText="Cancel"
          textButtonEvent={textButtonEvent}
          primaryButtonTestID="retry-btn"
          textButtonTestID="cancel-btn"
        />,
      );

      expect(getByText('Modal Error')).toBeTruthy();
      expect(getByText('Modal error message')).toBeTruthy();
      expect(getByTestId('retry-btn')).toBeTruthy();
      expect(getByTestId('cancel-btn')).toBeTruthy();

      fireEvent.press(getByTestId('retry-btn'));
      expect(primaryButtonEvent).toHaveBeenCalledTimes(1);

      fireEvent.press(getByTestId('cancel-btn'));
      expect(textButtonEvent).toHaveBeenCalledTimes(1);
    });

    it('should handle modal visibility changes', () => {
      const {rerender, getByTestId} = render(
        <ErrorView {...defaultProps} isModal={true} isVisible={false} />,
      );

      expect(getByTestId('error-view')).toBeTruthy();

      rerender(<ErrorView {...defaultProps} isModal={true} isVisible={true} />);

      expect(getByTestId('error-view')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings for title and message', () => {
      const {getByTestId} = render(
        <ErrorView
          {...defaultProps}
          title=""
          message=""
          image={<RNText>Icon</RNText>}
        />,
      );
      expect(getByTestId('error-viewTitle')).toBeTruthy();
      expect(getByTestId('error-viewMessage')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(500);
      const {getByText} = render(
        <ErrorView {...defaultProps} title={longTitle} />,
      );
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle very long message', () => {
      const longMessage = 'B'.repeat(1000);
      const {getByText} = render(
        <ErrorView {...defaultProps} message={longMessage} />,
      );
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle special characters in title and message', () => {
      const specialTitle = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
      const specialMessage = '¡™£¢∞§¶•ªº–≠';
      const {getByText} = render(
        <ErrorView
          {...defaultProps}
          title={specialTitle}
          message={specialMessage}
        />,
      );
      expect(getByText(specialTitle)).toBeTruthy();
      expect(getByText(specialMessage)).toBeTruthy();
    });

    it('should handle unicode characters', () => {
      const unicodeTitle = '你好世界 🌍 مرحبا العالم';
      const unicodeMessage = 'Здравствуй мир 🚀';
      const {getByText} = render(
        <ErrorView
          {...defaultProps}
          title={unicodeTitle}
          message={unicodeMessage}
        />,
      );
      expect(getByText(unicodeTitle)).toBeTruthy();
      expect(getByText(unicodeMessage)).toBeTruthy();
    });

    it('should handle multiple rerenders without issues', () => {
      const {rerender, getByText} = render(<ErrorView {...defaultProps} />);

      expect(getByText('Error Title')).toBeTruthy();

      rerender(
        <ErrorView {...defaultProps} title="Updated Title" message="Updated" />,
      );
      expect(getByText('Updated Title')).toBeTruthy();
      expect(getByText('Updated')).toBeTruthy();

      rerender(
        <ErrorView
          {...defaultProps}
          title="Final Title"
          message="Final Message"
        />,
      );
      expect(getByText('Final Title')).toBeTruthy();
      expect(getByText('Final Message')).toBeTruthy();
    });
  });
});

