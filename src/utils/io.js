import { existsSync } from 'node:fs';
import { access, readFile } from 'node:fs/promises';

export function validateInput(files) {
  if (files == '-') {
    if (process.stdin.readable) {
      return true;
    }
    else {
      console.err('stdin');
    }
  }
  files instanceof Array ? files : files = [files];
  try {
    files.forEach((fname) => {
      if (!existsSync(fname)) {
        throw new Error(`File ${fname} does not exist.`);
      }
    });
  }
  catch (err) {
    console.error(err.name, err.message);
    process.exit(1);
  }
}

export function validateOutput(file, overwrite) {
  if (file == '-') {
    return;
  }
  try {
    if (!existsSync(file)) {
      return;
    }
    if (overwrite) {
      console.warn(`Overwriting ${file}.`);
      return;
    }
    throw new Error(`File ${file} exists and not overwriting.`);
  }
  catch (err) {
    console.error(err.name, err.message);
    process.exit(1);
  }
}

export async function readStdIn() {
  process.stdin.setEncoding('utf8');
  let data = '';
  for await (const chunk of process.stdin) {
    data += chunk;
  }
  return data;
}

export async function readData(input) {
  let data;
  if (input == '-') {
    data = await readStdIn();
  }
  else {
    data = await readFile(input, { encoding: 'utf8' });
  }
  return data;
}
