import {interpret} from 'xstate';
import type {VC} from '../VerifiableCredential/VCMetaMachine/vc';
import type {
  MdocPresentationHandlers,
  MdocResult,
  MdocRequest,
} from '../../shared/mdocPresentation/types';
import type {MdocPresentationDependencies} from './mdocPresentationModel';
import {createMdocPresentationMachine} from './mdocPresentationMachine';
import {Tag, encode} from 'cbor2';
import {prepareApprovedElements} from '../../shared/mdocPresentation/prepareApprovedElements';

jest.mock('../../shared/mdocPresentation/MdocPresentation', () => ({
  MdocPresentation: {present: jest.fn(), cancel: jest.fn()},
}));

const namespace = 'org.iso.18013.5.1';
const docType = `${namespace}.mDL`;
const request: MdocRequest = {
  requestNumber: 1,
  documents: [
    {
      docType,
      nameSpaces: {[namespace]: {given_name: false}},
      readerTrust: {status: 'notSigned'},
    },
  ],
};
const vc = (id = 'one', type = docType): VC =>
  ({
    lastVerifiedOn: 0,
    vcMetadata: {id, format: 'mso_mdoc', isExpired: false, isRevoked: 'FALSE'},
    verifiableCredential: {
      credential: 'unfiltered',
      processedCredential: {
        issuerAuth: [{}, {}, {docType: type}],
        nameSpaces: {
          [namespace]: [
            {elementIdentifier: 'given_name', elementValue: 'Kiran'},
          ],
        },
      },
    },
  } as VC);
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

// A stored mdoc with real tag-24 items, so the default preparation can filter it.
function issuedMdoc(elements: Record<string, string>): string {
  const items = Object.entries(elements).map(
    ([elementIdentifier, elementValue], digestID) =>
      new Tag(
        24,
        encode({
          digestID,
          random: new Uint8Array(16),
          elementIdentifier,
          elementValue,
        }),
      ),
  );
  const issuerSigned = {
    issuerAuth: [
      new Uint8Array([0xa0]),
      {},
      new Uint8Array([1]),
      new Uint8Array(64),
    ],
    nameSpaces: {[namespace]: items},
  };
  return Buffer.from(encode(issuerSigned)).toString('base64url');
}

function withStoredMdoc(card: VC, elements: Record<string, string>): VC {
  (card.verifiableCredential as {credential: string}).credential =
    issuedMdoc(elements);
  return card;
}

function setup(
  credentials = [vc()],
  overrides: Partial<MdocPresentationDependencies> = {},
) {
  let callbacks!: MdocPresentationHandlers;
  let finish!: (result: MdocResult) => void;
  const present = jest.fn((_options, handlers: MdocPresentationHandlers) => {
    callbacks = handlers;
    return new Promise<MdocResult>(resolve => {
      finish = resolve;
    });
  });
  const cancel = jest.fn();
  const prepareMdocForSharing = jest.fn().mockResolvedValue('filtered-mdoc');
  const service = interpret(
    createMdocPresentationMachine({
      getCredentials: () => credentials,
      present,
      cancel,
      prepareMdocForSharing,
      now: () => 1000,
      ...overrides,
    }),
  );
  service.start();
  return {
    service,
    present,
    cancel,
    prepareMdocForSharing,
    callbacks: () => callbacks,
    finish: (result: MdocResult) => finish(result),
  };
}

