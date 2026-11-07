const mockPresent = jest.fn();
const mockCancel = jest.fn();
const mockSendDecision = jest.fn();
const mockSendSignature = jest.fn();
const mockSignDataForVpPreparation = jest.fn();
type NativeEvent = Record<string, string>;
const listeners: Record<string, (event: NativeEvent) => unknown> = {};
const mockRemove = jest.fn();

// The project's setup file mocks react-native for every test; reset the module registry and
// register this file's mock before loading MdocPresentation, as the VciClient tests do.
let MdocPresentation: typeof import('./MdocPresentation').MdocPresentation;
let emitterCountAfterImport: number;

beforeAll(() => {
  jest.resetModules();
  jest.doMock('react-native', () => ({
    NativeModules: {
      InjiMdocPresentation: {
        present: (...args: unknown[]) => mockPresent(...args),
        cancel: () => mockCancel(),
        sendMdocDecisionFromJS: (json: string) => mockSendDecision(json),
        sendMdocSignatureFromJS: (json: string) => mockSendSignature(json),
      },
    },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: (
        name: string,
        listener: (event: NativeEvent) => unknown,
      ) => {
        listeners[name] = listener;
        return {remove: () => mockRemove(name)};
      },
    })),
  }));
  jest.doMock('../openID4VP/OpenID4VPHelper', () => ({
    signDataForVpPreparation: (tokens: unknown) =>
      mockSignDataForVpPreparation(tokens),
  }));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MdocPresentation = require('./MdocPresentation').MdocPresentation;
  emitterCountAfterImport =
    jest.requireMock('react-native').NativeEventEmitter.mock.calls.length;
});

/** Lets pending promise callbacks run. */
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

const handlers = (overrides: Record<string, unknown> = {}) => ({
  onQrReady: jest.fn(),
  onProgress: jest.fn(),
  onRequest: jest.fn().mockResolvedValue('decline'),
  ...overrides,
});

