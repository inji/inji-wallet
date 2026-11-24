import getAllConfigurations from '../../api';
import {INITIAL_CONFIG} from '../../InitialConfig';

/** Where mdoc card templates live and which template file each docType uses. */
export type MdocTemplateConfig = {
  baseUrl: string;
  templateFileByDocType: Record<string, string>;
};

/** The docType to file name mapping, given as JSON text or an object; undefined when unusable. */
function parseTemplateMapping(
  mapping: unknown,
): Record<string, string> | undefined {
  let parsed: unknown = mapping;
  if (typeof mapping === 'string') {
    try {
      parsed = JSON.parse(mapping);
    } catch {
      return undefined;
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    return undefined;

  const templateFileByDocType: Record<string, string> = Object.create(null);
  for (const [docType, fileName] of Object.entries(parsed))
    if (typeof fileName === 'string') templateFileByDocType[docType] = fileName;
  return Object.keys(templateFileByDocType).length > 0
    ? templateFileByDocType
    : undefined;
}

/** Mimoto's values, each falling back to the wallet's InitialConfig. Undefined keeps the field view. */
export async function getMdocTemplateConfig(): Promise<
  MdocTemplateConfig | undefined
> {
  const mimotoProperties = await getAllConfigurations();
  const walletProperties = INITIAL_CONFIG.allProperties;

  const baseUrl =
    mimotoProperties?.mdocTemplateBaseUrl ||
    walletProperties.mdocTemplateBaseUrl;
  const templateFileByDocType = parseTemplateMapping(
    mimotoProperties?.mdocTemplates || walletProperties.mdocTemplates,
  );
  if (!baseUrl || !templateFileByDocType) return undefined;

  return {baseUrl, templateFileByDocType};
}

/** The template URL for a docType, or null when the docType has no template. */
export function templateUrlFor(
  docType: string | undefined,
  config: MdocTemplateConfig,
): string | null {
  if (!docType) return null;
  const {baseUrl, templateFileByDocType} = config;
  if (!Object.prototype.hasOwnProperty.call(templateFileByDocType, docType))
    return null;
  const folder = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return folder + templateFileByDocType[docType];
}
