import { describe, it } from 'vitest';

import { createXyFlowNodes } from '#/lib/xyflow/createXyFlowNodes';

import type { JsonValue } from 'type-fest';

describe('', () => {
  const document: JsonValue = {
    firstName: 'John',
    lastName: 'doe',
    age: 26,
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

  it('', () => {
    const result = createXyFlowNodes(document);
    console.log(result);
  });
});
