import { exec } from 'node:child_process'
import { promises as fsPromises } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const getPluginsFromJson = async () => {
  try {
    const filePath = join(__dirname, '..', '.vscode', 'extensions.json')
    const data = await fsPromises.readFile(filePath, 'utf-8')
    const json = JSON.parse(data) as { recommendations?: string[] }
    return json.recommendations || []
  } catch (error) {
    console.error('Error reading extensions.json:', error)
    return []
  }
}

const installPlugin = (plugin: string) => {
  return new Promise((resolve, reject) => {
    exec(`code --install-extension ${plugin}`, (error, _stdout, stderr) => {
      if (error) {
        reject(`Error installing ${plugin}: ${stderr}`)
      } else {
        resolve(`Successfully installed ${plugin}`)
      }
    })
  })
}

const installPlugins = async () => {
  const plugins = await getPluginsFromJson()
  const failedPlugins: string[] = []
  let successfulInstalls = 0

  for (const plugin of plugins) {
    try {
      await installPlugin(plugin)
      console.log(`Successfully installed ${plugin}`)
      successfulInstalls++
    } catch (error) {
      console.error(error)
      failedPlugins.push(plugin)
    }
  }

  if (failedPlugins.length > 0) {
    console.error(`The following plugins failed to install: ${failedPlugins.join(', ')}`)
  }
  console.log(`Successfully installed a total of ${successfulInstalls} plug-ins.`)
}

installPlugins()
