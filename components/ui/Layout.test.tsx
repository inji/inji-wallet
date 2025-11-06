import React from 'react';
import {render} from '@testing-library/react-native';
import {Column, Row} from './Layout';
import {Text} from 'react-native';

describe('Layout Components', () => {
  describe('Column Component', () => {
    it('should render Column component', () => {
      const {toJSON} = render(
        <Column>
          <Text>Test</Text>
        </Column>,
      );
      expect(toJSON()).toBeTruthy();
    });

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
      const {getByLabelText} = render(
        <Column fill testID="fill-column">
          <Text>Fill Column</Text>
        </Column>,
      );
      expect(getByLabelText('fill-column')).toBeTruthy();
    });

    it('should render with multiple layout props', () => {
      const {getByLabelText} = render(
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
      expect(getByLabelText('complex-column')).toBeTruthy();
    });
  });

  describe('Row Component', () => {
    it('should render Row component', () => {
      const {toJSON} = render(
        <Row>
          <Text>Test</Text>
        </Row>,
      );
      expect(toJSON()).toBeTruthy();
    });

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
      const {getByLabelText} = render(
        <Row fill testID="fill-row">
          <Text>Fill Row</Text>
        </Row>,
      );
      expect(getByLabelText('fill-row')).toBeTruthy();
    });

    it('should render with multiple layout props', () => {
      const {getByLabelText} = render(
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
      expect(getByLabelText('complex-row')).toBeTruthy();
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
