#!/usr/bin/env node

import benchmark from 'benchmark'

import { atom, action } from '../index.js'

let suite = new benchmark.Suite()

function formatNumber(number) {
  return String(number)
    .replace(/\d{3}$/, ',$&')
    .replace(/^(\d|\d\d)(\d{3},)/, '$1,$2')
}

suite
  .add('atom', () => {
    let counter = atom(0)
    let calls = 0

    let increase = action(counter, 'increase', () => {
      counter.set(counter.get() + 1)
    })
    increase()

    let unbind1 = counter.listen(() => {
      if (!calls) calls += 1
    })
    let unbind2 = counter.listen(() => {
      if (!calls) calls += 1
    })
    unbind1()
    let unbind3 = counter.listen(() => {
      if (!calls) calls += 1
    })

    increase()
    increase()
    increase()

    unbind2()
    unbind3()
  })
  .on('cycle', event => {
    let name = event.target.name
    let hz = formatNumber(event.target.hz.toFixed(0)).padStart(10)
    process.stdout.write(`${name}${hz} ops/sec\n`)
  })
  .on('error', event => {
    process.stderr.write(event.target.error.toString() + '\n')
    process.exit(1)
  })
  .run()