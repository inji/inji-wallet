export interface RequestedCredentialGroup {
  name: string;
  purpose: string;
}

/** One group per input descriptor of a presentation definition, keyed by its id. */
export function getRequestedCredentialGroups(
  presentationDefinition: any,
): Record<string, RequestedCredentialGroup> {
  const groups: Record<string, RequestedCredentialGroup> = {};
  const inputDescriptors = presentationDefinition?.input_descriptors;
  if (!Array.isArray(inputDescriptors)) {
    return groups;
  }
  inputDescriptors.forEach(inputDescriptor => {
    if (!inputDescriptor?.id) {
      return;
    }
    groups[inputDescriptor.id] = {
      name:
        typeof inputDescriptor.name === 'string'
          ? inputDescriptor.name.trim()
          : '',
      purpose:
        typeof inputDescriptor.purpose === 'string'
          ? inputDescriptor.purpose.trim()
          : '',
    };
  });
  return groups;
}
