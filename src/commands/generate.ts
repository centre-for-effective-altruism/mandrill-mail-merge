import {Command, flags} from '@oclif/command'
import {fs} from 'mz'
import * as path from 'path'

const TEMPLATE_FILE_PATH = path.join(__dirname, '..', 'generator', 'template.js')

export default class Generate extends Command {
  static description = 'generate a new mail merge template in the current working directory'

  static flags = {
    help: flags.help({char: 'h'}),
    fileName: flags.string({char: 'f', description: 'the output filename', default: 'template.js'}),
  }

  async run() {
    const {flags} = this.parse(Generate)

    let fileName = flags.fileName || 'template.js'

    // add file extension if needed
    if (!/\.js$/.test(fileName)) fileName = `${fileName}.js`
    // copy our template to the CWD
    const templateFile = await fs.readFile(TEMPLATE_FILE_PATH)
    const OUTPUT_FILE_PATH = path.join(process.cwd(), fileName)
    try {
      // write the file if it doesn't exist
      await fs.writeFile(OUTPUT_FILE_PATH, templateFile, { flag: 'wx' })
      this.log(`Generated template file at ${OUTPUT_FILE_PATH}`)
    } catch (err) {
      if (err.code === 'EEXIST') {
        this.error(`${OUTPUT_FILE_PATH} already exists. Use a different filename or delete the file`)
      } else {
        throw err
      }
    }
  }
}
