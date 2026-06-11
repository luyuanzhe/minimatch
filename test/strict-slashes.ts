import t from 'tap'
import { minimatch } from '../dist/esm/index.js'

t.test('Windows path with strictSlashes: true should not match', t => {
  t.equal(
    minimatch('a\\b\\c', 'a/b/c', { strictSlashes: true }),
    false,
    'Windows backslash path should not match POSIX pattern with strictSlashes'
  )
  t.end()
})

t.test('Windows path with strictSlashes: false should match', t => {
  t.equal(
    minimatch('a\\b\\c', 'a/b/c', { strictSlashes: false }),
    true,
    'Windows backslash path should match POSIX pattern without strictSlashes'
  )
  t.end()
})

t.test('Windows path with default options should match', t => {
  t.equal(
    minimatch('a\\b\\c', 'a/b/c'),
    true,
    'Windows backslash path should match by default'
  )
  t.end()
})

t.test('POSIX path should not be affected by strictSlashes', t => {
  t.equal(
    minimatch('a/b/c', 'a/b/c', { strictSlashes: true }),
    true,
    'POSIX path should match POSIX pattern with strictSlashes'
  )
  t.equal(
    minimatch('a/b/c', 'a/b/c', { strictSlashes: false }),
    true,
    'POSIX path should match POSIX pattern without strictSlashes'
  )
  t.end()
})

t.test('POSIX path with wildcards should work with strictSlashes', t => {
  t.equal(
    minimatch('a/b/c', 'a/*/c', { strictSlashes: true }),
    true,
    'Wildcard should work with strictSlashes on POSIX paths'
  )
  t.equal(
    minimatch('a/b/c', 'a/**/c', { strictSlashes: true }),
    true,
    'Globstar should work with strictSlashes on POSIX paths'
  )
  t.end()
})

t.test('mixed paths with strictSlashes', t => {
  t.equal(
    minimatch('a/b\\c', 'a/b/c', { strictSlashes: true }),
    false,
    'Mixed path should not match with strictSlashes'
  )
  t.equal(
    minimatch('a/b\\c', 'a/b/c', { strictSlashes: false }),
    true,
    'Mixed path should match without strictSlashes'
  )
  t.end()
})
