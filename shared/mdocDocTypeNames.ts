const DOC_TYPE_NAMES: Record<string, string> = {
  'org.iso.18013.5.1.mDL': 'Mobile Driving Licence',
  'org.iso.7367.1.mVRC': 'Vehicle Registration',
  'org.iso.23220.photoID.1': 'Photo ID',
  'org.iso.23220.photoid.1': 'Photo ID',
  'eu.europa.ec.eudi.pid.1': 'Personal ID',
  'eu.europa.ec.eudi.hiid.1': 'Health Insurance Card',
};

export function knownDocTypeName(
  docType: string | undefined,
): string | undefined {
  return docType &&
    Object.prototype.hasOwnProperty.call(DOC_TYPE_NAMES, docType)
    ? DOC_TYPE_NAMES[docType]
    : undefined;
}
