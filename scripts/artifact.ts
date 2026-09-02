/* eslint-disable no-console */
import fs from 'node:fs';

// Build tooling is intentionally installed as development dependencies.
// eslint-disable-next-line import-x/no-extraneous-dependencies
import { ZipArchive } from 'archiver';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import pathe from 'pathe';

const ARCHIVE_DIRECTORY = pathe.resolve('dist');
const OUTPUT_PATH = pathe.resolve('json-byte.zip');

async function artifact() {
  console.log('Artifact creation started.');

  const fileNames = await fs.promises.readdir(ARCHIVE_DIRECTORY, { recursive: true });
  const files = await Promise.all(
    fileNames.map(async (fileName) => {
      const absolutePath = pathe.join(ARCHIVE_DIRECTORY, fileName);
      const stat = await fs.promises.stat(absolutePath);
      return { absolutePath, directory: stat.isDirectory(), relativePath: fileName };
    }),
  );
  const output = fs.createWriteStream(OUTPUT_PATH);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.pipe(output);

  const artifactFiles = files.filter(
    (file) => !file.directory && !file.relativePath.includes('.DS_Store') && !file.relativePath.endsWith('.zip'),
  );
  artifactFiles.forEach((file) => {
    archive.file(file.absolutePath, { name: file.relativePath });
  });

  await new Promise<void>((resolve, reject) => {
    archive.on('error', reject);
    output.on('error', reject);
    output.on('close', resolve);
    archive.finalize();
  });

  console.log(`Artifact created: ${OUTPUT_PATH} (${artifactFiles.length} files, ${archive.pointer()} bytes)`);
}

artifact().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
