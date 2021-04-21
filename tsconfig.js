import { writeFile } from 'node:fs/promises'

export default (project) =>
  writeFile(
    './tsconfig.json',
    JSON.stringify(
      project === 'TypeScript'
        ? {
            compilerOptions: {
              module: 'ESNext',
              target: 'ESNext',
              forceConsistentCasingInFileNames: true,
              removeComments: true,
              esModuleInterop: true,
              importHelpers: true,
              strict: true,
              newLine: 'lf',
              alwaysStrict: true,
              moduleResolution: 'Node',
              inlineSourceMap: true,
              experimentalDecorators: true,
              resolveJsonModule: false
            },
            exclude: ['node_modules', '**/node_modules/*', 'node_modules/']
          }
        : {
            compilerOptions: {
              allowSyntheticDefaultImports: true,
              isolatedModules: true,
              downlevelIteration: true,
              module: 'commonjs',
              noLib: true,
              strict: true,
              target: 'ESNext',
              typeRoots: ['node_modules/@rbxts'],
              plugins: [
                {
                  transform: 'rbxts-transformer-services'
                }
              ],
              moduleResolution: 'Node',
              rootDir: 'src',
              outDir: 'out',
              baseUrl: 'src',
              declaration: true,
              jsx: 'react',
              jsxFactory: 'Roact.createElement',
              jsxFragmentFactory: 'Roact.Fragment'
            }
          },
      null,
      2
    )
  )
