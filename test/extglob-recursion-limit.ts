import t from 'tap'
import { minimatch } from '../src/index.js'

const defaultOpts = { maxExtglobRecursion: 2 }

t.test('within recursion limit: depth 2 extglob', t => {
  const pattern = '!(a|b|!(c|d|e))'
  t.equal(
    minimatch('f', pattern, defaultOpts),
    true,
    'f should match: not a, not b, not (c|d|e)',
  )
  t.equal(
    minimatch('a', pattern, defaultOpts),
    false,
    'a should not match: excluded by first option',
  )
  t.equal(
    minimatch('c', pattern, defaultOpts),
    false,
    'c should not match: excluded by nested extglob',
  )
  t.equal(
    minimatch('e', pattern, defaultOpts),
    false,
    'e should not match: excluded by nested extglob',
  )
  t.end()
})

t.test('exceeds recursion limit: depth 3 triggers fallback', t => {
  const pattern = '!(a|!(b|!(c|d)))'
  t.equal(
    minimatch('x', pattern, defaultOpts),
    false,
    'x should not match: exceeding recursion limit triggers noext fallback, ' +
      'pattern treated as literal !(...), intentional false negative',
  )
  t.equal(
    minimatch('a', pattern, defaultOpts),
    false,
    'any string should fail when limit exceeded, including a',
  )
  t.equal(
    minimatch('c', pattern, defaultOpts),
    false,
    'any string should fail when limit exceeded, including c',
  )
  t.end()
})

t.test('boundary: depth exactly at limit (2)', t => {
  const pattern = '!(a|b|!(c|d))'
  t.equal(
    minimatch('f', pattern, defaultOpts),
    true,
    'f should match: not a, not b, not (c|d)',
  )
  t.equal(
    minimatch('a', pattern, defaultOpts),
    false,
    'a should not match: excluded by first option',
  )
  t.equal(
    minimatch('c', pattern, defaultOpts),
    false,
    'c should not match: excluded by nested extglob',
  )
  t.equal(
    minimatch('d', pattern, defaultOpts),
    false,
    'd should not match: excluded by nested extglob',
  )
  t.end()
})

t.test('negation combined with globstar', t => {
  const pattern = '!(a/**/b)'
  t.equal(
    minimatch('a/x/b', pattern, defaultOpts),
    false,
    'a/x/b should not match: excluded by negation of a/**/b',
  )
  t.equal(
    minimatch('c/d', pattern, defaultOpts),
    true,
    'c/d should match: does not match a/**/b',
  )
  t.end()
})

t.test('custom higher recursion limit allows deeper nesting', t => {
  const pattern = '!(a|!(b|!(c|!(d|e))))'
  t.equal(
    minimatch('x', pattern, { maxExtglobRecursion: 3 }),
    true,
    'with maxExtglobRecursion=3, depth 4 pattern fully parses, x is not excluded',
  )
  t.equal(
    minimatch('a', pattern, { maxExtglobRecursion: 3 }),
    false,
    'a excluded with higher limit',
  )
  t.equal(
    minimatch('d', pattern, { maxExtglobRecursion: 3 }),
    false,
    'd excluded with higher limit: innermost !(d|e) properly parsed',
  )
  t.end()
})

t.test('custom lower recursion limit triggers fallback sooner', t => {
  const pattern = '!(a|!(b|!(c|d)))'
  t.equal(
    minimatch('x', pattern, { maxExtglobRecursion: 1 }),
    true,
    'with maxExtglobRecursion=1, 3-level pattern hits limit, innermost !(c|d) degraded, pattern more permissive',
  )
  t.equal(
    minimatch('a', pattern, { maxExtglobRecursion: 1 }),
    false,
    'a still excluded with lower limit: outermost negation intact',
  )
  t.equal(
    minimatch('x', pattern, { maxExtglobRecursion: 2 }),
    true,
    'with maxExtglobRecursion=2, 3-level pattern at boundary, fully parses, x not excluded',
  )
  t.end()
})

