import { exec } from 'node:child_process'
import { promises as fsPromises } from 'node:fs'
import { join } from 'node:path'
import { logger } from 'rslog'

const P = '[install-vscode-recommended-plugin]: '

const getPluginsFromJson = async () => {
  try {
    const filePath = join(process.cwd(), '.vscode', 'extensions.json')
    const data = await fsPromises.readFile(filePath, 'utf-8')
    const json = JSON.parse(data) as { recommendations?: string[] }
    return json.recommendations || []
  } catch (error) {
    logger.error(`${P} Error reading extensions.json:`, error)
    return []
  }
}

const installPlugin = (plugin: string) => {
  return new Promise((resolve, reject) => {
    exec(`code --install-extension ${plugin}`, (error, _stdout, stderr) => {
      if (error) {
        reject(`${P} Error installing ${plugin}: ${stderr}`)
      } else {
        resolve(`${P} Installed ${plugin}`)
      }
    })
  })
}

const installPlugins = async () => {
  const plugins = await getPluginsFromJson()
  if (plugins.length === 0) return

  const failedPlugins: undefined | string[] = []
  let successfulInstalls = 0
  let isError = false

  for (const plugin of plugins) {
    try {
      await installPlugin(plugin)
      logger.success(`${P} Installed ${plugin}`)
      successfulInstalls++
    } catch (error) {
      isError = true
      if (error?.toString().includes('command not found')) {
        logger.error(`${P} please make sure you have the code command available in your PATH
          see https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line`)
        break
      }
      failedPlugins?.push(plugin)
    }
  }

  if (failedPlugins?.length === 0 && !isError) {
    logger.greet(`[install-vscode-recommended-plugin]: Installed a total of ${successfulInstalls} plug-ins.`)
  }
}

installPlugins()
