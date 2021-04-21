#!/usr/bin/env node

import colors from 'ansi-colors'
import enquirer from 'enquirer'
import { mkdir, readFile } from 'node:fs/promises'
import { exec } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFile, appendFile } from 'node:fs/promises'
import writeconfig from './tsconfig.js'

/** @type {<Type>(...arr: Type[]) => Type} */
const random = (...arr) => arr[Math.floor(Math.random() * arr.length)]

console.log(
  colors.redBright(String.raw`//
|| Welcome to create 5079!
\\`)
)

/** @param {string} command */
function run(command, slient = false) {
  return new Promise((resolve, reject) => {
    const init = exec(command, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout)
    })
    if (slient === false) {
      process.stdin.pipe(init.stdin)
      init.stdout.pipe(process.stdout)
      init.stderr.pipe(process.stderr)
    }
  })
}
async function main() {
  const { project, path } = await enquirer
    .prompt([
      {
        message: 'What folder?',
        type: 'input',
        name: 'path',
        initial:
          random('random', 'moller', 'trollsmile', 'trollar', 'cli') +
          '-' +
          random('os', 'script', 'roblox', 'web', 'admin')
      },
      {
        type: 'select',
        message: 'What type of project?',
        name: 'project',
        choices: [
          {
            name: 'TypeScript',
            value: 'ts'
          },
          {
            name: 'JavaScript',
            value: 'js'
          },
          {
            name: 'roblox-ts',
            value: 'roblox-ts'
          }
        ]
      }
    ])
    .catch(() => {
      console.log(`${colors.italic(':/')} ${colors.bold('See you later!')}`)
      process.exit()
    })
  await mkdir(path)
  process.chdir(path)

  await run('npm init -y', true)

  const pkg = JSON.parse(
    await readFile(join(process.cwd(), 'package.json'), 'utf-8')
  )
  const entry = project === 'roblox-ts' ? 'out/init.lua' : './main.js'
  pkg.type = 'module'
  pkg.module = entry
  pkg.exports = entry
  pkg.main = entry
  pkg.scripts = {
    'release-major': 'npm version major && git push && git push --tags',
    'release-minor': 'npm version minor && git push && git push --tags',
    'release-patch': 'npm version patch && git push && git push --tags',
    format: 'prettier'
  }

  if (project === 'roblox-ts') {
    Object.assign(pkg.scripts, {
      build: 'rbxtsc --type model && rojo build -o model.rbxmx',
      prepublishOnly: 'rbxtsc'
    })
  } else if (project === 'TypeScript') {
    Object.assign(pkg.scripts, {
      build: 'tsc',
      prepublishOnly: 'tsc'
    })
    writeFile('./main.ts', 'export default () => {\n  Your code here!\n}')
  } else {
    writeFile('./main.js', 'export default () => {\n  Your code here!\n}')
  }
  const name = await run('git config --get user.name', true)
  const email = await run('git config --get user.email', true)
  pkg.author = `${name.trim()} <${email.trim()}> (https://5079.ml)`
  await writeFile('./package.json', JSON.stringify(pkg, null, 2))

  await appendFile('./.gitignore', 'node_modules/')

  await run('npm i prettier --save-dev')
  await writeFile(
    './.prettierrc',
    await readFile(join(dirname(fileURLToPath(import.meta.url)), '.prettierrc'))
  )
  if (project === 'TypeScript' || project === 'roblox-ts')
    await writeconfig(project)
  if (project === 'roblox-ts') {
    await run(
      'npm i @rbxts/services @rbxts/types @rbxts/compiler-types roblox-ts rbxts-transformer-services --save-dev'
    )
    await writeFile(
      './default.project.json',
      JSON.stringify(
        {
          name: 'MainModule',
          globIgnorePaths: [
            '**/package.json',
            '**/tsconfig.json',
            '**/LICENSE.txt'
          ],
          tree: {
            $path: 'out',
            include: {
              $path: 'include',
              node_modules: {
                $path: 'node_modules/@rbxts'
              }
            }
          }
        },
        null,
        2
      )
    )
    await mkdir('src')
    await writeFile(
      './src/index.ts',
      'export = (name: string) => {\n  // Your code here!\n}'
    )
    await appendFile('./.gitignore', '\nmodel.rbxmx\nout\ninclude')
    await appendFile(
      './.npmignore',
      'node_modules\ndefault.project.json\nmodel.rbxmx'
    )
  }

  if (project === 'TypeScript')
    await run('npm i typescript @types/node --save-dev')
  await appendFile('./.gitignore', '*.js')
  await writeFile('./.npmignore', '')
  console.log(
    colors.redBright(String.raw`//
|| Thanks for using create 5079!
\\`)
  )
}

main().catch(console.error)