describe('MdocPresentation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(listeners).forEach(name => delete listeners[name]);
  });

  describe('present', () => {
    it('does not initialise the native event emitter until a session starts', () => {
      expect(emitterCountAfterImport).toBe(0);
    });
    it('passes the options to the native module as JSON and resolves the parsed result', async () => {
      mockPresent.mockResolvedValue(
        JSON.stringify({status: 'completed', confirmedByReader: true}),
      );

      const result = await MdocPresentation.present(
        {inactivityTimeoutSeconds: 120},
        handlers(),
      );

      expect(JSON.parse(mockPresent.mock.calls[0][0])).toEqual({
        inactivityTimeoutSeconds: 120,
      });
      expect(result).toEqual({status: 'completed', confirmedByReader: true});
    });

    it('rejects with the native error when the presentation cannot start', async () => {
      mockPresent.mockRejectedValue(
        new Error('A presentation is already running'),
      );

      await expect(MdocPresentation.present({}, handlers())).rejects.toThrow(
        'A presentation is already running',
      );
    });

    it('removes its listeners once the presentation has ended', async () => {
      mockPresent.mockResolvedValue(JSON.stringify({status: 'declined'}));

      await MdocPresentation.present({}, handlers());

      expect(mockRemove.mock.calls.map(call => call[0]).sort()).toEqual([
        'onMdocProgress',
        'onMdocQrReady',
        'onMdocRequest',
        'onMdocSignRequest',
      ]);
    });

    it('removes its listeners when the presentation fails to start', async () => {
      mockPresent.mockRejectedValue(new Error('failed'));

      await MdocPresentation.present({}, handlers()).catch(() => undefined);

      expect(mockRemove).toHaveBeenCalledTimes(4);
    });
  });

  describe('events from the native module', () => {
    let finishPresentation: (resultJson: string) => void;

    beforeEach(() => {
      mockPresent.mockImplementation(
        () => new Promise(resolve => (finishPresentation = resolve)),
      );
    });

    it('passes the QR text to onQrReady', async () => {
      const callbacks = handlers();
      const presenting = MdocPresentation.present({}, callbacks);

      listeners.onMdocQrReady({qrText: 'mdoc:owBjMS4w'});
      finishPresentation(JSON.stringify({status: 'cancelled'}));
      await presenting;

      expect(callbacks.onQrReady).toHaveBeenCalledWith('mdoc:owBjMS4w');
    });

    it('passes progress to onProgress', async () => {
      const callbacks = handlers();
      const presenting = MdocPresentation.present({}, callbacks);

      listeners.onMdocProgress({progress: 'connected'});
      finishPresentation(JSON.stringify({status: 'cancelled'}));
      await presenting;

      expect(callbacks.onProgress).toHaveBeenCalledWith('connected');
    });

    it('hands the parsed request to onRequest and sends the credentials to share', async () => {
      const request = {
        requestNumber: 1,
        documents: [
          {
            docType: 'org.iso.18013.5.1.mDL',
            nameSpaces: {'org.iso.18013.5.1': {age_over_18: false}},
            readerTrust: {status: 'notSigned'},
          },
        ],
      };
      const callbacks = handlers({
        onRequest: jest.fn().mockResolvedValue({share: ['b2RvYw']}),
      });
      const presenting = MdocPresentation.present({}, callbacks);

      listeners.onMdocRequest({request: JSON.stringify(request)});
      await settle();
      finishPresentation(
        JSON.stringify({status: 'completed', confirmedByReader: true}),
      );
      await presenting;

      expect(callbacks.onRequest).toHaveBeenCalledWith(request);
      expect(JSON.parse(mockSendDecision.mock.calls[0][0])).toEqual({
        share: ['b2RvYw'],
      });
    });

    it('sends a decline when the holder declines', async () => {
      const presenting = MdocPresentation.present({}, handlers());

      listeners.onMdocRequest({
        request: JSON.stringify({requestNumber: 1, documents: []}),
      });
      await settle();
      finishPresentation(JSON.stringify({status: 'declined'}));
      await presenting;

      expect(JSON.parse(mockSendDecision.mock.calls[0][0])).toEqual({
        decline: true,
      });
    });

    it('sends an error decision when onRequest throws', async () => {
      const callbacks = handlers({
        onRequest: jest
          .fn()
          .mockRejectedValue(new Error('no matching credential')),
      });
      const presenting = MdocPresentation.present({}, callbacks);

      listeners.onMdocRequest({
        request: JSON.stringify({requestNumber: 1, documents: []}),
      });
      await settle();
      finishPresentation(
        JSON.stringify({status: 'failed', failure: 'internalError'}),
      );
      await presenting;

      expect(JSON.parse(mockSendDecision.mock.calls[0][0])).toEqual({
        error: 'no matching credential',
      });
    });

    it('signs with the existing VP signing path by default and sends the signature', async () => {
      mockSignDataForVpPreparation.mockResolvedValue([
        {id: 'mdoc-proximity', signedData: 'c2lnbmF0dXJl'},
      ]);
      const presenting = MdocPresentation.present({}, handlers());

      listeners.onMdocSignRequest({
        dataToSign: 'ZGF0YQ',
        signatureAlgorithm: 'ES256',
        holderKeyReference: 'a2V5',
      });
      await settle();
      finishPresentation(JSON.stringify({status: 'cancelled'}));
      await presenting;

      expect(mockSignDataForVpPreparation).toHaveBeenCalledWith([
        {
          id: 'mdoc-proximity',
          format: 'mso_mdoc',
          holderKeyReference: 'a2V5',
          signatureAlgorithm: 'ES256',
          dataToSign: 'ZGF0YQ',
        },
      ]);
      expect(JSON.parse(mockSendSignature.mock.calls[0][0])).toEqual({
        signature: 'c2lnbmF0dXJl',
      });
    });

    it('signs with the sign handler when one is given', async () => {
      const sign = jest.fn().mockResolvedValue('b3du');
      const presenting = MdocPresentation.present({}, handlers({sign}));

      listeners.onMdocSignRequest({
        dataToSign: 'ZGF0YQ',
        signatureAlgorithm: 'ES256',
        holderKeyReference: 'a2V5',
      });
      await settle();
      finishPresentation(JSON.stringify({status: 'cancelled'}));
      await presenting;

      expect(sign).toHaveBeenCalledWith({
        dataToSign: 'ZGF0YQ',
        signatureAlgorithm: 'ES256',
        holderKeyReference: 'a2V5',
      });
      expect(mockSignDataForVpPreparation).not.toHaveBeenCalled();
      expect(JSON.parse(mockSendSignature.mock.calls[0][0])).toEqual({
        signature: 'b3du',
      });
    });

    it('sends a signing error when signing fails', async () => {
      const sign = jest
        .fn()
        .mockRejectedValue(new Error('biometric prompt cancelled'));
      const presenting = MdocPresentation.present({}, handlers({sign}));

      listeners.onMdocSignRequest({
        dataToSign: 'ZGF0YQ',
        signatureAlgorithm: 'ES256',
        holderKeyReference: 'a2V5',
      });
      await settle();
      finishPresentation(
        JSON.stringify({status: 'failed', failure: 'internalError'}),
      );
      await presenting;

      expect(JSON.parse(mockSendSignature.mock.calls[0][0])).toEqual({
        error: 'biometric prompt cancelled',
      });
    });

    it('rejects a concurrent presentation without attaching another set of listeners', async () => {
      const presenting = MdocPresentation.present({}, handlers());
      const firstRequestListener = listeners.onMdocRequest;

      await expect(MdocPresentation.present({}, handlers())).rejects.toThrow(
        'A presentation is already running',
      );
      expect(mockPresent).toHaveBeenCalledTimes(1);
      expect(listeners.onMdocRequest).toBe(firstRequestListener);
      finishPresentation(JSON.stringify({status: 'cancelled'}));
      await presenting;
    });

    it('reports a synchronous request-handler error to native code', async () => {
      const presenting = MdocPresentation.present(
        {},
        handlers({
          onRequest: () => {
            throw new Error('Unable to load wallet');
          },
        }),
      );

      listeners.onMdocRequest({
        request: JSON.stringify({requestNumber: 1, documents: []}),
      });
      await settle();

      expect(mockSendDecision).toHaveBeenCalledWith(
        JSON.stringify({error: 'Unable to load wallet'}),
      );
      finishPresentation(
        JSON.stringify({status: 'failed', failure: 'internalError'}),
      );
      await presenting;
    });

    it('reports malformed native request JSON rather than leaving native waiting', async () => {
      const callbacks = handlers();
      const presenting = MdocPresentation.present({}, callbacks);

      listeners.onMdocRequest({request: 'not JSON'});
      await settle();

      expect(callbacks.onRequest).not.toHaveBeenCalled();
      expect(mockSendDecision).toHaveBeenCalledTimes(1);
      expect(typeof JSON.parse(mockSendDecision.mock.calls[0][0]).error).toBe(
        'string',
      );
      finishPresentation(
        JSON.stringify({status: 'failed', failure: 'internalError'}),
      );
      await presenting;
    });

    it('reports a synchronous signing error to native code', async () => {
      const presenting = MdocPresentation.present(
        {},
        handlers({
          sign: () => {
            throw new Error('Key unavailable');
          },
        }),
      );

      listeners.onMdocSignRequest({
        dataToSign: 'ZGF0YQ',
        signatureAlgorithm: 'ES256',
        holderKeyReference: 'a2V5',
      });
      await settle();

      expect(mockSendSignature).toHaveBeenCalledWith(
        JSON.stringify({error: 'Key unavailable'}),
      );
      finishPresentation(
        JSON.stringify({status: 'failed', failure: 'internalError'}),
      );
      await presenting;
    });

    it.each(['cancelled', 'ended'])(
      'does not send a late decision after the presentation is %s',
      async ending => {
        let decide: (value: {share: string[]}) => void = () => undefined;
        const presenting = MdocPresentation.present(
          {},
          handlers({
            onRequest: () =>
              new Promise(resolve => {
                decide = resolve;
              }),
          }),
        );
        listeners.onMdocRequest({
          request: JSON.stringify({requestNumber: 1, documents: []}),
        });
        await settle();

        if (ending === 'cancelled') {
          MdocPresentation.cancel();
        } else {
          finishPresentation(JSON.stringify({status: 'cancelled'}));
          await presenting;
        }
        decide({share: ['b2RvYw']});
        await settle();

        expect(mockSendDecision).not.toHaveBeenCalled();
        finishPresentation(JSON.stringify({status: 'cancelled'}));
        await presenting;
      },
    );

    it('does not deliver an old signature into a new presentation', async () => {
      let finishSigning: (signature: string) => void = () => undefined;
      const presenting = MdocPresentation.present(
        {},
        handlers({
          sign: () =>
            new Promise(resolve => {
              finishSigning = resolve;
            }),
        }),
      );
      listeners.onMdocSignRequest({
        dataToSign: 'ZGF0YQ',
        signatureAlgorithm: 'ES256',
        holderKeyReference: 'a2V5',
      });
      await settle();
      finishPresentation(JSON.stringify({status: 'cancelled'}));
      await presenting;

      const nextPresentation = MdocPresentation.present({}, handlers());
      finishSigning('b2xk');
      await settle();

      expect(mockSendSignature).not.toHaveBeenCalled();
      finishPresentation(JSON.stringify({status: 'cancelled'}));
      await nextPresentation;
    });
  });

  describe('cancel', () => {
    it('asks the native module to cancel the running presentation', () => {
      MdocPresentation.cancel();

      expect(mockCancel).toHaveBeenCalledTimes(1);
    });
  });
});
