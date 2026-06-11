// @ts-ignore
import t from 'tap'
import { minimatch } from '../src/index.js'

t.test('不超过限制 (depth 2)', (t: any) => {
  const pattern = '!(a|b|!(c|d|e))'
  const opts = { maxExtglobRecursion: 2 }
  
  t.equal(minimatch('f', pattern, opts), true, "匹配 'f' 应为 true")
  t.equal(minimatch('a', pattern, opts), false, "匹配 'a' 应为 false")
  t.end()
})

t.test('超过限制 (depth 3)', (t: any) => {
  const pattern = '!(a|!(b|!(c|d)))'
  const opts = { maxExtglobRecursion: 2 }
  
  t.equal(minimatch('x', pattern, opts), false, "匹配 'x' 应为 false")
  t.equal(minimatch('a', pattern, opts), false, "匹配 'a' 应为 false")
  t.end()
})

t.test('边界值: 深度等于限制 (depth 2)', (t: any) => {
  const pattern = '!(a|!(b|c))'
  const opts = { maxExtglobRecursion: 2 }
  
  t.equal(minimatch('b', pattern, opts), true, "匹配 'b' 应为 true")
  t.equal(minimatch('c', pattern, opts), true, "匹配 'c' 应为 true")
  t.equal(minimatch('a', pattern, opts), false, "匹配 'a' 应为 false")
  t.equal(minimatch('x', pattern, opts), false, "匹配 'x' 应为 false")
  t.end()
})

t.test('组合否定与 globstar', (t: any) => {
  const pattern = '!(a/**/b)'
  const opts = { maxExtglobRecursion: 2 }
  
  t.equal(minimatch('a/x/b', pattern, opts), false, "被否定，应为 false")
  t.equal(minimatch('c/d', pattern, opts), true, "不匹配 a/**/b，应为 true")
  t.end()
})

t.test('自定义限制', (t: any) => {
  const pattern = '!(a|!(b|!(c|d)))'
  const opts = { maxExtglobRecursion: 3 }
  
  t.equal(minimatch('x', pattern, opts), true, "匹配 'x' 应为 true (被正确解析)")
  t.equal(minimatch('b', pattern, opts), true, "匹配 'b' 应为 true")
  t.equal(minimatch('a', pattern, opts), false, "匹配 'a' 应为 false")
  t.equal(minimatch('c', pattern, opts), false, "匹配 'c' 应为 false")
  t.equal(minimatch('d', pattern, opts), false, "匹配 'd' 应为 false")
  t.end()
})
