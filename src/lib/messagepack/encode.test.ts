import { describe, expect, it } from 'vitest';

import { encode } from '#/lib/messagepack/encode';
import { toBase64 } from '#/lib/messagepack/toBase64';

describe('encode', () => {
  const data = {
    firstName: 'John',
    lastName: 'doe',
    age: 26,
    work: true,
    address: {
      streetAddress: 'naist street',
      city: 'Nara',
      postalCode: '630-0192',
    },
    phoneNumbers: [
      {
        type: 'iPhone',
        number: '0123-4567-8888',
      },
      {
        type: 'home',
        number: '0123-4567-8910',
      },
    ],
  };

  it('should Uint8Array return when pass valid value', () => {
    const result = encode(data);

    if (result instanceof Error) {
      throw new Error('encode fail');
    }

    const base64 = toBase64(result);

    expect(base64).toEqual(
      'hqlmaXJzdE5hbWWkSm9obqhsYXN0TmFtZaNkb2WjYWdlGqR3b3Jrw6dhZGRyZXNzg61zdHJlZXRBZGRyZXNzrG5haXN0IHN0cmVldKRjaXR5pE5hcmGqcG9zdGFsQ29kZag2MzAtMDE5MqxwaG9uZU51bWJlcnOSgqR0eXBlpmlQaG9uZaZudW1iZXKuMDEyMy00NTY3LTg4ODiCpHR5cGWkaG9tZaZudW1iZXKuMDEyMy00NTY3LTg5MTA=',
    );
  });

  it('should throw Error when pass invalid value', () => {
    const invalid = structuredClone(data) as any;

    invalid.test = invalid;

    const result = encode(invalid);
    expect(result).toBeInstanceOf(Error);
  });
});
