import t from 'tap'
import { minimatch } from '../src/index.js'

t.test('strictSlashes', async t => {
  t.test('strictSlashes: true on Windows', async t => {
    t.equal(
      minimatch('a\\b\\c', 'a/b/c', {
        strictSlashes: true,
        platform: 'win32',
      }),
      false,
      'should not convert \\ to /'
    )
  })

  t.test('strictSlashes: false on Windows', async t => {
    t.equal(
      minimatch('a\\b\\c', 'a/b/c', {
        strictSlashes: false,
        platform: 'win32',
      }),
      true,
      'should convert \\ to /'
    )

    t.equal(
      minimatch('a\\b\\c', 'a/b/c', {
        platform: 'win32',
      }),
      true,
      'default should convert \\ to /'
    )
  })

  t.test('POSIX path unaffected', async t => {
    t.equal(
      minimatch('a/b/c', 'a/b/c', {
        strictSlashes: true,
        platform: 'linux',
      }),
      true,
      'linux should match with strictSlashes: true'
    )

    t.equal(
      minimatch('a/b/c', 'a/b/c', {
        strictSlashes: false,
        platform: 'linux',
      }),
      true,
      'linux should match with strictSlashes: false'
    )
  })
})
