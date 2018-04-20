import {Command, flags} from '@oclif/command'
import * as inquirer from 'inquirer'
import {fs} from 'mz'
import * as path from 'path'

interface ConfigFile {
  mandrill: {
    liveKey: string,
    testKey: string
  }
}

export default class Credentials extends Command {
  static description = 'add or remove Mandrill credentials'

  static flags = {
    help: flags.help({char: 'h'})
  }

  async run() {
    const {configDir} = this.config
    const responses: any = await inquirer.prompt([
      {
        name: 'liveKey',
        message: 'Mandrill live key',
        type: 'input',
        validate: input => input.length > 0
      },
      {
        name: 'testKey',
        message: 'Mandrill test key',
        type: 'input',
        validate: input => input.length > 0
      }
    ])

    // build the environment file
    const config: ConfigFile = {
      mandrill: {
        liveKey: responses.liveKey,
        testKey: responses.testKey
      }
    }

    // save to the users homeDir
    try {
      await fs.mkdir(configDir)
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
    await fs.writeFile(path.join(configDir, 'config.json'), JSON.stringify(config))
  }
}
