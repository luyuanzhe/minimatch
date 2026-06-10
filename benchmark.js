import { minimatch } from './dist/esm/index.js'
import { expand } from 'brace-expansion'
const pattern = '**/*.js'
const files = expand('x/y/z/{1..1000}.js')
const start = process.hrtime()

for (let i = 0; i < 1000; i++) {
  for (let f = 0; f < files.length; f++) {
    const res = minimatch(pattern, files[f])
  }
  if (!(i % 10)) process.stdout.write('.')
}
console.log('done')
const dur = process.hrtime(start)
console.log('%s ms', dur[0] * 1e3 + dur[1] / 1e6)
