import { describe, expect, it } from 'vitest';

import { decode } from '#/lib/messagepack/decode';
import { fromBase64 } from '#/lib/messagepack/fromBase64';

describe('decode', () => {
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

  const validBase64 =
    'hqlmaXJzdE5hbWWkSm9obqhsYXN0TmFtZaNkb2WjYWdlGqR3b3Jrw6dhZGRyZXNzg61zdHJlZXRBZGRyZXNzrG5haXN0IHN0cmVldKRjaXR5pE5hcmGqcG9zdGFsQ29kZag2MzAtMDE5MqxwaG9uZU51bWJlcnOSgqR0eXBlpmlQaG9uZaZudW1iZXKuMDEyMy00NTY3LTg4ODiCpHR5cGWkaG9tZaZudW1iZXKuMDEyMy00NTY3LTg5MTA=';

  it('should decode Uint8Array to JsonValue when pass valid MessagePack bytes', () => {
    const bytes = fromBase64(validBase64);
    const result = decode(bytes);

    if (result instanceof Error) {
      throw new Error('decode fail');
    }

    expect(result).toEqual(data);
  });

  it('should return Error when pass invalid MessagePack bytes', () => {
    // Invalid MessagePack data
    const invalidBytes = new Uint8Array([0xff, 0xff, 0xff]);

    const result = decode(invalidBytes);

    expect(result).toBeInstanceOf(Error);
  });
});
