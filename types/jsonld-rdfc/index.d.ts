declare module 'jsonld-rdfc' {
  const jsonld: {
    canonize: (input: any, options?: Record<string, any>) => Promise<string>;
    expand: (input: any, options?: Record<string, any>) => Promise<any>;
  };
  export default jsonld;
}
