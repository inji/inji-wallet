import {render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import {ExpandableListSheetView} from './ExpandableListSheetView';

describe('ExpandableListSheetView', () => {
  const items = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'];

  const renderItem = ({
    item,
    index,
    isExpanded,
  }: {
    item: string;
    index: number;
    isExpanded: boolean;
    isLast: boolean;
  }) => (
    <View
      testID={`${isExpanded ? 'expanded' : 'collapsed'}-row-${index}`}
      accessibilityLabel={`${
        isExpanded ? 'expanded' : 'collapsed'
      }-row-${index}`}>
      <View accessibilityLabel={`row-text-${item}`} />
    </View>
  );

  const renderComponent = (
    overrideProps: Partial<
      React.ComponentProps<typeof ExpandableListSheetView<string>>
    > = {},
  ) =>
    render(
      <ExpandableListSheetView
        items={items}
        testID="expandable-list"
        introText="intro"
        title="title"
        footerText="footer"
        closeText="close"
        showMoreText={hiddenCount => `show ${hiddenCount} more`}
        renderItem={renderItem}
        {...overrideProps}
      />,
    );

  it('renders intro text and collapsed container with first three items by default', () => {
    const {getByLabelText, getByTestId, queryByTestId} = renderComponent();

    expect(getByLabelText('expandable-list-intro-text')).toBeTruthy();
    expect(getByTestId('expandable-list-card')).toBeTruthy();
    expect(getByTestId('collapsed-row-0')).toBeTruthy();
    expect(getByTestId('collapsed-row-1')).toBeTruthy();
    expect(getByTestId('collapsed-row-2')).toBeTruthy();
    expect(queryByTestId('collapsed-row-3')).toBeNull();
  });

  it('renders custom collapsed count when collapsedItemCount is provided', () => {
    const {getByTestId, queryByTestId} = renderComponent({
      collapsedItemCount: 2,
    });

    expect(getByTestId('collapsed-row-0')).toBeTruthy();
    expect(getByTestId('collapsed-row-1')).toBeTruthy();
    expect(queryByTestId('collapsed-row-2')).toBeNull();
  });

  it('hides show more button when there are no hidden items', () => {
    const {queryByTestId} = renderComponent({
      items: ['item-1', 'item-2', 'item-3'],
    });

    expect(queryByTestId('expandable-list-show-more-button')).toBeNull();
  });

  it('renders show more button text using hidden count', () => {
    const showMoreText = jest.fn(
      (hiddenCount: number) => `show ${hiddenCount} more`,
    );

    const {getByText} = renderComponent({showMoreText});

    expect(showMoreText).toHaveBeenCalledWith(2);
    expect(getByText('show 2 more')).toBeTruthy();
  });

  it('aligns show more button to the right when alignShowMoreTextAtRight is true', () => {
    const {getByTestId} = renderComponent({alignShowMoreTextAtRight: true});

    const showMoreButtonStyle = getByTestId(
      'expandable-list-show-more-button',
    ).props.style;

    expect(showMoreButtonStyle).toEqual(
      expect.objectContaining({alignSelf: 'flex-end'}),
    );
  });

  it('keeps modal hidden in collapsed state while showing show more control', () => {
    const {getByTestId, queryByTestId} = renderComponent();

    expect(queryByTestId('expanded-row-4')).toBeNull();
    expect(getByTestId('expandable-list-show-more-button')).toBeTruthy();
  });

  it('renders expanded modal content when initialExpanded is true', () => {
    const badge = (
      <View testID="custom-badge" accessibilityLabel="custom-badge" />
    );
    const {getByLabelText, getByTestId, getByText} = renderComponent({
      initialExpanded: true,
      badge,
    });

    expect(getByTestId('expandable-list-modal-sheet')).toBeTruthy();
    expect(getByLabelText('expandable-list-modal-title')).toBeTruthy();
    expect(getByLabelText('expandable-list-modal-footer')).toBeTruthy();
    // Find close button by text since Button component may not expose testID directly
    expect(getByText('close')).toBeTruthy();
    expect(getByTestId('custom-badge')).toBeTruthy();

    expect(getByTestId('expanded-row-0')).toBeTruthy();
    expect(getByTestId('expanded-row-1')).toBeTruthy();
    expect(getByTestId('expanded-row-2')).toBeTruthy();
    expect(getByTestId('expanded-row-3')).toBeTruthy();
    expect(getByTestId('expanded-row-4')).toBeTruthy();
  });

  it('shows modal content and close control when initialized in expanded state', () => {
    const {getByTestId, queryByTestId, getByText} = renderComponent({
      initialExpanded: true,
    });

    expect(getByTestId('expanded-row-4')).toBeTruthy();
    expect(getByText('close')).toBeTruthy();
    expect(queryByTestId('collapsed-row-4')).toBeNull();
  });

  it('passes correct renderItem params for collapsed and expanded lists', () => {
    const renderItemSpy = jest.fn(
      ({
        index,
        isExpanded,
      }: {
        item: string;
        index: number;
        isExpanded: boolean;
        isLast: boolean;
      }) => (
        <View
          testID={`${isExpanded ? 'expanded' : 'collapsed'}-spy-row-${index}`}
        />
      ),
    );

    renderComponent({initialExpanded: true, renderItem: renderItemSpy});

    expect(renderItemSpy).toHaveBeenCalledWith({
      item: 'item-1',
      index: 0,
      isExpanded: false,
      isLast: false,
    });
    expect(renderItemSpy).toHaveBeenCalledWith({
      item: 'item-3',
      index: 2,
      isExpanded: false,
      isLast: true,
    });
    expect(renderItemSpy).toHaveBeenCalledWith({
      item: 'item-1',
      index: 0,
      isExpanded: true,
      isLast: false,
    });
    expect(renderItemSpy).toHaveBeenCalledWith({
      item: 'item-5',
      index: 4,
      isExpanded: true,
      isLast: true,
    });
  });

  it('calls keyExtractor with expansion state for collapsed and expanded sections', () => {
    const keyExtractor = jest.fn(
      (item: string, index: number, isExpanded: boolean) =>
        `${item}-${index}-${isExpanded ? 'expanded' : 'collapsed'}`,
    );

    renderComponent({initialExpanded: true, keyExtractor});

    expect(keyExtractor).toHaveBeenCalledWith('item-1', 0, false);
    expect(keyExtractor).toHaveBeenCalledWith('item-3', 2, false);
    expect(keyExtractor).toHaveBeenCalledWith('item-1', 0, true);
    expect(keyExtractor).toHaveBeenCalledWith('item-5', 4, true);
  });

  it('moves the prioritized item to the first position in collapsed and expanded lists', () => {
    const renderItemSpy = jest.fn(
      ({
        item,
        index,
        isExpanded,
      }: {
        item: string;
        index: number;
        isExpanded: boolean;
        isLast: boolean;
      }) => (
      <View
        testID={`${isExpanded ? 'expanded' : 'collapsed'}-priority-row-${index}`}
        accessibilityLabel={`${isExpanded ? 'expanded' : 'collapsed'}-priority-${item}`}
      />
      ),
    );

    renderComponent({
      initialExpanded: true,
      priorityItemPredicate: item => item === 'item-4',
      renderItem: renderItemSpy,
    });

    expect(renderItemSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        item: 'item-4',
        index: 0,
        isExpanded: false,
      }),
    );
    expect(renderItemSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        item: 'item-1',
        index: 1,
        isExpanded: false,
      }),
    );
    expect(renderItemSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        item: 'item-4',
        index: 0,
        isExpanded: true,
      }),
    );
    expect(renderItemSpy).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        item: 'item-1',
        index: 1,
        isExpanded: true,
      }),
    );
  });
});
