/**
 * Makes the outer white background of the source logo transparent and writes
 * two cropped assets: the full lock-up and the emblem on its own.
 *
 * Run once after replacing public/sangam_logo.png:
 *   node scripts/prepare-logo.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'

const SOURCE = 'public/sangam_logo.png'
const FULL_OUT = 'public/sangam-logo.png'
const MARK_OUT = 'public/sangam-mark.png'

const WHITE_FLOOR = 238
const EDGE_SOFT_FLOOR = 200

const src = PNG.sync.read(readFileSync(SOURCE))
const { width, height, data } = src
const at = (x, y) => (width * y + x) << 2

const isNearWhite = (i, floor) =>
  data[i] >= floor && data[i + 1] >= floor && data[i + 2] >= floor

// Flood fill inward from the borders so white *inside* the emblem is kept.
const outside = new Uint8Array(width * height)
const stack = []
for (let x = 0; x < width; x++) {
  stack.push([x, 0], [x, height - 1])
}
for (let y = 0; y < height; y++) {
  stack.push([0, y], [width - 1, y])
}
while (stack.length) {
  const [x, y] = stack.pop()
  if (x < 0 || y < 0 || x >= width || y >= height) continue
  const flat = width * y + x
  if (outside[flat]) continue
  if (!isNearWhite(at(x, y), WHITE_FLOOR)) continue
  outside[flat] = 1
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
}

// Fade the anti-aliased rim so no white halo is left around the strokes.
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const flat = width * y + x
    const i = at(x, y)
    if (outside[flat]) {
      data[i + 3] = 0
      continue
    }
    const touchesOutside =
      (x > 0 && outside[flat - 1]) ||
      (x < width - 1 && outside[flat + 1]) ||
      (y > 0 && outside[flat - width]) ||
      (y < height - 1 && outside[flat + width])
    if (!touchesOutside) continue
    const lum = Math.min(data[i], data[i + 1], data[i + 2])
    if (lum <= EDGE_SOFT_FLOOR) continue
    const span = WHITE_FLOOR - EDGE_SOFT_FLOOR
    data[i + 3] = Math.round(((WHITE_FLOOR - lum) / span) * 255)
  }
}

const rowInk = new Array(height).fill(0)
let minX = width
let maxX = -1
let minY = height
let maxY = -1
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[at(x, y) + 3] <= 8) continue
    rowInk[y]++
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
}

function crop(x0, y0, x1, y1) {
  const out = new PNG({ width: x1 - x0 + 1, height: y1 - y0 + 1 })
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const from = at(x, y)
      const to = (out.width * (y - y0) + (x - x0)) << 2
      out.data[to] = data[from]
      out.data[to + 1] = data[from + 1]
      out.data[to + 2] = data[from + 2]
      out.data[to + 3] = data[from + 3]
    }
  }
  return out
}

writeFileSync(FULL_OUT, PNG.sync.write(crop(minX, minY, maxX, maxY)))

// The emblem sits above the widest blank band, the wordmark below it.
let gapStart = -1
let gapLen = 0
let bestStart = -1
let bestLen = 0
for (let y = minY; y <= maxY; y++) {
  if (rowInk[y] === 0) {
    if (gapStart === -1) gapStart = y
    gapLen++
    if (gapLen > bestLen) {
      bestLen = gapLen
      bestStart = gapStart
    }
  } else {
    gapStart = -1
    gapLen = 0
  }
}

const markBottom = bestStart > minY ? bestStart - 1 : maxY
let markMinX = width
let markMaxX = -1
for (let y = minY; y <= markBottom; y++) {
  for (let x = 0; x < width; x++) {
    if (data[at(x, y) + 3] <= 8) continue
    if (x < markMinX) markMinX = x
    if (x > markMaxX) markMaxX = x
  }
}
writeFileSync(MARK_OUT, PNG.sync.write(crop(markMinX, minY, markMaxX, markBottom)))

const counts = new Map()
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] < 200) continue
  const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
  if (lum > 225) continue
  const key = `${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`
  counts.set(key, (counts.get(key) ?? 0) + 1)
}
const top = [...counts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([key, count]) => {
    const [r, g, b] = key.split(',').map((v) => (Number(v) << 4) + 8)
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
    return `${hex} (${count})`
  })

console.log(`full  ${maxX - minX + 1}x${maxY - minY + 1} -> ${FULL_OUT}`)
console.log(`mark  ${markMaxX - markMinX + 1}x${markBottom - minY + 1} -> ${MARK_OUT}`)
console.log(`colors ${top.join(', ')}`)
