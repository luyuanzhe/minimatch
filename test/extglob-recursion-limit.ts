import t from 'tap'
import { minimatch } from '../src/index.js'

t.test('nested negated extglobs within the recursion limit match correctly', t => {
  const pattern = '!(a|b|!(c|d|e))'
  const options = { maxExtglobRecursion: 2 }
  t.equal(minimatch('f', pattern, options), true)
  t.equal(minimatch('a', pattern, options), false)
  t.end()
})

t.test('patterns deeper than the recursion limit fall back to noext matching', t => {
  const pattern = '!(a|!(b|!(c|d)))'
  const options = { maxExtglobRecursion: 2 }
  t.equal(minimatch('x', pattern, options), false)
  t.end()
})

t.test('depth exactly at the recursion limit still parses extglobs', t => {
  const pattern = '!(a|b|!(c|d|e))'
  const options = { maxExtglobRecursion: 2 }
  t.equal(minimatch('e', pattern, options), true)
  t.equal(minimatch('b', pattern, options), false)
  t.end()
})

t.test('negated extglobs compose with globstar', t => {
  const pattern = '!(a/**/b)'
  const options = { maxExtglobRecursion: 2 }
  t.equal(minimatch('a/x/b', pattern, options), false)
  t.equal(minimatch('c/d', pattern, options), true)
  t.end()
})
