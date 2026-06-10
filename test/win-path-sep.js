import t from 'tap'

t.test('path separator /', async t => {
  process.env.__MINIMATCH_TESTING_PLATFORM__ = 'posix'
  const { minimatch: mm } = await t.mockImport('../dist/esm/index.js', {})
  t.equal(mm('x/y/z', 'x/y/*/z'), false)
  t.equal(mm('x/y/w/z', 'x/y/*/z'), true)
  t.end()
})

t.test('path separator \\', async t => {
  process.env.__MINIMATCH_TESTING_PLATFORM__ = 'win32'
  const { minimatch: mm } = await t.mockImport('../dist/esm/index.js', {})
  t.equal(mm('x\\y\\z', 'x/y/*/z'), false)
  t.equal(mm('x\\y\\w\\z', 'x/y/*/z'), true)
  t.end()
})

t.test('override with options', async t => {
  process.env.__MINIMATCH_TESTING_PLATFORM__ = 'win32'
  const { minimatch: mm } = await t.mockImport('../dist/esm/index.js', {})

  t.equal(
    mm('c:\\foo\\bar', 'c:\\foo\\*', {
      windowsPathsNoEscape: true,
    }),
    true,
  )

  t.equal(
    mm('c:\\foo\\bar', 'c:\\foo\\*', {
      allowWindowsEscape: false,
    }),
    true,
  )

  t.equal(mm('c:\\foo\\bar', 'c:\\foo\\*', {}), false)

  t.equal(
    mm('c:\\foo\\bar', 'c:\\foo\\*', {
      allowWindowsEscape: null,
    }),
    false,
  )

  t.end()
})

t.test('drive letter paths (UNC/drive matching)', async t => {
  process.env.__MINIMATCH_TESTING_PLATFORM__ = 'win32'
  const { minimatch: mm } = await t.mockImport('../dist/esm/index.js', {})

  // drive-letter absolute paths match when same root (case-insensitive)
  t.equal(mm('c:/foo', 'c:/foo'), true, 'same drive same path')
  t.equal(mm('C:/foo', 'c:/foo'), true, 'case-insensitive drive letter')
  t.equal(mm('c:/foo', 'C:/foo'), true, 'case-insensitive drive letter 2')
  t.equal(mm('c:/foo', 'd:/foo'), false, 'different drive letters')

  // drive paths mixed with UNC paths
  t.equal(mm('//?/c:/foo', 'c:/foo'), true, 'UNC drive matches plain drive')
  t.equal(mm('c:/foo', '//?/c:/foo'), true, 'plain drive matches UNC drive')
  t.equal(mm('//?/C:/foo', '//?/c:/foo'), true, 'UNC case-insensitive drive')

  // globstar under drive letter works
  t.equal(mm('c:/temp/file', 'c:/**'), true, 'c:/** matches c:/temp/file')
  t.equal(mm('c:/temp/file', 'c:/*/*'), true, 'c:/*/* matches c:/temp/file')

  t.end()
})
