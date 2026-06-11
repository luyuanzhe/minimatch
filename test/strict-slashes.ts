import t from 'tap'
import { minimatch } from '../dist/esm/index.js'

t.test('strictSlashes keeps windows separators distinct', t => {
  t.equal(
    minimatch('a\\b\\c', 'a/b/c', {
      platform: 'win32',
      strictSlashes: true,
    }),
    false,
  )
  t.end()
})

t.test('strictSlashes defaults to false', t => {
  t.equal(
    minimatch('a\\b\\c', 'a/b/c', {
      platform: 'win32',
    }),
    true,
  )
  t.end()
})

t.test('strictSlashes does not affect POSIX paths', t => {
  t.equal(
    minimatch('a/b/c', 'a/b/c', {
      platform: 'win32',
      strictSlashes: true,
    }),
    true,
  )
  t.end()
})
