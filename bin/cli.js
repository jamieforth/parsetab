#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync } from 'node:fs';
import { readData, validateInput, validateOutput } from 'parsetab/utils/io';

import { parse } from 'parsetab/parser';
import { makeScanner } from 'parsetab/parser/scanner';
import { defaultMainCourseCount } from 'parsetab/parser/base';

const program = new Command();

program.name('parsetab')
  .description('CLI tabcode parser and serialiser.')
  .allowExcessArguments(false)
  .configureHelp({
    showGlobalOptions: true,
  });

// Global options.
program
  .option('-d, --debug', 'output extra debugging')
  .option('--halt-on-error', 'terminate on parsing error', false)
  .option(
    '--main-course-count <int>',
    'default number of main courses',
    defaultMainCourseCount,
  );

// Command: tc2json (default)
program
  .command('tc2json', { isDefault: true })
  .argument('[input]', 'input file or stdin', '-')
  .argument('[output]', 'output file or stdout', '-')
  .option('-o, --overwrite', 'overwrite output file if exists', false)
  .option('-s, --silent', 'suppress parser output', false)
  .option('-p, --pretty', 'pretty-print output', false)
  .option('--strict', 'do not attempt to resolve encoding errors', false)
  .option('--no-parse-ocr', 'do not attempt to parse OCR comments')
  .option('--no-comments', 'do not include comments in output')
  .option('--log-errors', 'log parsing errors to stderr', false)
  .action(async (input, output, options, cmd) => {
    options = cmd.optsWithGlobals();
    if (options.debug) {
      console.debug(cmd.name(), input, output, options);
    }
    await tc2json(input, output, options);
  });

// Command: validate
program
  .command('validate')
  .argument('<input-file...>', 'input files(s)')
  .action(async (inputFiles, options, cmd) => {
    options = cmd.optsWithGlobals();
    if (options.debug) {
      console.debug(cmd.name(), inputFiles, options);
    }

    let pass = 0;
    let fail = 0;

    for (const file of inputFiles) {
      try {
        const data = await readData(file);
        if (data) {
          parse(data);
          pass++;
        }
      }
      catch (err) {
        if (options.haltOnError) {
          throw new Error(`Failed to parse ${file}`, { cause: err });
        }
        else {
          console.error(file, err.message);
          fail++;
        }
      }
    }

    console.log(`Passed: ${pass}`);
    console.log(`Failed: ${fail}`);
    console.log(`Total: ${inputFiles.length}`);
  });

// Command: scan
program
  .command('scan')
  .argument('[input]', 'input file or stdin', '-')
  .option('--no-comments', 'do not include comments in output')
  .action(async (input, options, cmd) => {
    options = cmd.optsWithGlobals();
    if (options.debug) {
      console.debug(cmd.name(), input, options);
    }

    const data = await readData(input);
    const scanner = makeScanner(data, options);
    const tokens = [...scanner];
    tokens.forEach(token => console.log(token));
  });

// Command: parse
program
  .command('parse')
  .argument('[input]', 'input file or stdin', '-')
  .option('-s, --silent', 'suppress parser output', false)
  .option('--no-comments', 'do not include comments in output')
  .action(async (input, options, cmd) => {
    options = cmd.optsWithGlobals();
    if (options.debug) {
      console.debug(cmd.name(), input, options);
    }
    validateInput(input);
    const data = await readData(input);
    const tabcode = parse(data, options);
    if (!options.silent) {
      console.log(tabcode);
    }
  });

// Parse CLI.
program.parseAsync();

function replacer(key, value) {
  // Filter out properties.
  const exclude = [];
  if (exclude.includes(key)) {
    return undefined;
  }
  return value;
}

async function tc2json(input, output, options) {
  validateInput(input);
  validateOutput(output, options.overwrite);

  // Parse a TabCode file and output minimal JSON data-structure.
  const data = await readData(input);

  const tabcode = parse(data, options);

  if (options.silent) {
    return;
  }

  let json = '';
  if (options.pretty) {
    json = JSON.stringify(tabcode, replacer, 2) + '\n';
  }
  else {
    json = JSON.stringify(tabcode, replacer) + '\n';
  }
  if (output == '-') {
    process.stdout.write(json);
  }
  else {
    try {
      writeFileSync(output, json);
    }
    catch (err) {
      console.error(err);
    }
  }
}
