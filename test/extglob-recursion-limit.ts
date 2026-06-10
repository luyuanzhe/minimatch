import t from 'tap'
import { minimatch } from '../src/index.js'

t.test('extglob recursion limit: default maxExtglobRecursion = 2', t => {
  const opt = { maxExtglobRecursion: 2 }

  t.test('depth 2 (no exceed) — nested negation within allowed limit', t => {
    const p = '!(a|b|!(c|d|e))'
    t.equal(
      minimatch('f', p, opt),
      true,
      "'f' matches !(a|b|!(c|d|e)): not a/b and not c/d/e",
    )
    t.equal(
      minimatch('a', p, opt),
      false,
      "'a' does not match !(a|b|!(c|d|e)): explicitly a",
    )
    t.equal(
      minimatch('b', p, opt),
      false,
      "'b' does not match !(a|b|!(c|d|e)): explicitly b",
    )
    t.equal(
      minimatch('c', p, opt),
      false,
      "'c' does not match !(a|b|!(c|d|e)): c is inside inner !(c|d|e)",
    )
    t.equal(
      minimatch('e', p, opt),
      false,
      "'e' does not match !(a|b|!(c|d|e)): e is inside inner !(c|d|e)",
    )
    t.end()
  })

  t.test('depth 2 (boundary) — pattern with exactly 2 levels of negation', t => {
    const p = '!(a|!(b|c))'
    t.equal(
      minimatch('x', p, opt),
      true,
      "'x' matches !(a|!(b|c)): not a, and !(b|c) fails for x, so alt taken",
    )
    t.equal(
      minimatch('a', p, opt),
      false,
      "'a' does not match !(a|!(b|c)): a is explicitly matched",
    )
    t.equal(
      minimatch('b', p, opt),
      true,
      "'b' matches !(a|!(b|c)): b is explicitly excluded from 'not a' but passes since !(b|c) rejects b",
    )
    t.end()
  })

  t.test(
    'depth 3 (exceeds limit) — outer !(a|!(b|!(c|d))) triggers noext fallback',
    t => {
      const p = '!(a|!(b|!(c|d)))'
      t.equal(
        minimatch('x', p, opt),
        false,
        "'x' returns false because deepest !(c|d) is treated as literal",
      )
      t.equal(
        minimatch('a', p, opt),
        false,
        "'a' returns false (intentional false negative due to recursion limit)",
      )
      t.equal(
        minimatch(p, p, opt),
        true,
        'pattern matches itself literally — extglob at depth > 2 not parsed',
      )
      t.end()
    },
  )

  t.test('custom higher recursion limit allows deeper nesting', t => {
    const p = '!(a|!(b|!(c|d)))'
    const high = { maxExtglobRecursion: 10 }
    t.equal(
      minimatch('x', p, high),
      true,
      "'x' matches !(a|!(b|!(c|d))) when limit raised to 10",
    )
    t.equal(
      minimatch('a', p, high),
      false,
      "'a' does not match when limit raised",
    )
    t.equal(
      minimatch('b', p, high),
      true,
      "'b' matches: rejected by inner !(b|!(c|d)) then accepted by outer !",
    )
    t.equal(
      minimatch('c', p, high),
      true,
      "'c' matches: inner !(c|d) rejects c, cascades",
    )
    t.end()
  })

  t.test('environment variable override when higher limit provided', t => {
    const p = '!(a|!(b|!(c|!(d|e))))'
    const defaultOpt = { maxExtglobRecursion: 2 }
    const highOpt = { maxExtglobRecursion: 20 }
    t.equal(
      minimatch('z', p, defaultOpt),
      false,
      'depth 4 with default limit falls back to noext → literal',
    )
    t.equal(
      minimatch('z', p, highOpt),
      true,
      'depth 4 with limit 20 parses fully; z matches the double-negation chain',
    )
    t.end()
  })

  t.test('negation combined with globstar — !(a/**/b)', t => {
    const p = '!(a/**/b)'
    t.equal(
      minimatch('a/x/b', p, opt),
      false,
      "'a/x/b' does not match !(a/**/b): path is explicitly excluded",
    )
    t.equal(
      minimatch('a/b', p, opt),
      false,
      "'a/b' does not match !(a/**/b): ** can match zero segments",
    )
    t.equal(
      minimatch('c/d', p, opt),
      true,
      "'c/d' matches !(a/**/b): not in excluded path",
    )
    t.equal(
      minimatch('a/x/y/b', p, opt),
      false,
      "'a/x/y/b' does not match !(a/**/b): multi-segment exclusion",
    )
    t.equal(
      minimatch('a', p, opt),
      true,
      "'a' matches !(a/**/b): a alone does not end with /b",
    )
    t.end()
  })

  t.end()
})