describe('mdoc presentation machine', () => {
  const services: ReturnType<typeof setup>[] = [];
  const start = (...args: Parameters<typeof setup>) => {
    const result = setup(...args);
    services.push(result);
    return result;
  };
  afterEach(() => services.splice(0).forEach(({service}) => service.stop()));

  it('starts the five-minute session countdown when the verifier connects', async () => {
    const flow = start();
    await Promise.resolve();

    flow.callbacks().onProgress('connected');

    expect(flow.service.state.context.requestExpiresAt).toBe(1000 + 300000);
  });

  describe('history', () => {
    const askedBy = (readerName: string): MdocRequest => ({
      ...request,
      documents: [
        {
          ...request.documents[0],
          readerTrust: {status: 'unverified', readerName},
        },
      ],
    });
    const record = (
      type: string,
      credential: VC | undefined,
      details: string[] = ['given_name'],
    ) => ({
      type,
      credential,
      docType,
      details,
      readerName: 'Reader',
      readerTrust: 'unverified',
    });

    it('logs each shared card once the reader confirms, with the details it sent', async () => {
      const recordActivity = jest.fn();
      const selected = vc('one');
      const flow = start([selected, vc('two')], {recordActivity});
      void flow.callbacks().onRequest(askedBy('Reader'));
      flow.service.send('SHARE');
      await settle();
      expect(recordActivity).not.toHaveBeenCalled();

      flow.finish({status: 'completed', confirmedByReader: true});
      await settle();
      flow.service.send('DONE');

      expect(recordActivity).toHaveBeenCalledTimes(1);
      expect(recordActivity).toHaveBeenCalledWith(
        [record('SHARED', selected)],
        1000,
      );
    });

    it.each([
      [{status: 'completed', confirmedByReader: false}, 'SENT_NOT_CONFIRMED'],
      [{status: 'failed', failure: 'timedOut'}, 'SENT_NOT_CONFIRMED'],
      [{status: 'cancelled'}, 'SENDING_STOPPED'],
      [{status: 'failed', failure: 'connectionLost'}, 'SENDING_INTERRUPTED'],
      [
        {status: 'failed', failure: 'readerReportedError'},
        'VERIFIER_REPORTED_PROBLEM',
      ],
      [{status: 'failed', failure: 'internalError'}, 'SENDING_FAILED'],
    ] as [MdocResult, string][])(
      'logs a sent card as %p -> %s',
      async (result, type) => {
        const recordActivity = jest.fn();
        const card = vc();
        const flow = start([card], {recordActivity});
        void flow.callbacks().onRequest(askedBy('Reader'));
        flow.service.send('SHARE');
        await settle();

        flow.finish(result);
        await settle();

        expect(recordActivity).toHaveBeenCalledWith([record(type, card)], 1000);
      },
    );

    it('logs a declined request with the card it asked for and no details', async () => {
      const recordActivity = jest.fn();
      const card = vc();
      const flow = start([card], {recordActivity});
      void flow.callbacks().onRequest(askedBy('Reader'));
      flow.service.send('DECLINE');
      await settle();

      flow.finish({status: 'declined'});
      await settle();

      expect(recordActivity).toHaveBeenCalledWith(
        [record('DECLINED', card, [])],
        1000,
      );
    });

    it('keeps an earlier share in the session when a further request is declined', async () => {
      const recordActivity = jest.fn();
      const card = vc();
      const flow = start([card], {recordActivity});
      const first = flow.callbacks().onRequest(askedBy('Reader'));
      flow.service.send('SHARE');
      await first;
      void flow.callbacks().onRequest({...askedBy('Reader'), requestNumber: 2});
      flow.service.send('DECLINE');
      await settle();

      flow.finish({status: 'declined'});
      await settle();

      expect(recordActivity).toHaveBeenCalledWith(
        [record('SHARED', card), record('DECLINED', card, [])],
        1000,
      );
    });

    it('logs a share made after face verification as face verified', async () => {
      const recordActivity = jest.fn();
      const card = vc();
      const flow = start([card], {recordActivity, showFaceAuthConsent: false});
      void flow.callbacks().onRequest(askedBy('Reader'));
      flow.service.send('VERIFY_AND_SHARE');
      flow.service.send('FACE_VALID');
      await settle();

      flow.finish({status: 'completed', confirmedByReader: true});
      await settle();

      expect(recordActivity).toHaveBeenCalledWith(
        [record('SHARED_WITH_FACE_VERIFICATION', card)],
        1000,
      );
    });

    it('logs a failed face verification straight away', () => {
      const recordActivity = jest.fn();
      const card = vc();
      const flow = start([card], {recordActivity, showFaceAuthConsent: false});
      void flow.callbacks().onRequest(askedBy('Reader'));
      flow.service.send('VERIFY_AND_SHARE');

      flow.service.send('FACE_INVALID');

      expect(recordActivity).toHaveBeenCalledWith(
        [record('FACE_VERIFICATION_FAILED', card, [])],
        1000,
      );
    });

    it('logs nothing when the session ends before any request was answered', async () => {
      const recordActivity = jest.fn();
      const flow = start([vc()], {recordActivity});
      void flow.callbacks().onRequest(askedBy('Reader'));

      flow.finish({status: 'failed', failure: 'connectionLost'});
      await settle();

      expect(recordActivity).not.toHaveBeenCalled();
    });
  });

  it('shows a code that waits 30 seconds for a reader, then five minutes between messages', () => {
    const flow = start();
    expect(flow.present.mock.calls[0][0]).toEqual({
      trustedReaderRoots: [],
      engagementTimeoutSeconds: 30,
      inactivityTimeoutSeconds: 300,
    });
    flow.callbacks().onQrReady('mdoc:qr');
    expect(flow.service.state.context.qrText).toBe('mdoc:qr');
    expect(flow.service.state.context.codeExpiresAt).toBe(31000);
    flow.callbacks().onProgress?.('connecting');
    expect(flow.service.state.matches('presenting.connecting')).toBe(true);
    flow.callbacks().onProgress?.('connected');
    expect(flow.service.state.matches('presenting.waitingForRequest')).toBe(
      true,
    );
    expect(flow.service.state.context.qrText).toBe('');
  });

  it('waits for explicit consent, then filters every requested field before answering', async () => {
    const card = vc();
    const flow = start([card]);
    const decision = flow.callbacks().onRequest(request);
    expect(flow.service.state.matches('presenting.reviewingRequest')).toBe(
      true,
    );
    expect(flow.prepareMdocForSharing).not.toHaveBeenCalled();
    flow.service.send('SHARE');
    await expect(decision).resolves.toEqual({share: ['filtered-mdoc']});
    expect(flow.prepareMdocForSharing).toHaveBeenCalledWith(card, [
      {namespace, elementIdentifier: 'given_name', intentToRetain: false},
    ]);
    expect(flow.service.state.matches('presenting.sending')).toBe(true);
  });

  // the reader asks for a detail the card does not hold (design frame 31)
  const requestWithMissingDetail: MdocRequest = {
    ...request,
    documents: [
      {
        ...request.documents[0],
        nameSpaces: {[namespace]: {given_name: false, age_over_18: true}},
      },
    ],
  };

  it('shares a card that holds only some requested details, filtering to the details it holds', async () => {
    const card = vc();
    const flow = start([card]);
    const decision = flow.callbacks().onRequest(requestWithMissingDetail);

    flow.service.send('SHARE');

    await expect(decision).resolves.toEqual({share: ['filtered-mdoc']});
    expect(flow.prepareMdocForSharing).toHaveBeenCalledWith(card, [
      {namespace, elementIdentifier: 'given_name', intentToRetain: false},
    ]);
  });

  it('preselects a card with every requested detail ticked, as the design shows', () => {
    const flow = start([vc()]);

    void flow.callbacks().onRequest(request);

    expect(flow.service.state.context.selection[docType]).toBe('one');
    expect(flow.service.state.context.checkedFields[docType]).toEqual([
      JSON.stringify([namespace, 'given_name']),
    ]);
  });

  it('clears every ticked detail of a document at once', () => {
    const flow = start([vc()]);
    void flow.callbacks().onRequest(request);

    flow.service.send({type: 'CLEAR_ALL_FIELDS', docType});

    expect(flow.service.state.context.checkedFields[docType]).toEqual([]);
  });

  it('ticks every requested detail of a document again after clearing', () => {
    const flow = start([vc()]);
    void flow.callbacks().onRequest(request);
    flow.service.send({type: 'CLEAR_ALL_FIELDS', docType});

    flow.service.send({type: 'SELECT_ALL_FIELDS', docType});

    expect(flow.service.state.context.checkedFields[docType]).toEqual([
      JSON.stringify([namespace, 'given_name']),
    ]);
  });

  it('ignores select all for a document the reader did not ask for', () => {
    const flow = start([vc()]);
    void flow.callbacks().onRequest(request);

    flow.service.send({type: 'SELECT_ALL_FIELDS', docType: 'not.requested'});

    expect(flow.service.state.context.checkedFields).not.toHaveProperty(
      'not.requested',
    );
  });

  it('does not share when the only ticked details are ones missing from the card', () => {
    const flow = start([vc()]);
    void flow.callbacks().onRequest(requestWithMissingDetail);
    flow.service.send({
      type: 'TOGGLE_FIELD',
      docType,
      namespace,
      elementIdentifier: 'given_name',
    });

    flow.service.send('SHARE');

    expect(flow.service.state.matches('presenting.reviewingRequest')).toBe(
      true,
    );
    expect(flow.prepareMdocForSharing).not.toHaveBeenCalled();
  });

  it('passes only the details the holder left ticked to filtering', async () => {
    const card = vc();
    card.verifiableCredential.processedCredential.nameSpaces[namespace].push({
      elementIdentifier: 'age_over_18',
      elementValue: true,
    });
    const flow = start([card]);
    const decision = flow.callbacks().onRequest(requestWithMissingDetail);
    flow.service.send({
      type: 'TOGGLE_FIELD',
      docType,
      namespace,
      elementIdentifier: 'age_over_18',
    });

    flow.service.send('SHARE');

    await expect(decision).resolves.toEqual({share: ['filtered-mdoc']});
    expect(flow.prepareMdocForSharing).toHaveBeenCalledWith(card, [
      {namespace, elementIdentifier: 'given_name', intentToRetain: false},
    ]);
  });

  it('shares the card the holder switches to when two cards have the requested docType', async () => {
    const second = vc('two');
    const flow = start([vc('one'), second]);
    const decision = flow.callbacks().onRequest(request);

    flow.service.send({type: 'SELECT_CARD', docType, credentialId: 'two'});
    flow.service.send('SHARE');

    await expect(decision).resolves.toEqual({share: ['filtered-mdoc']});
    expect(flow.prepareMdocForSharing.mock.calls[0][0]).toBe(second);
  });

  it('does not send a partial response when another document has no matching card', () => {
    const flow = start();
    void flow.callbacks().onRequest({
      ...request,
      documents: [
        ...request.documents,
        {...request.documents[0], docType: 'missing'},
      ],
    });
    flow.service.send('SHARE');
    expect(flow.service.state.matches('presenting.reviewingRequest')).toBe(
      true,
    );
    expect(flow.prepareMdocForSharing).not.toHaveBeenCalled();
  });

  it('ignores a selection that is not a candidate for the requested document', () => {
    const flow = start([vc('one'), vc('two')]);
    void flow.callbacks().onRequest(request);

    flow.service.send({type: 'SELECT_CARD', docType, credentialId: 'fake'});

    expect(flow.service.state.context.selection[docType]).toBe('one');
  });

  it('preselects a card when several match, as design frame 26 shows', () => {
    const flow = start([vc('one'), vc('two')]);

    void flow.callbacks().onRequest(request);

    expect(flow.service.state.context.selection[docType]).toBe('one');
  });

  it('preselects the card that holds the most requested details', () => {
    const fuller = vc('two');
    fuller.verifiableCredential.processedCredential.nameSpaces[namespace].push({
      elementIdentifier: 'family_name',
      elementValue: 'Rao',
    });
    const flow = start([vc('one'), fuller]);

    void flow.callbacks().onRequest({
      ...request,
      documents: [
        {
          ...request.documents[0],
          nameSpaces: {[namespace]: {given_name: false, family_name: false}},
        },
      ],
    });

    expect(flow.service.state.context.selection[docType]).toBe('two');
  });

  it('preselects a valid card over an expired one', () => {
    const expired = vc('one');
    expired.vcMetadata.isExpired = true;
    const flow = start([expired, vc('two')]);

    void flow.callbacks().onRequest(request);

    expect(flow.service.state.context.selection[docType]).toBe('two');
  });

  it('preselects nothing when every matching card is revoked', () => {
    const revoked = vc('one');
    revoked.vcMetadata.isRevoked = 'TRUE';
    const flow = start([revoked]);

    void flow.callbacks().onRequest(request);

    expect(flow.service.state.context.selection[docType]).toBeUndefined();
  });

  it('blocks a revoked card before preparing a response', () => {
    const card = vc();
    card.vcMetadata.isRevoked = 'TRUE';
    const flow = start([card]);
    void flow.callbacks().onRequest(request);

    flow.service.send('SHARE');

    expect(flow.service.state.matches('presenting.reviewingRequest')).toBe(
      true,
    );
    expect(flow.prepareMdocForSharing).not.toHaveBeenCalled();
  });

  it('lets the holder share an expired card, as design frame 37 allows', async () => {
    const card = vc();
    card.vcMetadata.isExpired = true;
    const flow = start([card]);
    void flow.callbacks().onRequest(request);

    flow.service.send('SHARE');
    await settle();

    expect(flow.prepareMdocForSharing).toHaveBeenCalledTimes(1);
  });

  it('rechecks a selected card against the wallet before filtering', async () => {
    const getCredentials = jest.fn().mockReturnValue([vc()]);
    const flow = start([], {getCredentials});
    void flow.callbacks().onRequest(request);
    getCredentials.mockReturnValue([]);

    flow.service.send('SHARE');
    await settle();

    expect(flow.service.state.matches('presenting.preparationFailed')).toBe(
      true,
    );
    expect(flow.prepareMdocForSharing).not.toHaveBeenCalled();
  });

  it('prepares one credential per requested docType in request order', async () => {
    const otherType = 'other.document';
    const first = vc('first');
    const second = vc('second', otherType);
    const flow = start([first, second]);
    const decision = flow.callbacks().onRequest({
      ...request,
      documents: [
        ...request.documents,
        {...request.documents[0], docType: otherType},
      ],
    });
    flow.prepareMdocForSharing
      .mockResolvedValueOnce('first-filtered')
      .mockResolvedValueOnce('second-filtered');

    flow.service.send('SHARE');

    await expect(decision).resolves.toEqual({
      share: ['first-filtered', 'second-filtered'],
    });
    expect(flow.prepareMdocForSharing.mock.calls.map(call => call[0])).toEqual([
      first,
      second,
    ]);
  });

  it('declines through the pending request and waits for the native result', async () => {
    const flow = start();
    const decision = flow.callbacks().onRequest(request);
    flow.service.send('DECLINE');
    await expect(decision).resolves.toBe('decline');
    expect(flow.service.state.matches('presenting.declining')).toBe(true);
    flow.finish({status: 'declined'});
    await settle();
    expect(flow.service.state.context.outcome).toBe('declined');
  });

  it('asks for consent again for a further request and preselects afresh', async () => {
    const flow = start([vc('one'), vc('two')]);
    const firstDecision = flow.callbacks().onRequest(request);
    flow.service.send({type: 'SELECT_CARD', docType, credentialId: 'two'});
    flow.service.send('SHARE');
    await firstDecision;
    const next = {...request, requestNumber: 2};
    void flow.callbacks().onRequest(next);
    expect(flow.service.state.context.selection).toEqual({[docType]: 'one'});
    expect(flow.service.state.context.request?.requestNumber).toBe(2);
    expect(flow.service.state.matches('presenting.reviewingRequest')).toBe(
      true,
    );
    expect(flow.prepareMdocForSharing).toHaveBeenCalledTimes(1);
  });

  it('retains the consent request when filtering fails and supports retry', async () => {
    const flow = start();
    flow.prepareMdocForSharing.mockRejectedValueOnce(
      new Error('Filtering failed'),
    );
    const decision = flow.callbacks().onRequest(request);
    flow.service.send('SHARE');
    await settle();
    expect(flow.service.state.matches('presenting.preparationFailed')).toBe(
      true,
    );
    expect(flow.service.state.context.error).toBe('Filtering failed');
    flow.service.send('RETRY');
    await expect(decision).resolves.toEqual({share: ['filtered-mdoc']});
  });

  it('shares only the approved details of the stored card after explicit approval', async () => {
    // the card also holds family_name, which the reader did not ask for
    const card = withStoredMdoc(vc(), {
      given_name: 'Kiran',
      family_name: 'Rao',
    });
    const flow = start([card], {
      prepareMdocForSharing: prepareApprovedElements,
    });
    const decision = flow.callbacks().onRequest(request);

    flow.service.send('SHARE');

    const answer = (await decision) as {share: string[]};
    // the kept item stays byte-identical, so the card equals one issued with only that item
    expect(answer.share).toEqual([issuedMdoc({given_name: 'Kiran'})]);
  });

  it('sends details only from the card chosen by the holder when multiple cards match', async () => {
    const first = withStoredMdoc(vc('one'), {given_name: 'First'});
    const second = withStoredMdoc(vc('two'), {given_name: 'Second'});
    const flow = start([first, second], {
      prepareMdocForSharing: prepareApprovedElements,
    });
    const decision = flow.callbacks().onRequest(request);
    flow.service.send({type: 'SELECT_CARD', docType, credentialId: 'two'});

    flow.service.send('SHARE');

    const answer = (await decision) as {share: string[]};
    expect(answer.share).toEqual([issuedMdoc({given_name: 'Second'})]);
  });

  it('leaves details the holder unticked out of the shared card', async () => {
    const card = withStoredMdoc(vc(), {
      given_name: 'Kiran',
      family_name: 'Rao',
    });
    const processed = (
      card.verifiableCredential as {
        processedCredential: {nameSpaces: Record<string, unknown[]>};
      }
    ).processedCredential;
    processed.nameSpaces[namespace].push({
      elementIdentifier: 'family_name',
      elementValue: 'Rao',
    });
    const flow = start([card], {
      prepareMdocForSharing: prepareApprovedElements,
    });
    const decision = flow.callbacks().onRequest({
      ...request,
      documents: [
        {
          ...request.documents[0],
          nameSpaces: {[namespace]: {given_name: false, family_name: false}},
        },
      ],
    });
    flow.service.send({
      type: 'TOGGLE_FIELD',
      docType,
      namespace,
      elementIdentifier: 'family_name',
    });

    flow.service.send('SHARE');

    const answer = (await decision) as {share: string[]};
    // the kept item stays byte-identical, so the card equals one issued with only that item
    expect(answer.share).toEqual([issuedMdoc({given_name: 'Kiran'})]);
  });

  it('does not share when all requested details are unticked', () => {
    const flow = start([vc()], {
      prepareMdocForSharing: prepareApprovedElements,
    });
    void flow.callbacks().onRequest(request);
    flow.service.send({
      type: 'TOGGLE_FIELD',
      docType,
      namespace,
      elementIdentifier: 'given_name',
    });
    flow.service.send('SHARE');
    expect(flow.service.state.matches('presenting.reviewingRequest')).toBe(
      true,
    );
  });

  it('fails before sending when the original mdoc is missing', async () => {
    const card = vc();
    (card.verifiableCredential as {credential: string}).credential = '';
    const flow = start([card], {
      prepareMdocForSharing: prepareApprovedElements,
    });
    void flow.callbacks().onRequest(request);
    flow.service.send('SHARE');
    await settle();
    expect(flow.service.state.matches('presenting.preparationFailed')).toBe(
      true,
    );
    expect(flow.service.state.context.error).toBe(
      'The selected card has no stored mdoc credential',
    );
  });

  it.each(['CANCEL', 'APP_INACTIVE', 'STOP'] as const)(
    'cancels on %s and waits for native cleanup',
    async event => {
      const flow = start();
      flow.service.send(event);
      expect(flow.cancel).toHaveBeenCalledTimes(1);
      expect(flow.service.state.matches('presenting.stopping')).toBe(true);
      flow.service.send('NEW_CODE');
      expect(flow.present).toHaveBeenCalledTimes(1);
      flow.finish({status: 'cancelled'});
      await settle();
      expect(flow.service.state.context.outcome).toBe('sessionEnded');
      flow.service.send('NEW_CODE');
      expect(flow.present).toHaveBeenCalledTimes(2);
      expect(flow.service.state.context.request).toBeUndefined();
    },
  );

  it('stops pending consent and native presentation when the actor is disposed', async () => {
    const flow = start();
    const decision = flow.callbacks().onRequest(request);
    flow.service.stop();
    await expect(decision).resolves.toBe('decline');
    expect(flow.cancel).toHaveBeenCalledTimes(1);
  });

  it('does not answer a cancelled request when filtering finishes late', async () => {
    let finishFiltering: (credential: string) => void = () => undefined;
    const flow = start([vc()], {
      prepareMdocForSharing: () =>
        new Promise(resolve => {
          finishFiltering = resolve;
        }),
    });
    const decision = flow.callbacks().onRequest(request);
    flow.service.send('SHARE');
    flow.service.send('CANCEL');
    finishFiltering('late-credential');
    await expect(decision).resolves.toBe('decline');
    await settle();
    expect(flow.service.state.matches('presenting.stopping')).toBe(true);
    expect(flow.cancel).toHaveBeenCalledTimes(1);
  });

  it('requires face verification on the share-with-selfie path', async () => {
    const flow = start();
    const decision = flow.callbacks().onRequest(request);
    flow.service.send('VERIFY_AND_SHARE');
    expect(
      flow.service.state.matches('presenting.faceVerificationConsent'),
    ).toBe(true);
    expect(flow.prepareMdocForSharing).not.toHaveBeenCalled();
    flow.service.send('FACE_VERIFICATION_CONSENT');
    flow.service.send('FACE_INVALID');
    expect(flow.service.state.matches('presenting.invalidIdentity')).toBe(true);
    flow.service.send('RETRY_VERIFICATION');
    flow.service.send('FACE_VALID');
    await expect(decision).resolves.toEqual({share: ['filtered-mdoc']});
  });

  it('skips the face-consent explanation, but still requires verification, when the setting is off', () => {
    const flow = start([vc()], {showFaceAuthConsent: false});
    void flow.callbacks().onRequest(request);

    flow.service.send('VERIFY_AND_SHARE');

    expect(flow.service.state.matches('presenting.verifyingIdentity')).toBe(
      true,
    );
    expect(flow.prepareMdocForSharing).not.toHaveBeenCalled();
  });

  it('reports a bridge startup failure without cancelling another native session', async () => {
    const flow = start([vc()], {
      present: () =>
        Promise.reject(new Error('A presentation is already running')),
    });

    await settle();

    expect(flow.service.state.context.outcome).toBe('error');
    expect(flow.service.state.context.error).toBe(
      'A presentation is already running',
    );
    expect(flow.cancel).not.toHaveBeenCalled();
  });

  it.each([
    [{status: 'completed', confirmedByReader: true}, 'shared'],
    [{status: 'completed', confirmedByReader: false}, 'sentNotConfirmed'],
    [{status: 'declined'}, 'declined'],
    [{status: 'cancelled'}, 'sessionEnded'],
    ...Object.entries({
      noReaderFound: 'codeExpired',
      connectionFailed: 'couldntConnect',
      connectionLost: 'connectionLost',
      bluetoothOff: 'bluetoothOff',
      timedOut: 'timedOut',
      readerReportedError: 'verifierError',
      requestUnreadable: 'requestUnreadable',
      readerSecurityError: 'requestUnreadable',
      readerEnded: 'readerEnded',
      internalError: 'error',
    }).map(([failure, outcome]): [MdocResult, string] => [
      {status: 'failed', failure},
      outcome,
    ]),
  ])('maps native result %p to %s', async (result, outcome) => {
    const flow = start();
    flow.finish(result as MdocResult);
    await settle();
    expect(flow.service.state.matches('outcome')).toBe(true);
    expect(flow.service.state.context.outcome).toBe(outcome);
    expect(flow.cancel).not.toHaveBeenCalled();
    flow.service.send('DONE');
    expect(flow.service.state.done).toBe(true);
  });

  it.each([
    [{status: 'cancelled'}, 'stopped'],
    [{status: 'failed', failure: 'connectionLost'}, 'interrupted'],
  ])('maps result %p during sending to %s', async (result, outcome) => {
    const flow = start();
    const decision = flow.callbacks().onRequest(request);
    flow.service.send('SHARE');
    await decision;
    flow.finish(result as MdocResult);
    await settle();
    expect(flow.service.state.context.outcome).toBe(outcome);
  });
});
