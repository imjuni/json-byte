/* eslint-disable no-useless-escape */
import { describe, expect, it } from 'vitest';

import { safeEscapeParse } from '#/lib/json/safeEscapeParse';

describe('safeEscapeParse', () => {
  it('should parse JSON object when input is valid JSON string', () => {
    const jsonString = '{"name":"ironman"}';
    const parsed = safeEscapeParse(jsonString);
    expect(parsed).toEqual({ name: 'ironman' });
  });

  it('should parse JSON object when input is multiple times escaped and quoted', () => {
    const jsonString = `"\"{\\"name\\":\\"ironman\\"}\"`;
    const parsed = safeEscapeParse(jsonString);
    expect(parsed).toEqual({ name: 'ironman' });
  });
});
