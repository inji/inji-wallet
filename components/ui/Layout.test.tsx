import React from 'react';
import {render} from '@testing-library/react-native';
import {Column, Row} from './Layout';
import {Text} from 'react-native';

jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({testID: id}),
}));

describe('Layout Components', () => {
  describe('Column Component', () => {
    it('should render children in column', () => {
      const {getByText} = render(
        <Column>
          <Text>Child 1</Text>
          <Text>Child 2</Text>
        </Column>,
      );

      expect(getByText('Child 1')).toBeTruthy();
      expect(getByText('Child 2')).toBeTruthy();
    });

    it('should render with fill prop', () => {
      const {getByTestId} = render(
        <Column fill testID="fill-column">
          <Text>Fill Column</Text>
        </Column>,
      );
      expect(getByTestId('fill-column')).toBeTruthy();
    });

    it('should render with multiple layout props', () => {
      const {getByTestId} = render(
        <Column
          testID="complex-column"
          fill
          padding="10"
          margin="10 20"
          backgroundColor="#FF0000"
          align="center"
          crossAlign="center">
          <Text>Complex Column</Text>
        </Column>,
      );
      expect(getByTestId('complex-column')).toBeTruthy();
    });
  });

  describe('Row Component', () => {
    it('should render children in row', () => {
      const {getByText} = render(
        <Row>
          <Text>Item 1</Text>
          <Text>Item 2</Text>
          <Text>Item 3</Text>
        </Row>,
      );

      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
      expect(getByText('Item 3')).toBeTruthy();
    });

    it('should render with fill prop', () => {
      const {getByTestId} = render(
        <Row fill testID="fill-row">
          <Text>Fill Row</Text>
        </Row>,
      );
      expect(getByTestId('fill-row')).toBeTruthy();
    });

    it('should render with multiple layout props', () => {
      const {getByTestId} = render(
        <Row
          testID="complex-row"
          fill
          padding="10"
          margin="5"
          backgroundColor="#0000FF"
          align="center"
          crossAlign="center">
          <Text>Complex Row</Text>
        </Row>,
      );
      expect(getByTestId('complex-row')).toBeTruthy();
    });

    it('should handle nested layouts', () => {
      const {getByText} = render(
        <Row>
          <Column>
            <Text>Nested 1</Text>
          </Column>
          <Column>
            <Text>Nested 2</Text>
          </Column>
        </Row>,
      );

      expect(getByText('Nested 1')).toBeTruthy();
      expect(getByText('Nested 2')).toBeTruthy();
    });
  });
});
