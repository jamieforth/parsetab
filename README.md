# TabCode parser

## Install

```
$ npm install
```

## Testing

```
$ npm run test
```

## Running

```
$ ./bin/cli.js --help
```

```
$ node ./bin/cli.js --help
```

```
# e.g. default command is tc2json
$ echo 'Qa1' | ./bin/cli.js
```

Or link parsetab to your PATH.

```
$ npm link
```

Then from any directory:

```
$ parsetab --help
```

```
# Default command is tc2json
$ echo 'Qa1' | parsetab
```

```
# Command: parse
$ echo 'Qa1' | parsetab
```

```
# Command: scan
$ echo 'Qa1' | parsetab scan
```

```
# Command: validate
$ echo 'Qa1' | parsetab validate <path>/*.tc
```

```
# Command: tc2json
$ parsetab tc2json <path/to/input.tc>
$ parsetab tc2json <path/to/input.tc> <path/to/output.json>
```

## Generate browser-compatible build

```
$ npm run build
```

