import React from 'react';
import {render} from '@testing-library/react-native';
import {SectionLayout} from './SectionLayout';
import {Text, View} from 'react-native';

// Mock ui components
jest.mock('./ui', () => ({
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('SectionLayout Component', () => {
  const defaultProps = {
    headerIcon: <View testID="headerIcon">Icon</View>,
    headerText: 'Section Header',
    children: <Text>Section Content</Text>,
    testId: 'testSection',
  };

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<SectionLayout {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom marginBottom', () => {
    const {toJSON} = render(
      <SectionLayout {...defaultProps} marginBottom={20} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different header text', () => {
    const {toJSON} = render(
      <SectionLayout {...defaultProps} headerText="Custom Section Title" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with complex children', () => {
    const {toJSON} = render(
      <SectionLayout
        headerIcon={defaultProps.headerIcon}
        headerText={defaultProps.headerText}
        testId={defaultProps.testId}>
        <Text>Line 1</Text>
        <Text>Line 2</Text>
        <View>
          <Text>Nested content</Text>
        </View>
      </SectionLayout>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different icon', () => {
    const customIcon = <View testID="customIcon">🔍</View>;
    const {toJSON} = render(
      <SectionLayout {...defaultProps} headerIcon={customIcon} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with zero marginBottom', () => {
    const {toJSON} = render(
      <SectionLayout {...defaultProps} marginBottom={0} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
