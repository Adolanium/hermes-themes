// The star atlas: every pack a constellation, every god a star.
;(() => {
  const { packs, total } = window.ATLAS
  const NS = 'http://www.w3.org/2000/svg'
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const el = (tag, attrs = {}, kids = []) => {
    const n = tag.startsWith('svg:') ? document.createElementNS(NS, tag.slice(4)) : document.createElement(tag)
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') n.textContent = v
      else if (k === 'style') Object.assign(n.style, v)
      else n.setAttribute(k, v)
    }
    for (const c of kids) n.append(c)
    return n
  }
  const star = () => el('svg:svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [el('svg:path', { d: 'M12 1.5 13.6 10.4 22.5 12 13.6 13.6 12 22.5 10.4 13.6 1.5 12 10.4 10.4Z' })])
  const arrow = () => el('svg:svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true' }, [el('svg:path', { d: 'M3 8h10m0 0-4-4m4 4-4 4' })])

  document.getElementById('total').textContent = total
  document.documentElement.style.setProperty('--n', packs.length)

  // Seeded positions, so every visit shows the same sky.
  const seeded = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296 }

  // Stars spread over the figure: a jittered ring of rings, kept apart from each other.
  function layout(pack) {
    const rnd = seeded(pack.name)
    const pts = []
    const n = pack.gods.length
    for (let i = 0; i < n; i++) {
      let best = null
      for (let tries = 0; tries < 40; tries++) {
        const p = { x: 0.08 + rnd() * 0.84, y: 0.06 + rnd() * 0.86 }
        const d = Math.min(...pts.map(q => Math.hypot(q.x - p.x, q.y - p.y)), 9)
        if (!best || d > best.d) best = { ...p, d }
      }
      pts.push({ x: best.x, y: best.y })
    }
    // The lead god sits at the top, like the brightest star of the figure.
    const top = pts.reduce((a, p, i) => (p.y < pts[a].y ? i : a), 0)
    const li = pack.gods.findIndex(g => g.name === pack.lead)
    ;[pts[top], pts[li]] = [pts[li], pts[top]]
    // Lines: a minimum spanning tree, plus one closing edge for a figure-like shape.
    const edges = [], inTree = new Set([0])
    while (inTree.size < n) {
      let b = null
      for (const i of inTree) for (let j = 0; j < n; j++) if (!inTree.has(j)) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
        if (!b || d < b.d) b = { i, j, d }
      }
      edges.push([b.i, b.j]); inTree.add(b.j)
    }
    return { pts, edges }
  }

  // ── Build the constellations ──
  const atlas = document.getElementById('atlas')
  const peek = document.getElementById('peek')
  const faces = []
  packs.forEach((pack, pi) => {
    if (pack.font) faces.push(`@font-face{font-family:'pack-${pack.name}';src:url(assets/fonts/${pack.font.file}) format('woff2');font-weight:${pack.font.weight};font-display:swap}`)
    const { pts, edges } = layout(pack)
    const box = el('div', { class: 'sky-box' })
    const fig = el('img', { class: `figure${pack.pixel ? ' pixel' : ''}`, src: `assets/${pack.figure}`, alt: `${pack.label}: ${pack.gods[0].label}, the pack's lead god`, loading: 'eager' })
    fig.style.setProperty('--fw', `${Math.round(Math.min(1, pack.figureAspect / 1.4) * 100)}%`)
    // Percent coordinates keep circles round and labels at their real pixel size at any width.
    const svg = el('svg:svg', { class: 'stars', role: 'list', 'aria-label': `${pack.label} gods` })
    const P = p => [`${(p.x * 100).toFixed(2)}%`, `${(p.y * 100).toFixed(2)}%`]
    for (const [a, b] of edges) {
      const [x1, y1] = P(pts[a]), [x2, y2] = P(pts[b])
      const line = el('svg:line', { x1, y1, x2, y2 })
      line.style.setProperty('--len', Math.round(Math.hypot(pts[b].x - pts[a].x, (pts[b].y - pts[a].y) * 0.8) * 640))
      svg.append(line)
    }
    pack.gods.forEach((god, gi) => {
      const [x, y] = P(pts[gi])
      const lead = god.name === pack.lead
      const named = pack.labels.includes(god.name)
      const g = el('svg:a', { class: `star${named ? ' named' : ''}`, href: `${pack.site}#${god.name}`, role: 'listitem', 'aria-label': `${god.label}: ${god.description}` })
      g.append(
        el('svg:circle', { class: 'hit', cx: x, cy: y, r: 22 }),
        el('svg:circle', { class: `halo${reduce ? '' : ' twinkle'}`, cx: x, cy: y, r: lead ? 10 : 7, style: { animationDelay: `${(gi * 0.37) % 3}s` } }),
        el('svg:circle', { class: 'core', cx: x, cy: y, r: lead ? 3.6 : 2.4 }),
        // Labels on the right-hand stars read leftward so they never run off the column.
        el('svg:text', pts[gi].x > 0.62 ? { x, y, dx: -12, dy: -9, 'text-anchor': 'end', text: god.label } : { x, y, dx: 12, dy: -9, text: god.label }),
      )
      g.addEventListener('mouseenter', () => showPeek(pack, god, g))
      g.addEventListener('focus', () => showPeek(pack, god, g))
      g.addEventListener('mouseleave', hidePeek)
      g.addEventListener('blur', hidePeek)
      svg.append(g)
    })
    box.append(fig, svg)

    const plate = el('div', { class: 'plate' }, [
      el('h2', { text: pack.label.toUpperCase(), style: pack.font ? { fontFamily: `'pack-${pack.name}', serif`, fontWeight: pack.font.weight } : { fontFamily: 'Bodoni, serif', fontWeight: 800 } }),
      el('div', { class: 'rule' }, [star()]),
      el('p', { class: 'count', text: `${pack.count} ${pack.people} gods` }),
      el('p', { class: 'material', text: pack.material }),
      el('a', { class: 'explore', href: pack.site, text: `Explore ${pack.label} ` }, [arrow()]),
    ])
    const section = el('article', { class: 'pack', 'aria-label': pack.label }, [box, plate])
    section.style.setProperty('--c', pack.color)
    atlas.append(section)

    // The index and install commands below the fold.
    const list = el('ul', {}, pack.gods.map(g => el('li', {}, [el('a', { href: `${pack.site}#${g.name}`, text: g.label })])))
    const col = el('div', {}, [el('h3', { text: pack.label }), list])
    col.style.setProperty('--c', pack.color)
    document.getElementById('index').append(col)
    document.getElementById('cmds').append(el('li', {}, [el('code', { text: pack.install })]))
  })
  document.head.append(el('style', { text: faces.join('\n') }))

  function showPeek(pack, god, anchor) {
    document.getElementById('peek-title').textContent = `${god.label} / ${pack.label}`
    const img = document.getElementById('peek-img')
    img.src = `assets/shots/${god.name}.webp`
    img.alt = `Hermes Desktop wearing ${god.label}`
    document.getElementById('peek-desc').textContent = god.description + '.'
    const r = anchor.getBoundingClientRect()
    const left = Math.min(innerWidth - 316, Math.max(16, r.right + 16))
    const top = Math.min(innerHeight - 290, Math.max(16, r.top - 40))
    peek.style.left = `${r.right + 316 > innerWidth ? Math.max(16, r.left - 316) : left}px`
    peek.style.top = `${top}px`
    peek.classList.add('on')
  }
  function hidePeek() { peek.classList.remove('on') }
  addEventListener('scroll', hidePeek, { passive: true })

  // ── The chart behind: rings, a graticule and faint constellations still to be named ──
  const chart = document.getElementById('chart')
  function drawChart() {
    chart.innerHTML = ''
    const W = innerWidth, H = innerHeight
    chart.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const cx = W / 2, cy = H * 0.42
    for (const r of [0.22, 0.34, 0.48, 0.7]) chart.append(el('svg:circle', { cx, cy, r: r * Math.max(W, H), class: r > 0.6 ? 'faint' : '' }))
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, R = Math.max(W, H)
      chart.append(el('svg:line', { x1: cx + Math.cos(a) * R * 0.22, y1: cy + Math.sin(a) * R * 0.22, x2: cx + Math.cos(a) * R, y2: cy + Math.sin(a) * R, class: 'faint' }))
    }
    // Unnamed constellations at the edges: packs still to come.
    const rnd = seeded('horizon')
    for (const [ox, oy] of [[0.04, 0.2], [0.96, 0.62], [0.06, 0.86], [0.93, 0.14]]) {
      const pts = Array.from({ length: 5 }, () => [ox * W + (rnd() - 0.5) * 160, oy * H + (rnd() - 0.5) * 120])
      chart.append(el('svg:path', { d: 'M' + pts.map(p => p.join(',')).join(' L'), class: 'faint' }))
    }
  }

  // ── Twinkling field of small stars ──
  const sky = document.getElementById('sky'), ctx = sky.getContext('2d')
  let stars = []
  function sizeSky() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    sky.width = innerWidth * dpr; sky.height = innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const rnd = seeded('field')
    stars = Array.from({ length: Math.round((innerWidth * innerHeight) / 5200) }, () => ({ x: rnd() * innerWidth, y: rnd() * innerHeight, r: rnd() < 0.08 ? 1.4 : 0.6 + rnd() * 0.5, p: rnd() * 6.28, s: 0.6 + rnd() * 1.4 }))
    drawChart()
  }
  function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    for (const s of stars) {
      const a = reduce ? 0.7 : 0.45 + 0.45 * Math.sin(t / 1000 * s.s + s.p)
      ctx.globalAlpha = a
      ctx.fillStyle = s.r > 1 ? '#fff4d8' : '#e8e4ff'
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill()
    }
    if (!reduce && !document.hidden) requestAnimationFrame(frame)
  }
  sizeSky(); addEventListener('resize', sizeSky)
  document.addEventListener('visibilitychange', () => !document.hidden && !reduce && requestAnimationFrame(frame))
  requestAnimationFrame(frame)
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')))
})()
