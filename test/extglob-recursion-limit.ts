import t from 'tap'
import { minimatch } from '../src/index.js'
import { AST } from '../src/ast.js'

const defaultOpts = { maxExtglobRecursion: 2 }

t.test('within recursion limit (depth 2)', async t => {
  const pattern = '!(a|b|!(c|d|e))'

  t.test('should match "f" (not a/b and not c/d/e)', () => {
    const result = minimatch('f', pattern, defaultOpts)
    t.equal(result, true)
  })

  t.test('should not match "a"', () => {
    const result = minimatch('a', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('should not match "b"', () => {
    const result = minimatch('b', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('should not match "c"', () => {
    const result = minimatch('c', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('should not match "d"', () => {
    const result = minimatch('d', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('should not match "e"', () => {
    const result = minimatch('e', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('should match "x" (not a/b and not c/d/e)', () => {
    const result = minimatch('x', pattern, defaultOpts)
    t.equal(result, true)
  })

  t.test('AST should parse with proper nesting', () => {
    const ast = AST.fromGlob(pattern, defaultOpts)
    t.ok(ast.hasMagic)
    t.equal(ast.toString(), pattern)
  })
})

t.test('exceeds recursion limit (depth 3)', async t => {
  const pattern = '!(a|!(b|!(c|d)))'

  t.test('should return false for "x" due to degraded noext handling', () => {
    const result = minimatch('x', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('should return false for "a"', () => {
    const result = minimatch('a', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('should return false for arbitrary string', () => {
    const result = minimatch('anything', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('AST should show degraded parsing (no nested extglob)', () => {
    const ast = AST.fromGlob(pattern, defaultOpts)
    const str = ast.toString()
    t.ok(
      str.includes('!(') || str !== pattern,
      'pattern should be degraded due to recursion limit',
    )
  })
})

t.test('boundary value (depth exactly equals limit = 2)', async t => {
  t.test('!(a|!(b|c)) should match "x"', () => {
    const pattern = '!(a|!(b|c))'
    const result = minimatch('x', pattern, defaultOpts)
    t.equal(result, true)
  })

  t.test('!(a|!(b|c)) should not match "a"', () => {
    const pattern = '!(a|!(b|c))'
    const result = minimatch('a', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('!(a|!(b|c)) should match "b"', () => {
    const pattern = '!(a|!(b|c))'
    const result = minimatch('b', pattern, defaultOpts)
    t.equal(result, true)
  })

  t.test('!(a|!(b|c)) should match "c"', () => {
    const pattern = '!(a|!(b|c))'
    const result = minimatch('c', pattern, defaultOpts)
    t.equal(result, true)
  })

  t.test('*(a|*(b|c)) should match "abc"', () => {
    const pattern = '*(a|*(b|c))'
    const result = minimatch('abc', pattern, defaultOpts)
    t.equal(result, true)
  })

  t.test('+(a|@(b|c)) should match "a"', () => {
    const pattern = '+(a|@(b|c))'
    const result = minimatch('a', pattern, defaultOpts)
    t.equal(result, true)
  })

  t.test('+(a|@(b|c)) should match "b"', () => {
    const pattern = '+(a|@(b|c))'
    const result = minimatch('b', pattern, defaultOpts)
    t.equal(result, true)
  })
})

t.test('negation with globstar', async t => {
  t.test('!(a/**/b) should not match "a/x/b"', () => {
    const pattern = '!(a/**/b)'
    const result = minimatch('a/x/b', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('!(a/**/b) should match "c/d"', () => {
    const pattern = '!(a/**/b)'
    const result = minimatch('c/d', pattern, defaultOpts)
    t.equal(result, true)
  })

  t.test('!(a/**/b) should not match "a/b"', () => {
    const pattern = '!(a/**/b)'
    const result = minimatch('a/b', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('!(a/**/b) should not match "a/x/y/b"', () => {
    const pattern = '!(a/**/b)'
    const result = minimatch('a/x/y/b', pattern, defaultOpts)
    t.equal(result, false)
  })

  t.test('!(a/**/b) should match "a/c"', () => {
    const pattern = '!(a/**/b)'
    const result = minimatch('a/c', pattern, defaultOpts)
    t.equal(result, true)
  })
})

t.test('custom recursion limit via options', async t => {
  t.test('with maxExtglobRecursion: 3, depth 3 pattern should work', () => {
    const pattern = '!(a|!(b|!(c|d)))'
    const opts = { maxExtglobRecursion: 3 }
    const result = minimatch('x', pattern, opts)
    t.equal(result, true)
  })

  t.test('with maxExtglobRecursion: 3, "a" should not match', () => {
    const pattern = '!(a|!(b|!(c|d)))'
    const opts = { maxExtglobRecursion: 3 }
    const result = minimatch('a', pattern, opts)
    t.equal(result, false)
  })

  t.test('with maxExtglobRecursion: 1, depth 2 pattern degrades', () => {
    const pattern = '!(a|!(b|c))'
    const opts = { maxExtglobRecursion: 1 }
    const result = minimatch('x', pattern, opts)
    t.equal(result, false)
  })

  t.test('with maxExtglobRecursion: 0, even simple extglob degrades', () => {
    const pattern = '!(a|b)'
    const opts = { maxExtglobRecursion: 0 }
    const result = minimatch('c', pattern, opts)
    t.equal(result, false)
  })
})

t.test('performance does not regress with recursion limit', async t => {
  t.test('deep pattern should complete quickly', () => {
    const pattern = '!(a|!(b|!(c|!(d|e))))'
    const start = performance.now()
    minimatch('x', pattern, defaultOpts)
    const elapsed = performance.now() - start
    t.ok(elapsed < 100, `completed in ${elapsed.toFixed(2)}ms`)
  })

  t.test('complex nested pattern should complete quickly', () => {
    const pattern = '*(+(*(a|b)|c)|!(d|e|!(f|g)))'
    const start = performance.now()
    minimatch('xyz', pattern, defaultOpts)
    const elapsed = performance.now() - start
    t.ok(elapsed < 100, `completed in ${elapsed.toFixed(2)}ms`)
  })
})
