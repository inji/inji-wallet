import jsonld from '@digitalcredentials/jsonld';

export class DocumentLoader {
  private static defaultLoader: ReturnType<
    typeof jsonld.documentLoaders.xhr
  > | null = null;

  private static getDefaultLoader() {
    if (!DocumentLoader.defaultLoader) {
      DocumentLoader.defaultLoader = jsonld.documentLoaders.xhr();
    }

    return DocumentLoader.defaultLoader;
  }

  private static async httpsLoader(url: string) {
    console.info('[HTTPS_LOADER] Fetching:', url);

    const result = await DocumentLoader.getDefaultLoader()(url);

    if (typeof result.document === 'string') {
      try {
        result.document = JSON.parse(result.document);
      } catch (error) {
        throw new Error(
          `Failed to parse JSON document from ${url}: ${String(error)}`,
        );
      }
    } else if (
      typeof result.document !== 'object' ||
      result.document === null
    ) {
      throw new Error(
        `Unsupported document type for ${url}: ${typeof result.document}`,
      );
    }

    console.info('[HTTPS_LOADER] Success:', url);

    return result;
  }

  static async didWebDocumentLoader(url: string) {
    console.info('[DOC_LOADER] Request:', url);

    if (url.startsWith('https://')) {
      return DocumentLoader.httpsLoader(url);
    }

    if (url.startsWith('did:web:')) {
      const didWithoutFragmentAndQuery = url.split(/[?#]/)[0];
      const did = didWithoutFragmentAndQuery.replace('did:web:', '');

      if (!did) {
        throw new Error(`Invalid did:web URL: ${url}`);
      }

      const components = did.split(':').map(decodeURIComponent);
      const baseDomain = components[0];

      if (!baseDomain) {
        throw new Error(`Invalid did:web URL: missing domain in ${url}`);
      }

      const path = components.slice(1).join('/');
      const didUrl =
        path.length === 0
          ? `https://${baseDomain}/.well-known/did.json`
          : `https://${baseDomain}/${path}/did.json`;

      console.info('[DOC_LOADER] Resolving DID:', didUrl);

      try {
        const response = await DocumentLoader.httpsLoader(didUrl);

        if (response.document.id !== didWithoutFragmentAndQuery) {
          throw new Error(
            `Resolved DID document id does not match ${didWithoutFragmentAndQuery}`,
          );
        }

        console.info(
          'DID_DOCUMENT',
          JSON.stringify(response.document, null, 2),
        );

        response.documentUrl = url;

        console.info('[DOC_LOADER] DID resolved successfully');

        return response;
      } catch (error) {
        console.error('[DOC_LOADER] DID resolution failed:', error);
        throw error;
      }
    }

    throw new Error(`Unsupported URL: ${url}`);
  }
}
