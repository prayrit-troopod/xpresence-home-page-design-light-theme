/*
  XPresence bag drawer for the static design pages. Items persist in localStorage, so the bag carries
  across the home, collection and product pages. Pages call XPBag.add(nameOrKey, qty) when an Add to bag
  is pressed; any link to "#bag" opens the drawer. The Shopify theme uses the same markup and styles,
  backed by the real cart (assets/xp-cart.js there).
*/
(function () {
  const CATALOG = {
    focus: { name: 'Focus', spec: '30 ml Eau de Parfum', price: 2000, img: 'assets/focus-bottle.webp' },
    warmth: { name: 'Warmth', spec: '30 ml Eau de Parfum', price: 2000, img: 'assets/warmth-bottle.webp' },
    power: { name: 'Power', spec: '30 ml Eau de Parfum', price: 2000, img: 'assets/power-bottle.webp' },
    set: { name: 'Discovery Set', spec: '3 × 10 ml, Focus, Warmth and Power', price: 999, img: 'assets/discovery-creative-9x16.webp' }
  };
  const keyOf = v => {
    const s = String(v || '').toLowerCase();
    if (s.includes('discovery') || s === 'ds' || s === 'set') return 'set';
    return ['focus', 'warmth', 'power'].find(k => s.includes(k)) || null;
  };
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const STORE = 'xp-bag';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(STORE) || '[]').filter(i => CATALOG[i.k] && i.q > 0); } catch (e) { items = []; }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(items)); } catch (e) {} };
  const count = () => items.reduce((n, i) => n + i.q, 0);

  const icon = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';
  document.body.insertAdjacentHTML('beforeend',
    '<div class="xb-scrim" data-xb-close data-lenis-prevent></div>' +
    '<aside class="xb" id="xpBag" role="dialog" aria-modal="true" aria-labelledby="xbTitle" aria-hidden="true" data-lenis-prevent>' +
      '<div class="xb-head"><h2 class="xb-title" id="xbTitle">Your bag<small id="xbCount"></small></h2>' +
      '<button class="xb-x" type="button" data-xb-close aria-label="Close bag">' + icon + '</button></div>' +
      '<div class="xb-body" id="xbBody"></div>' +
      '<div class="xb-foot" id="xbFoot"></div>' +
    '</aside>');
  const drawer = document.getElementById('xpBag');
  let lastFocus = null;

  function render() {
    const body = document.getElementById('xbBody'), foot = document.getElementById('xbFoot');
    const n = count();
    document.querySelectorAll('#bagCount, [data-xp-bag-count]').forEach(el => { el.textContent = n; });
    document.getElementById('xbCount').textContent = n ? n + (n === 1 ? ' item' : ' items') : '';
    if (!items.length) {
      body.innerHTML = '<div class="xb-empty"><p>Your bag is empty.</p>Not sure where to start? The Discovery Set holds all three.</div>' + upsell();
      foot.innerHTML = '<a class="xb-go" href="collection.html">Shop the collection</a>';
      return;
    }
    body.innerHTML = '<ul class="xb-items">' + items.map((it, i) => {
      const c = CATALOG[it.k];
      return '<li class="xb-item"><span class="xb-img" style="background-image:url(' + c.img + ')"></span>' +
        '<div><p class="xb-name">' + c.name + '</p><p class="xb-spec">' + c.spec + '</p>' +
        '<span class="xb-qty"><button type="button" data-xb-q="' + i + '" data-d="-1" aria-label="One fewer ' + c.name + '">−</button>' +
        '<output>' + it.q + '</output><button type="button" data-xb-q="' + i + '" data-d="1" aria-label="One more ' + c.name + '">+</button></span></div>' +
        '<div class="xb-right"><span class="xb-price">' + inr(c.price * it.q) + '</span>' +
        '<button class="xb-rm" type="button" data-xb-rm="' + i + '">Remove</button></div></li>';
    }).join('') + '</ul>' + (items.some(i => i.k === 'set') ? '' : upsell());
    const total = items.reduce((s, i) => s + CATALOG[i.k].price * i.q, 0);
    foot.innerHTML = '<div class="xb-row"><span>Subtotal</span><b>' + inr(total) + '</b></div>' +
      '<p class="xb-note">Taxes included. Shipping and discount codes at checkout.</p>' +
      '<a class="xb-go" href="#checkout" data-xb-checkout>Checkout</a>' +
      '<button class="xb-cont" type="button" data-xb-close>Continue shopping</button>';
  }
  function upsell() {
    const c = CATALOG.set;
    return '<div class="xb-up"><span class="xb-img" style="background-image:url(' + c.img + ')"></span>' +
      '<p><b>Not sure yet? Try all three.</b>Discovery Set, 3 × 10 ml, ' + inr(c.price) + '</p>' +
      '<button class="xb-mini" type="button" data-xb-add="set">Add</button></div>';
  }

  function open() {
    lastFocus = document.activeElement;
    render();
    document.documentElement.classList.add('xb-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (window.lenis && window.lenis.stop) window.lenis.stop();
    setTimeout(() => drawer.querySelector('.xb-x').focus(), 50);
  }
  function close() {
    document.documentElement.classList.remove('xb-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (window.lenis && window.lenis.start) window.lenis.start();
    if (lastFocus) lastFocus.focus();
  }
  function add(what, qty) {
    const k = keyOf(what);
    if (!k) return;
    const q = Math.max(1, Number(qty) || 1);
    const found = items.find(i => i.k === k);
    if (found) found.q += q; else items.push({ k, q });
    save(); render();
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('a[href="#bag"], [data-xb-open]');
    if (opener) { e.preventDefault(); e.stopPropagation(); open(); return; }
    if (!drawer.contains(e.target) && !e.target.closest('.xb-scrim')) return;
    if (e.target.closest('[data-xb-close]')) { e.preventDefault(); close(); return; }
    const q = e.target.closest('[data-xb-q]');
    if (q) { const it = items[+q.dataset.xbQ]; it.q = Math.max(0, Math.min(9, it.q + Number(q.dataset.d))); items = items.filter(i => i.q > 0); save(); render(); return; }
    const rm = e.target.closest('[data-xb-rm]');
    if (rm) { items.splice(+rm.dataset.xbRm, 1); save(); render(); return; }
    const up = e.target.closest('[data-xb-add]');
    if (up) { add(up.dataset.xbAdd, 1); return; }
    if (e.target.closest('[data-xb-checkout]')) { e.preventDefault(); e.target.closest('[data-xb-checkout]').textContent = 'Checkout opens in the live store'; }
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.documentElement.classList.contains('xb-open')) close();
    if (e.key === 'Tab' && document.documentElement.classList.contains('xb-open')) {
      const f = [...drawer.querySelectorAll('button, a[href], output')].filter(x => x.offsetParent && x.tagName !== 'OUTPUT');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  window.XPBag = { add, open, close, count };
  render();
})();
