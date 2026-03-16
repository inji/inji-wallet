import React from 'react';
import {render} from '@testing-library/react-native';
import {TextItem} from './TextItem';

describe('TextItem', () => {
  it('should render text without label', () => {
    const {getByText, queryByText} = render(<TextItem text="Test Text" />);
    expect(getByText('Test Text')).toBeTruthy();
    expect(queryByText('Label Text')).toBeNull();
  });

  it('should render text with label', () => {
    const {getByText} = render(
      <TextItem text="Main Text" label="Label Text" />,
    );
    expect(getByText('Main Text')).toBeTruthy();
    expect(getByText('Label Text')).toBeTruthy();
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
});
