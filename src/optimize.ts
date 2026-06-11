import type { MinimatchOptions } from './index.js'

export const partsMatch = (
  a: string[],
  b: string[],
  opts: MinimatchOptions,
  emptyGSMatch: boolean = false,
): false | string[] => {
  let ai = 0
  let bi = 0
  let result: string[] = []
  let which: string = ''
  while (ai < a.length && bi < b.length) {
    if (a[ai] === b[bi]) {
      result.push(which === 'b' ? b[bi] : a[ai])
      ai++
      bi++
    } else if (emptyGSMatch && a[ai] === '**' && b[bi] === a[ai + 1]) {
      result.push(a[ai])
      ai++
    } else if (emptyGSMatch && b[bi] === '**' && a[ai] === b[bi + 1]) {
      result.push(b[bi])
      bi++
    } else if (
      a[ai] === '*' &&
      b[bi] &&
      (opts.dot || !b[bi].startsWith('.')) &&
      b[bi] !== '**'
    ) {
      if (which === 'b') return false
      which = 'a'
      result.push(a[ai])
      ai++
      bi++
    } else if (
      b[bi] === '*' &&
      a[ai] &&
      (opts.dot || !a[ai].startsWith('.')) &&
      a[ai] !== '**'
    ) {
      if (which === 'a') return false
      which = 'b'
      result.push(b[bi])
      ai++
      bi++
    } else {
      return false
    }
  }
  return a.length === b.length && result
}

export const secondPhasePreProcess = (
  globParts: string[][],
  opts: MinimatchOptions,
): string[][] => {
  for (let i = 0; i < globParts.length - 1; i++) {
    for (let j = i + 1; j < globParts.length; j++) {
      const matched = partsMatch(
        globParts[i],
        globParts[j],
        opts,
        !opts.preserveMultipleSlashes,
      )
      if (matched) {
        globParts[i] = []
        globParts[j] = matched
        break
      }
    }
  }
  return globParts.filter(gs => gs.length)
}

export const firstPhasePreProcess = (
  globParts: string[][],
  opts: MinimatchOptions,
): string[][] => {
  let didSomething = false
  do {
    didSomething = false
    for (let parts of globParts) {
      let gs: number = -1
      while (-1 !== (gs = parts.indexOf('**', gs + 1))) {
        let gss: number = gs
        while (parts[gss + 1] === '**') {
          gss++
        }
        if (gss > gs) {
          parts.splice(gs + 1, gss - gs)
        }

        let next = parts[gs + 1]
        const p = parts[gs + 2]
        const p2 = parts[gs + 3]
        if (next !== '..') continue
        if (
          !p ||
          p === '.' ||
          p === '..' ||
          !p2 ||
          p2 === '.' ||
          p2 === '..'
        ) {
          continue
        }
        didSomething = true
        parts.splice(gs, 1)
        const other = parts.slice(0)
        other[gs] = '**'
        globParts.push(other)
        gs--
      }

      if (!opts.preserveMultipleSlashes) {
        for (let i = 1; i < parts.length - 1; i++) {
          const p = parts[i]
          if (i === 1 && p === '' && parts[0] === '') continue
          if (p === '.' || p === '') {
            didSomething = true
            parts.splice(i, 1)
            i--
          }
        }
        if (
          parts[0] === '.' &&
          parts.length === 2 &&
          (parts[1] === '.' || parts[1] === '')
        ) {
          didSomething = true
          parts.pop()
        }
      }

      let dd: number = 0
      while (-1 !== (dd = parts.indexOf('..', dd + 1))) {
        const p = parts[dd - 1]
        if (p && p !== '.' && p !== '..' && p !== '**') {
          didSomething = true
          const needDot = dd === 1 && parts[dd + 1] === '**'
          const splin = needDot ? ['.'] : []
          parts.splice(dd - 1, 2, ...splin)
          if (parts.length === 0) parts.push('')
          dd -= 2
        }
      }
    }
  } while (didSomething)

  return globParts
}

export const levelOneOptimize = (
  parts: string[][],
  opts: MinimatchOptions,
): string[][] => {
  return parts.map(parts => {
    parts = parts.reduce((set: string[], part) => {
      const prev = set[set.length - 1]
      if (part === '**' && prev === '**') {
        return set
      }
      if (part === '..') {
        if (prev && prev !== '..' && prev !== '.' && prev !== '**') {
          set.pop()
          return set
        }
      }
      set.push(part)
      return set
    }, [])
    return parts.length === 0 ? [''] : parts
  })
}