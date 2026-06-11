import t from 'tap'
import { getOptimizationPlan, minimatch } from '../dist/esm/index.js'

t.test('returns a level 2 optimization plan', t => {
  const plan = getOptimizationPlan('a/{*,c}/b', {
    optimizationLevel: 2,
  })

  t.equal(plan.originalPattern, 'a/{*,c}/b')
  t.equal(plan.optimizationLevel, 2)
  t.same(
    plan.steps.map(step => step.phase),
    ['braceExpand', 'firstPreprocess', 'secondPreprocess', 'finalSet'],
  )
  t.same(plan.steps[0].output, ['a/*/b', 'a/c/b'])
  t.same(plan.finalSet, [['a', '*', 'b']])
  t.ok(plan.regexp instanceof RegExp)
  t.same(
    minimatch.getOptimizationPlan('a/{*,c}/b', {
      optimizationLevel: 2,
    }).finalSet,
    plan.finalSet,
  )
  t.end()
})

t.test('shows skipped second preprocessing below level 2', t => {
  const plan = getOptimizationPlan('x/**/**/y', {
    optimizationLevel: 0,
  })

  t.equal(plan.steps[1].phase, 'firstPreprocess')
  t.same(plan.steps[1].output, ['x/**/y'])
  t.equal(plan.steps[2].phase, 'secondPreprocess')
  t.equal(plan.steps[2].description, 'Skipped because optimizationLevel is below 2.')
  t.same(plan.finalSet, [['x', '**', 'y']])
  t.end()
})

t.test('respects defaults wrappers', t => {
  const mm = minimatch.defaults({ optimizationLevel: 2 })
  const plan = mm.getOptimizationPlan('a/{*,c}/b')

  t.equal(plan.optimizationLevel, 2)
  t.same(plan.finalSet, [['a', '*', 'b']])
  t.end()
})
