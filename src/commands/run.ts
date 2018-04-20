import {Command, flags} from '@oclif/command'
import camelcaseKeys = require('camelcase-keys')
import csvParse = require('csv-parse/lib/sync')
import * as delay from 'delay'
import * as Mandrill from 'mandrill-api'
import {fs} from 'mz'
import * as path from 'path'

type RowFormatter = (row: object) => string

interface Template {
  from: string,
  fromName: string,
  to: RowFormatter,
  toName: RowFormatter,
  subject: string | RowFormatter,
  message: RowFormatter
}

interface MandrillMessage {
  from: string,
  from_name?: string,
  to: Array<{
    email: string,
    name?: string
  }>,
  subject: string,
  html: string
}

export default class Run extends Command {
  static description = `run a mail merge

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
`

  static flags = {
    help: flags.help({char: 'h'}),
    preview: flags.boolean({char: 'p', description: 'print a randomly-selected test email to STDOUT'}),
    numRows: flags.string({
      char: 'n',
      description: 'number of test emails to preview/send (ignored in live mode)',
      default: '3'
    }),
    live: flags.boolean({char: 'l', description: 'use the live API key'}),
    dataFile: flags.string({char: 'd', description: 'path to CSV file with merge data'}),
    templateFile: flags.string({char: 't', description: 'path to .js file that exports a render(row) function'})
  }

  async run() {
    const {flags} = this.parse(Run)
    const {live, preview, dataFile, templateFile, numRows} = flags
    const configFile = path.join(this.config.configDir, 'config.json')
    // check we've added the right data
    if (!dataFile) return this.error('No merge data CSV file set')
    if (!templateFile) return this.error('No email template provided')
    // read/check config file
    const config = await fs.readFile(configFile)
      .then(data => JSON.parse(data.toString()))
      .catch(err => {
        if (err.code !== 'ENOENT') throw err
        this.error(`No config file! Run 'mmerge setconfig' to create one.`)
      })
    // parse the CSV file
    const csvFile = await fs.readFile(path.normalize((dataFile))).then(d => d.toString())
    const csvRows = camelcaseKeys(
      csvParse(csvFile, {columns: true}), {deep: true}
    )
    // strip down the number of rows if we're not in live mode
    let mergeRows: Array<object> = []
    if (!live) {
      let c = numRows ? parseInt(numRows, 10) : 3
      while (c > 0) {
        mergeRows.push(csvRows[Math.floor(Math.random() * csvRows.length)])
        c--
      }
    } else {
      mergeRows = csvRows
    }
    // require the template
    const template: Template = await import(path.resolve(templateFile))

    // PREVIEW MODE - output a random email to STDOUT

    if (preview) {
      for (let row of mergeRows) {
        const message = getMessage(row, template)
        // log the input
        this.log('\nInput data:\n')
        this.log(JSON.stringify(row, null, 2))
        // log the output
        this.log(getPreview(message))
      }
      return this.exit()
    }

    // RUN MERGE - run the mail merge!
    // get a mandrill client
    const MANDRILL_API_KEY = live ? config.mandrill.liveKey : config.mandrill.testKey
    const mandrill = new Mandrill.Mandrill(MANDRILL_API_KEY)
    this.log(`Sending ${mergeRows.length} emails (${live ? '🚨 live' : '🤷‍♂️ test'} mode)`)
    for (let row of mergeRows) {
      const message = getMessage(row, template)
      this.log(`Sending email to ${message.to[0].email}`)
      try {
        // send the message
        const result: any = await new Promise((resolve, reject) => {
          mandrill.messages.send({message}, result => resolve(result), err => reject(err))
        })
        this.log(`Status: ${result[0].status === 'sent' ? '✅' : `❌ - ${result[0].reject_reason}`}`)
      } catch (err) {
        this.warn(`${err.code} - ${err.message}`)
      }
      await delay(300) // avoid clobbering the API
    }
  }
}

function getMessage(row: object, template: Template): MandrillMessage {
  // validate
  if (!template.from || typeof template.from !== 'string') throw new Error(`Template does not export a string 'from'`)
  if (!template.to || typeof template.to !== 'function') throw new Error(`Template must export variable 'to' as a function`)
  if (!template.subject) throw new Error(`Template must export variable 'subject' as a string or function`)
  if (!template.message || typeof template.message !== 'function') throw new Error(`Template must export variable 'message' as a function`)
  // build message
  const message: MandrillMessage = {
    from: template.from,
    to: [{
      email: template.to(row)
    }],
    subject: typeof template.subject === 'function' ? template.subject(row) : template.subject,
    html: template.message(row)
  }
  // optional fields
  if (template.fromName) message.from_name = template.fromName
  if (template.toName) message.to[0].name = template.toName(row)

  return message
}

function getPreview(message: MandrillMessage): string {
  const output = []
  const to = message.to[0]
  // preview a message in the console
  output.push('Message:')
  output.push((`
================
from: ${message.from_name ? `${message.from_name} <${message.from}>` : message.from }
to: ${to.name ? `${to.name} <${to.email}>` : to.email }
subject: ${message.subject}
----------------
`).trim())
  output.push(message.html)
  output.push('================')
  return output.join('\n')
}
