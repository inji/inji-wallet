import {
  buildInPersonShareLog,
  presentmentVerifierName,
} from './presentmentActivityLog';
import {VCMetadata} from '../VCMetadata';
import {MdocPresentmentConsentRequest} from './iso18013PresentmentInterop';

const meta = new VCMetadata({
  id: 'mdl-1',
  requestId: 'mdl-1',
  format: 'mso_mdoc',
  issuerHost: 'https://rta.example',
  credentialType: 'Driving Licence',
  issuerName: 'Road Transport Authority',
});

const element = (name: string) => ({
  namespace: 'org.iso.18013.5.1',
  element: name,
  intentToRetain: false,
  optional: false,
});

const request: MdocPresentmentConsentRequest = {
  docType: 'org.iso.18013.5.1.mDL',
  verifierName: 'Reader certificate name',
  requestInfo: {verifier_name: ' Metro Traffic Police '},
  elements: [element('family_name'), element('portrait'), element('portrait')],
};

describe('presentmentVerifierName', () => {
  it("prefers the verifier's own name from the request", () => {
    expect(presentmentVerifierName(request)).toBe('Metro Traffic Police');
  });

  it('falls back to the reader name, then to nothing', () => {
    expect(presentmentVerifierName({...request, requestInfo: undefined})).toBe(
      'Reader certificate name',
    );
    expect(presentmentVerifierName(null)).toBe('');
  });
});

describe('buildInPersonShareLog', () => {
  it('records the card, verifier and each disclosed element for a share', () => {
    const log = buildInPersonShareLog(
      'VC_SHARED_IN_PERSON',
      meta,
      'mDL_config',
      request,
    );

    expect(log).toMatchObject({
      _vcKey: meta.getVcKey(),
      type: 'VC_SHARED_IN_PERSON',
      issuer: 'https://rta.example',
      credentialConfigurationId: 'mDL_config',
      deviceName: 'Metro Traffic Police',
      credentialName: 'Driving Licence',
      issuerName: 'Road Transport Authority',
      sharedDetails: ['family_name', 'portrait'],
    });
  });

  it('records only the details the user chose to share', () => {
    const log = buildInPersonShareLog(
      'VC_SHARED_IN_PERSON',
      meta,
      'mDL_config',
      request,
      [element('family_name')],
    );
    expect(log.sharedDetails).toEqual(['family_name']);
  });

  it('records no details when nothing was shared', () => {
    const log = buildInPersonShareLog(
      'VC_SHARE_IN_PERSON_DECLINED',
      meta,
      'mDL_config',
      request,
    );
    expect(log.sharedDetails).toEqual([]);
    expect(log.deviceName).toBe('Metro Traffic Police');
  });

  it('handles a session that failed before any request arrived', () => {
    const log = buildInPersonShareLog(
      'VC_SHARE_IN_PERSON_FAILED',
      meta,
      undefined,
      null,
    );
    expect(log).toMatchObject({
      type: 'VC_SHARE_IN_PERSON_FAILED',
      deviceName: '',
      credentialConfigurationId: '',
      sharedDetails: [],
    });
  });
});
