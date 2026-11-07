import type {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {VCFormat} from '../VCFormat';
import type {MdocRequest, RequestedDocument} from './types';

/** Namespace is part of an element's identity; equal names in different namespaces differ. */
export type MdocRequestedElement = {
  namespace: string;
  elementIdentifier: string;
  intentToRetain: boolean;
};

/** Preserve the issued CBOR; rebuilding it from decoded JSON would invalidate its signatures. */
export function getStoredMdoc(vc: VC): string {
  const credential = asObject(vc.verifiableCredential)?.credential;
  if (
    vc.vcMetadata.format !== VCFormat.mso_mdoc ||
    typeof credential !== 'string' ||
    !credential.trim()
  )
    throw new Error('The selected card has no stored mdoc credential');
  return credential;
}

export type MdocCandidate = {
  vc: VC;
  /** Every element the reader asked for in this document, in request order. */
  requestedElements: MdocRequestedElement[];
  /** Requested elements this card holds; only these can be shared. */
  availableElements: MdocRequestedElement[];
  /** Requested elements not on this card; shown as "not on your card" and never shared. */
  missingElements: MdocRequestedElement[];
};

export type MdocDocumentMatch = {
  requested: RequestedDocument;
  candidates: MdocCandidate[];
  /** No stored mdoc of this document type holds any requested element. */
  noMatch: boolean;
};

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function readIssuerSigned(vc: VC): Record<string, unknown> | undefined {
  const credential = asObject(vc.verifiableCredential);
  const processedCredential = asObject(credential?.processedCredential);
  return asObject(processedCredential?.issuerSigned) ?? processedCredential;
}

function readDocType(
  issuerSigned: Record<string, unknown>,
): string | undefined {
  const issuerAuthentication = issuerSigned.issuerAuth;
  const mobileSecurityObject = Array.isArray(issuerAuthentication)
    ? asObject(issuerAuthentication[2])
    : undefined;
  return typeof mobileSecurityObject?.docType === 'string'
    ? mobileSecurityObject.docType
    : undefined;
}

/**
 * Matches the Pixelpass-decoded MSO and namespaces. Every card of the requested docType that holds
 * at least one requested element is offered, with the requested elements it holds and those it
 * lacks (design frame 31: missing details are shown and not shared). This does not authorise
 * sharing; the consent flow applies card status and requires one selected card per requested
 * document before sending a response. Candidates retain the original VC for selection and the
 * filtering hook.
 */
export function matchRequest(
  request: MdocRequest,
  walletCredentials: readonly VC[],
): MdocDocumentMatch[] {
  const mdocCredentials = walletCredentials
    .filter(vc => vc.vcMetadata.format === VCFormat.mso_mdoc)
    .map(vc => ({vc, issuerSigned: readIssuerSigned(vc)}));

  return request.documents.map(requested => {
    const requestedElements = Object.entries(requested.nameSpaces).flatMap(
      ([namespace, requestedElements]) =>
        Object.entries(requestedElements).map(
          ([elementIdentifier, intentToRetain]) => ({
            namespace,
            elementIdentifier,
            intentToRetain,
          }),
        ),
    );
    const candidates: MdocCandidate[] = [];
    for (const {vc, issuerSigned} of mdocCredentials) {
      if (!issuerSigned || readDocType(issuerSigned) !== requested.docType) {
        continue;
      }
      const nameSpaces = asObject(issuerSigned.nameSpaces);
      const isOnCard = (element: MdocRequestedElement) => {
        const items = nameSpaces?.[element.namespace];
        return (
          Array.isArray(items) &&
          items.some(item => {
            const decodedElement = asObject(item);
            return (
              decodedElement?.elementIdentifier === element.elementIdentifier &&
              Object.prototype.hasOwnProperty.call(
                decodedElement,
                'elementValue',
              )
            );
          })
        );
      };
      const availableElements = requestedElements.filter(isOnCard);
      if (availableElements.length > 0) {
        candidates.push({
          vc,
          requestedElements,
          availableElements,
          missingElements: requestedElements.filter(
            element => !isOnCard(element),
          ),
        });
      }
    }
    return {requested, candidates, noMatch: candidates.length === 0};
  });
}
