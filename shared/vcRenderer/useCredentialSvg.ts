import {useEffect, useState} from 'react';
import {VCProcessor} from '../../components/VC/common/VCProcessor';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {VCFormat} from '../VCFormat';
import VcRenderer from './VcRenderer';
import {getMdocTemplateConfig} from './mdoc/MdocTemplates';

function hasRenderMethod(source: unknown): boolean {
  return Boolean(
    source &&
      typeof source === 'object' &&
      'renderMethod' in source &&
      source.renderMethod,
  );
}

function errorCodeOf(error: unknown): string {
  return typeof error === 'object' &&
    error !== null &&
    'errorCode' in error &&
    typeof error.errorCode === 'string'
    ? error.errorCode
    : 'Unknown error';
}

/** Null when no template is configured for mdocs, so the field view is kept. */
async function renderMdocSvg(
  credential: VerifiableCredential,
): Promise<string[] | null> {
  const templateConfig = await getMdocTemplateConfig();
  if (!templateConfig) return null;
  return VcRenderer.getInstance().generateMdocDisplayContent(
    await VCProcessor.processForRendering(credential, VCFormat.mso_mdoc),
    templateConfig,
    typeof credential.credential === 'string'
      ? credential.credential
      : undefined,
  );
}

export function useCredentialSvg(
  credential: VerifiableCredential | null | undefined,
  format: string,
  wellknown: unknown,
) {
  const [svgTemplate, setSvgTemplate] = useState<string[] | null>(null);
  const [svgRendererError, setSvgRendererError] = useState<string | null>(null);
  const [loadingSvg, setLoadingSvg] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSvgTemplate(null);
    setSvgRendererError(null);

    const isMdoc = format === VCFormat.mso_mdoc;
    if (!credential || (!isMdoc && !hasRenderMethod(credential.credential))) {
      setLoadingSvg(false);
      return;
    }

    const sourceCredential = credential;
    setLoadingSvg(true);
    async function render() {
      try {
        const result = isMdoc
          ? await renderMdocSvg(sourceCredential)
          : await VcRenderer.getInstance().generateCredentialDisplayContent(
              format,
              wellknown,
              JSON.stringify(sourceCredential.credential),
            );
        console.debug('[CredentialSvg] Render completed', {
          format,
          pages: result?.length ?? 0,
        });
        if (!cancelled) setSvgTemplate(result?.length ? result : null);
      } catch (error) {
        console.debug(
          '[CredentialSvg] Render failed',
          error instanceof Error ? error.message : 'Native renderer error',
        );
        if (!cancelled) {
          setSvgTemplate(null);
          setSvgRendererError(errorCodeOf(error));
        }
      } finally {
        if (!cancelled) setLoadingSvg(false);
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [credential, format, wellknown]);

  return {svgTemplate, svgRendererError, loadingSvg};
}
