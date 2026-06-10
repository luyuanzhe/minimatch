import t from 'tap'

process.env.__MINIMATCH_TESTING_PLATFORM__ = 'win32'

t.test('strictSlashes on Windows platform', async t => {
  const { minimatch: mm } = await t.mockImport('../dist/esm/index.js', {})

  t.test(
    'Windows path a\\b\\c should NOT match a/b/c when strictSlashes is true',
    t => {
      t.equal(mm('a\\b\\c', 'a/b/c', { strictSlashes: true }), false)
      t.end()
    },
  )

  t.test(
    'Windows path a\\b\\c should match a/b/c by default (strictSlashes false)',
    t => {
      t.equal(mm('a\\b\\c', 'a/b/c'), true)
      t.equal(mm('a\\b\\c', 'a/b/c', { strictSlashes: false }), true)
      t.end()
    },
  )

  t.test('POSIX-style paths unaffected by strictSlashes', t => {
    t.equal(mm('a/b/c', 'a/b/c', { strictSlashes: true }), true)
    t.equal(mm('a/b/c', 'a/b/c'), true)
    t.equal(mm('a/b/c', 'a/*/c', { strictSlashes: true }), true)
    t.equal(mm('a/b/c', '**/c', { strictSlashes: true }), true)
    t.end()
  })

  t.end()
})

t.test('strictSlashes on POSIX platform has no effect', async t => {
  process.env.__MINIMATCH_TESTING_PLATFORM__ = 'posix'
  const { minimatch: mm } = await t.mockImport('../dist/esm/index.js', {})
  t.equal(mm('a/b/c', 'a/b/c', { strictSlashes: true }), true)
  t.equal(mm('a/b/c', 'a/*/c', { strictSlashes: true }), true)
  t.end()
})
