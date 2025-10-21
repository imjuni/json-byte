import { describe, it } from 'vitest';
import { stringify as yamlStringify } from 'yaml';

import { ParserConfig } from '#/lib/parser/common/ParserConfig';
import { buildNodeByYaml } from '#/lib/parser/yaml/buildNodeByYaml';

describe('buildNodeByYaml', () => {
  const complex = {
    logger: 'api',
    pid: 76735,
    id: 'http-request-GET',
    status: 200,
    timestamp: '2024-06-10T01:05:52+09:00',
    duration: 12.751792013645172,
    tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
    body: {
      method: 'GET',
      url: '/category/1?tid=6f1a29b5-cdc6-4023-a63f-7696d963d09a',
      routerPath: '/category/:id',
      curl: "\"curl -X GET 'http://localhost:7878/category/1?tid=6f1a29b5-cdc6-4023-a63f-7696d963d09a' --header 'referer: http://localhost:7878/swagger.io/static/index.html' --header 'accept-language: ko,en;q=0.9,en-US;q=0.8'\"",
      request: {
        queries: {
          tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
        },
        headers: {
          host: 'localhost:7878',
          connection: 'keep-alive',
          'sec-ch-ua': '"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
          accept: 'application/json',
          'sec-ch-ua-mobile': '?0',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
          referer: 'http://localhost:7878/swagger.io/static/index.html',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'ko,en;q=0.9,en-US;q=0.8',
        },
        params: {
          id: '1',
        },
        array: ['string', true, 0, null, { object: 'name' }],
      },
      reply: {
        headers:
          'lwHwgXsiYWNjZXNzLWNvbnRyb2wtYWxsb3ctb3JpZ2luIjoiKiIsImNvbnRlbnQtdHlwZSI6ImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgiLCJ0aWQiOiI2ZjFhMjliNS1jZGM2LTQwMjMtYTYzZi03Njk2ZDk2M2QwOWEiLCIBeUBlbnQtbGVuZ3RoIjoiMjUifQ==',
        payload: 'GWB7ImlkIjoiMSIsIm5hbWUiOiJkYW5jZSJ9',
      },
    },
    filename: 'request-logger',
    level: 'info',
  };

  const simple = {
    logger: 'api',
    pid: 76735,
    id: 'http-request-GET',
    status: 200,
    timestamp: '2024-06-10T01:05:52+09:00',
    duration: 12.751792013645172,
    tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
    body: {
      method: 'GET',
      url: '/category/1?tid=6f1a29b5-cdc6-4023-a63f-7696d963d09a',
      routerPath: '/category/:id',
      curl: "\"curl -X GET 'http://localhost:7878/category/1?tid=6f1a29b5-cdc6-4023-a63f-7696d963d09a' --header 'referer: http://localhost:7878/swagger.io/static/index.html' --header 'accept-language: ko,en;q=0.9,en-US;q=0.8'\"",
      request: {
        queries: {
          tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
        },
        params: {
          id: '1',
        },
        array: ['string', true, 0, null, { object: 'name' }],
      },
      reply: {
        headers:
          'lwHwgXsiYWNjZXNzLWNvbnRyb2wtYWxsb3ctb3JpZ2luIjoiKiIsImNvbnRlbnQtdHlwZSI6ImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgiLCJ0aWQiOiI2ZjFhMjliNS1jZGM2LTQwMjMtYTYzZi03Njk2ZDk2M2QwOWEiLCIBeUBlbnQtbGVuZ3RoIjoiMjUifQ==',
        payload: 'GWB7ImlkIjoiMSIsIm5hbWUiOiJkYW5jZSJ9',
      },
    },
    filename: 'request-logger',
    level: 'info',
  };
  const array = [
    'string',
    true,
    0,
    null,
    {
      id: '1',
      tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
      request: {
        queries: {
          tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
        },
        params: {
          id: '1',
        },
      },
    },
    {
      id: '2',
      tid: 'lwHwgXsiYWNjZXNzLWNvbnRyb2wtYWxsb3ctb3JpZ2luIjoiKiIsImNvbnRlbnQtdHlwZSI6ImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgiLCJ0aWQiOiI2ZjFhMjliNS1jZGM2LTQwMjMtYTYzZi03Njk2ZDk2M2QwOWEiLCIBeUBlbnQtbGVuZ3RoIjoiMjUifQ==',
      request: {
        queries: {
          tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
        },
        params: {
          id: '1',
        },
      },
    },
    {
      id: '3',
      tid: 'GWB7ImlkIjoiMSIsIm5hbWUiOiJkYW5jZSJ9',
      request: {
        queries: {
          tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
        },
        params: {
          id: '1',
        },
      },
    },
    {
      id: '4',
      tid: "\"curl -X GET 'http://localhost:7878/category/1?tid=6f1a29b5-cdc6-4023-a63f-7696d963d09a' --header 'referer: http://localhost:7878/swagger.io/static/index.html' --header 'accept-language: ko,en;q=0.9,en-US;q=0.8'\"",
      request: {
        queries: {
          tid: '6f1a29b5-cdc6-4023-a63f-7696d963d09a',
        },
        params: {
          id: '1',
        },
      },
    },
  ];

  it('plain complex object', () => {
    const document = structuredClone(complex);
    const origin = yamlStringify(document, undefined, 2);
    const config = new ParserConfig({ guard: 1_000_000 });

    const result = buildNodeByYaml({ origin, document: simple, config });
    console.log(result);
  });

  it('plain simple object', () => {
    const document = structuredClone(simple);
    const origin = yamlStringify(document, undefined, 2);
    const config = new ParserConfig({ guard: 1_000_000 });

    const result = buildNodeByYaml({ origin, document: simple, config });
    console.log(result);
  });

  it('plain string', () => {
    const document = 'helloworld';
    const origin = yamlStringify(document, undefined, 2);
    const config = new ParserConfig({ guard: 1_000_000 });

    buildNodeByYaml({ origin, document, config });
  });

  it('plain array', () => {
    const document = structuredClone(array);
    const origin = yamlStringify(document, undefined, 2);
    const config = new ParserConfig({ guard: 1_000_000 });

    buildNodeByYaml({ origin, document, config });
  });
});
