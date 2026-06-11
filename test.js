import { minimatch } from './dist/esm/index.js'

console.log('Depth 3:', minimatch('x', '!(a|!(b|!(c|d)))', { maxExtglobRecursion: 2 }))
console.log('Depth 4:', minimatch('x', '!(a|!(b|!(c|!(d|e))))', { maxExtglobRecursion: 2 }))
console.log('Depth 4 with limit 3:', minimatch('x', '!(a|!(b|!(c|!(d|e))))', { maxExtglobRecursion: 3 }))
