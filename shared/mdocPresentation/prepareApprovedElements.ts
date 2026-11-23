import type {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {filterMdocCredential} from '../openID4VP/mdocSelectiveDisclosure';
import {getStoredMdoc, type MdocRequestedElement} from './matching';

/**
 * The stored mdoc with only the details the holder approved. The kept items and issuerAuth stay
 * byte-identical, so their digests and the issuer signature still verify at the reader.
 */
export async function prepareApprovedElements(
  vc: VC,
  approvedElements: MdocRequestedElement[],
): Promise<string> {
  const selection: Record<string, string[]> = {};
  approvedElements.forEach(({namespace, elementIdentifier}) => {
    (selection[namespace] ??= []).push(elementIdentifier);
  });
  return filterMdocCredential(getStoredMdoc(vc), selection);
}
