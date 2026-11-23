import {MdocShareActivityLog} from './MdocShareActivityLogEvent';
import {VCItemContainerFlowType} from '../shared/Utils';

describe('MdocShareActivityLog', () => {
  const shared = () =>
    MdocShareActivityLog.getLogFromObject({
      type: 'SHARED',
      timestamp: Date.now(),
      _vcKey: 'VC_issued-at_card-1',
      cardName: 'Mobile Driving Licence',
      readerName: 'Reader',
      details: ['given_name', 'family_name'],
    });

  it('belongs to the in-person mdoc sharing flow', () => {
    expect(shared().flow).toBe(VCItemContainerFlowType.MDOC_SHARE);
  });

  it('reads its text from the mdoc sharing entries, naming the card and the number of details', () => {
    const t = jest.fn((key: string) => key);

    shared().getActionText(t as any);

    expect(t).toHaveBeenCalledWith('ActivityLogText:mdocSharing:SHARED', {
      card: 'Mobile Driving Licence',
      count: 2,
    });
  });

  it('labels the entry with the reader and how long ago it happened', () => {
    expect(shared().getActionLabel('en')).toMatch(/^Reader · /);
  });

  it('leaves the reader out of the label when the reader gave no name', () => {
    const unnamed = MdocShareActivityLog.getLogFromObject({
      type: 'DECLINED',
      timestamp: Date.now(),
    });

    expect(unnamed.getActionLabel('en')).not.toContain('·');
  });
});
