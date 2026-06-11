import t from 'tap'
import { Minimatch } from '../dist/esm/index.js'

const winPath = 'a\\b\\c'
const pattern = 'a/b/c'
const posixPath = 'a/b/c'

t.test('strictSlashes: true, Windows path should not match', t => {
  const mm = new Minimatch(pattern, {
    platform: 'win32',
    strictSlashes: true,
  })
  t.equal(mm.match(winPath), false)
  t.end()
})

t.test('strictSlashes: false (default), Windows path should match', t => {
  const mm = new Minimatch(pattern, {
    platform: 'win32',
    strictSlashes: false,
  })
  t.equal(mm.match(winPath), true)
  t.end()
})

t.test('strictSlashes does not affect POSIX paths', t => {
  const mmStrict = new Minimatch(pattern, {
    platform: 'win32',
    strictSlashes: true,
  })
  t.equal(mmStrict.match(posixPath), true)

  const mmDefault = new Minimatch(pattern, {
    platform: 'win32',
    strictSlashes: false,
  })
  t.equal(mmDefault.match(posixPath), true)
  t.end()
})