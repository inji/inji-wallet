import React from 'react';
import {render} from '@testing-library/react-native';
import {TextItem} from './TextItem';

describe('TextItem', () => {
  it('should render text without label', () => {
    const {getByText} = render(<TextItem text="Test Text" />);
    expect(getByText('Test Text')).toBeTruthy();
  });

  it('should render text with label', () => {
    const {getByText} = render(
      <TextItem text="Main Text" label="Label Text" />,
    );
    expect(getByText('Main Text')).toBeTruthy();
    expect(getByText('Label Text')).toBeTruthy();
  });

  it('should render only text when label is not provided', () => {
    const {getByText, queryByText} = render(<TextItem text="Only Text" />);
    expect(getByText('Only Text')).toBeTruthy();
    expect(queryByText('Label Text')).toBeNull();
  });

  it('should render with testID prop', () => {
    const {toJSON} = render(<TextItem text="Test" testID="customTestID" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with divider prop', () => {
    const {getByText} = render(<TextItem text="Test" divider={true} />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should render without divider when not specified', () => {
    const {getByText} = render(<TextItem text="Test" divider={false} />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should render with topDivider prop', () => {
    const {getByText} = render(<TextItem text="Test" topDivider={true} />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should render without topDivider when not specified', () => {
    const {getByText} = render(<TextItem text="Test" topDivider={false} />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should render with both dividers', () => {
    const {getByText} = render(
      <TextItem text="Test" divider={true} topDivider={true} />,
    );
    expect(getByText('Test')).toBeTruthy();
  });

  it('should render with custom margin when provided', () => {
    const {getByText} = render(<TextItem text="Test" margin="10" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should render long text correctly', () => {
    const longText = 'A'.repeat(200);
    const {getByText} = render(<TextItem text={longText} />);
    expect(getByText(longText)).toBeTruthy();
  });

  it('should handle empty text', () => {
    const {toJSON} = render(<TextItem text="" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should handle special characters in text', () => {
    const specialText = '!@#$%^&*()_+-={}[]|:";\'<>?,./';
    const {getByText} = render(<TextItem text={specialText} />);
    expect(getByText(specialText)).toBeTruthy();
  });

  it('should render with all props combined', () => {
    const {getByText} = render(
      <TextItem
        text="Complete Test"
        label="All Props"
        testID="allProps"
        divider={true}
        topDivider={true}
        margin="20"
      />,
    );

    expect(getByText('Complete Test')).toBeTruthy();
    expect(getByText('All Props')).toBeTruthy();
  });

  it('should render multiple TextItems', () => {
    const {getByText} = render(
      <>
        <TextItem text="First" label="One" />
        <TextItem text="Second" label="Two" />
        <TextItem text="Third" label="Three" />
      </>,
    );

    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
    expect(getByText('Third')).toBeTruthy();
    expect(getByText('One')).toBeTruthy();
    expect(getByText('Two')).toBeTruthy();
    expect(getByText('Three')).toBeTruthy();
  });
});
