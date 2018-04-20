mandrill-mail-merge
===================

Send a mail merge using your Mandrill account

[![Version](https://img.shields.io/npm/v/mandrill-mail-merge.svg)](https://npmjs.org/package/mandrill-mail-merge)
[![CircleCI](https://circleci.com/gh/centre-for-effective-altruism/mandrill-mail-merge/tree/master.svg?style=shield)](https://circleci.com/gh/centre-for-effective-altruism/mandrill-mail-merge/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/centre-for-effective-altruism/mandrill-mail-merge?branch=master&svg=true)](https://ci.appveyor.com/project/centre-for-effective-altruism/mandrill-mail-merge/branch/master)
[![Codecov](https://codecov.io/gh/centre-for-effective-altruism/mandrill-mail-merge/branch/master/graph/badge.svg)](https://codecov.io/gh/centre-for-effective-altruism/mandrill-mail-merge)
[![Downloads/week](https://img.shields.io/npm/dw/mandrill-mail-merge.svg)](https://npmjs.org/package/mandrill-mail-merge)
[![License](https://img.shields.io/npm/l/mandrill-mail-merge.svg)](https://github.com/centre-for-effective-altruism/mandrill-mail-merge/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mandrill-mail-merge
$ mmerge COMMAND
running command...
$ mmerge (-v|--version|version)
mandrill-mail-merge/0.1.0 darwin-x64 node-v8.10.0
$ mmerge --help [COMMAND]
USAGE
  $ mmerge COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mmerge help [COMMAND]`](#mmerge-help-command)
* [`mmerge run`](#mmerge-run)
* [`mmerge setconfig`](#mmerge-setconfig)

## `mmerge help [COMMAND]`

display help for mmerge

```
USAGE
  $ mmerge help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v1.2.4/src/commands/help.ts)_

## `mmerge run`

run a mail merge

```
USAGE
  $ mmerge run

OPTIONS
  -d, --dataFile=dataFile          path to CSV file with merge data
  -h, --help                       show CLI help
  -l, --live                       use the live API key
  -n, --numRows=numRows            [default: 3] number of test emails to preview/send (ignored in live mode)
  -p, --preview                    print a randomly-selected test email to STDOUT
  -t, --templateFile=templateFile  path to .js file that exports a render(row) function

DESCRIPTION

     Input files:
     ==============

     Mail merge requires a CSV of merge data, and a matching Javascript template file that exports the following keys:
       {
         // -- the sender's email address
         from: string,

         // -- the sender's name
         fromName: string,

         // -- function returning the recipient's email address
         to: (row) => string,

         // -- [optional] function returning the recipient's name
         to: (row) => string,

         // -- the email subject. A string, or a function that takes a CSV row and returns a string
         subject: string | (row) => string,

         // -- function that renders the email body from a CSV row
         message: (row) => string
       }

      Note that CSV column headers will be converted to camelCase
```

_See code: [src/commands/run.ts](https://github.com/centre-for-effective-altruism/mandrill-mail-merge/blob/v0.1.0/src/commands/run.ts)_

## `mmerge setconfig`

add or remove Mandrill credentials

```
USAGE
  $ mmerge setconfig

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/setconfig.ts](https://github.com/centre-for-effective-altruism/mandrill-mail-merge/blob/v0.1.0/src/commands/setconfig.ts)_
<!-- commandsstop -->
