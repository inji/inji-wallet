import {useSelectVcOverlay} from './SelectVcOverlayController';

describe('useSelectVcOverlay', () => {
  const mockOnSelect = jest.fn();
  const mockOnVerifyAndSelect = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    isVisible: true,
    receiverName: 'TestReceiver',
    vcMetadatas: [],
    onSelect: mockOnSelect,
    onVerifyAndSelect: mockOnVerifyAndSelect,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return expected properties', () => {
    const result = useSelectVcOverlay(defaultProps);
    expect(result.selectVcItem).toBeDefined();
    expect(result.selectedIndex).toBeNull();
    expect(result.onSelect).toBeDefined();
    expect(result.onVerifyAndSelect).toBeDefined();
  });

  it('selectVcItem returns a function that can be called with a vcRef', () => {
    const result = useSelectVcOverlay(defaultProps);
    const selectFn = result.selectVcItem(0);
    expect(typeof selectFn).toBe('function');
    selectFn();
  });
});
