import {Buffer} from 'buffer';
import {decode, encode, Tag} from 'cbor2';
import {readOriginalMdoc} from './MdocImages';

const namespace = 'org.iso.18013.5.1';
const bytes = new Uint8Array([255, 216, 255, 0]);
const claim = new Tag(
  24,
  new Uint8Array(
    encode({
      elementIdentifier: 'portrait',
      elementValue: bytes,
    }),
  ),
);

describe('binary mdoc image recovery', () => {
  it.each([true, false])(
    'recovers bytes with issuerSigned wrapper=%p',
    wrapped => {
      const issuerSigned = {nameSpaces: {[namespace]: [claim]}};
      const root = wrapped ? {issuerSigned} : issuerSigned;
      const encoded = Buffer.from(encode(root)).toString('base64url');
      const before = Tag.getDecoder(24);
      expect(readOriginalMdoc(encoded).images.portraits).toEqual({
        [namespace]: bytes,
      });
      expect(Tag.getDecoder(24)).toBe(before);
      expect(
        decode(new Uint8Array(Buffer.from(encoded, 'base64url')), {
          ignoreGlobalTags: true,
        }),
      ).toEqual(root);
    },
  );

  it('readOriginalMdoc recovers signature_usual_mark bytes separately from the portrait', () => {
    const signature = new Uint8Array([137, 80, 78, 71]);
    const signatureClaim = new Tag(
      24,
      new Uint8Array(
        encode({
          elementIdentifier: 'signature_usual_mark',
          elementValue: signature,
        }),
      ),
    );
    const encoded = Buffer.from(
      encode({nameSpaces: {[namespace]: [claim, signatureClaim]}}),
    ).toString('base64url');

    const {images} = readOriginalMdoc(encoded);

    expect(images.portraits).toEqual({[namespace]: bytes});
    expect(images.signatures).toEqual({[namespace]: signature});
  });

  it('does not create a portrait when the credential has none', () => {
    const encoded = Buffer.from(
      encode({nameSpaces: {[namespace]: []}}),
    ).toString('base64url');
    expect(readOriginalMdoc(encoded).images.portraits).toEqual({});
  });

  it('reads docType from the MSO when only IssuerSigned is stored', () => {
    const payload = new Uint8Array(
      encode(
        new Tag(
          24,
          new Uint8Array(
            encode({
              docType: 'org.iso.18013.5.1.mDL',
            }),
          ),
        ),
      ),
    );
    const encoded = Buffer.from(
      encode({
        issuerAuth: [new Uint8Array(), new Map(), payload, new Uint8Array()],
        nameSpaces: {[namespace]: [claim]},
      }),
    ).toString('base64url');
    expect(readOriginalMdoc(encoded)).toEqual({
      docType: 'org.iso.18013.5.1.mDL',
      images: {portraits: {[namespace]: bytes}, signatures: {}},
    });
  });

  it('reads a document root docType', () => {
    const encoded = Buffer.from(
      encode({docType: 'org.iso.23220.photoID.1', nameSpaces: {}}),
    ).toString('base64url');
    expect(readOriginalMdoc(encoded).docType).toBe('org.iso.23220.photoID.1');
  });
});
