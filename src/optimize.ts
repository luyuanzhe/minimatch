import type { MinimatchOptions } from './index.js'

// get rid of adjascent ** and resolve .. portions
export const levelOneOptimize = (
  globParts: string[][],
  _opts?: MinimatchOptions,
): string[][] => {
  return globParts.map(parts => {
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

// First phase: single-pattern processing
// <pre> is 1 or more portions
// <rest> is 1 or more portions
// <p> is any portion other than ., .., '', or **
// <e> is . or ''
//
// **/.. is *brutal* for filesystem walking performance, because
// it effectively resets the recursive walk each time it occurs,
// and ** cannot be reduced out by a .. pattern part like a regexp
// or most strings (other than .., ., and '') can be.
//
// <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
// <pre>/<e>/<rest> -> <pre>/<rest>
// <pre>/<p>/../<rest> -> <pre>/<rest>
// **/**/<rest> -> **/<rest>
//
// **/*/<rest> -> */**/<rest> <== not valid because ** doesn't follow
// this WOULD be allowed if ** did follow symlinks, or * didn't
export const firstPhasePreProcess = (
  globParts: string[][],
  options: MinimatchOptions = {},
): string[][] => {
  let didSomething = false
  do {
    didSomething = false
    // <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
    for (let parts of globParts) {
      let gs: number = -1
      while (-1 !== (gs = parts.indexOf('**', gs + 1))) {
        let gss: number = gs
        while (parts[gss + 1] === '**') {
          // <pre>/**/**/<rest> -> <pre>/**/<rest>
          gss++
        }
        // eg, if gs is 2 and gss is 4, that means we have 3 **
        // parts, and can remove 2 of them.
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
        // edit parts in place, and push the new one
        parts.splice(gs, 1)
        const other = parts.slice(0)
        other[gs] = '**'
        globParts.push(other)
        gs--
      }

      // <pre>/<e>/<rest> -> <pre>/<rest>
      if (!options.preserveMultipleSlashes) {
        for (let i = 1; i < parts.length - 1; i++) {
          const p = parts[i]
          // don't squeeze out UNC patterns
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

      // <pre>/<p>/../<rest> -> <pre>/<rest>
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

// second phase: multi-pattern dedupes
// {<pre>/*/<rest>,<pre>/<p>/<rest>} -> <pre>/*/<rest>
// {<pre>/<rest>,<pre>/<rest>} -> <pre>/<rest>
// {<pre>/**/<rest>,<pre>/<rest>} -> <pre>/**/<rest>
//
// {<pre>/**/<rest>,<pre>/**/<p>/<rest>} -> <pre>/**/<rest>
// ^-- not valid because ** doens't follow symlinks
export const secondPhasePreProcess = (
  globParts: string[][],
  options: MinimatchOptions = {},
): string[][] => {
  for (let i = 0; i < globParts.length - 1; i++) {
    for (let j = i + 1; j < globParts.length; j++) {
      const matched = partsMatch(
        globParts[i] as string[],
        globParts[j] as string[],
        !options.preserveMultipleSlashes,
        options,
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

export const partsMatch = (
  a: string[],
  b: string[],
  emptyGSMatch: boolean = false,
  options: MinimatchOptions = {},
): false | string[] => {
  let ai = 0
  let bi = 0
  let result: string[] = []
  let which: string = ''
  while (ai < a.length && bi < b.length) {
    if (a[ai] === b[bi]) {
      result.push(which === 'b' ? b[bi] as string : a[ai] as string)
      ai++
      bi++
    } else if (emptyGSMatch && a[ai] === '**' && b[bi] === a[ai + 1]) {
      result.push(a[ai] as string)
      ai++
    } else if (emptyGSMatch && b[bi] === '**' && a[ai] === b[bi + 1]) {
      result.push(b[bi] as string)
      bi++
    } else if (
      a[ai] === '*' &&
      b[bi] &&
      (options.dot || !(b[bi] as string).startsWith('.')) &&
      b[bi] !== '**'
    ) {
      if (which === 'b') return false
      which = 'a'
      result.push(a[ai] as string)
      ai++
      bi++
    } else if (
      b[bi] === '*' &&
      a[ai] &&
      (options.dot || !(a[ai] as string).startsWith('.')) &&
      a[ai] !== '**'
    ) {
      if (which === 'a') return false
      which = 'b'
      result.push(b[bi] as string)
      ai++
      bi++
    } else {
      return false
    }
  }
  // if we fall out of the loop, it means they two are identical
  // as long as their lengths match
  return a.length === b.length && result
}
