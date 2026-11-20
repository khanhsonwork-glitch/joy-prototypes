// Store credit at checkout — Quick Redeem block, customer side (PRD B/C/D/G/H).
// Real text matches the Joy checkout extension pattern (extensions/redeem-checkout-extension);
// amounts recompute live. This file is the whole interactive layer for the static demo —
// no server calls, so "Apply" etc. just update local state and re-render.
(function () {
  'use strict';

  var ORDER_SUBTOTAL = 792.00; // 4 line items, matches PRD §F worked example
  var ITEM_COUNT = 4;
  var CURRENCY = '$';

  // One scenario per deep link (#/<state>). Each sets balance, held funds elsewhere, merchant cap,
  // and whether a credit code is already applied — the inputs the real block reads (PRD §B/§D).
  var SCENARIOS = {
    'before': {
      label: 'Today (no store credit)', help: 'Current production Quick Redeem block',
      loggedIn: true, balance: 100, held: 0, cap: null, applied: null, conflict: null, expired: false, before: true,
    },
    'default': {
      label: 'Default', help: 'Balance $100, input defaults to the max usable',
      loggedIn: true, balance: 100, held: 0, cap: null, applied: null, conflict: null, expired: false,
    },
    'max-exceeded': {
      label: 'Over the per-order cap', help: 'Merchant cap $50, customer types $100',
      loggedIn: true, balance: 100, held: 0, cap: 50, applied: null, conflict: null, expired: false,
      typedOver: 100,
    },
    'applied': {
      label: 'Applied', help: '$50 applied, split $12.50 × 4 items',
      loggedIn: true, balance: 100, held: 0, cap: null, applied: 50, conflict: null, expired: false,
    },
    'change-amount': {
      label: 'Change amount (editing)', help: 'Applied $50, Change amount open',
      loggedIn: true, balance: 100, held: 0, cap: null, applied: 50, conflict: null, expired: false,
      editing: true,
    },
    'conflict': {
      label: 'Conflicts with order discount', help: 'Named order-level code blocks it',
      loggedIn: true, balance: 100, held: 0, cap: null, applied: null, conflict: 'WELCOME10', expired: false,
    },
    'expired': {
      label: 'Credit expired', help: '30-min code lapsed before payment',
      loggedIn: true, balance: 100, held: 0, cap: null, applied: null, conflict: null, expired: true,
    },
    'guest': {
      label: 'Not logged in', help: 'Shows the sign-in prompt, like coupons today',
      loggedIn: false, balance: 0, held: 0, cap: null, applied: null, conflict: null, expired: false,
    },
    'held': {
      label: 'Held in another tab', help: 'Balance $100, $70 held elsewhere → max $30',
      loggedIn: true, balance: 100, held: 70, cap: null, applied: null, conflict: null, expired: false,
    },
  };
  var ORDER = ['before', 'default', 'max-exceeded', 'applied', 'change-amount', 'conflict', 'expired', 'guest', 'held'];

  function readState() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    return SCENARIOS[h] ? h : 'default';
  }

  function fmt(n) {
    return CURRENCY + n.toFixed(2);
  }

  function available(s) {
    return Math.max(0, s.balance - s.held);
  }

  function maxUsable(s) {
    var remaining = ORDER_SUBTOTAL; // no other discounts stacked in this demo besides the order-level conflict
    var caps = [available(s), remaining];
    if (s.cap != null) caps.push(s.cap);
    return Math.min.apply(Math, caps);
  }

  var liveApplied = null; // amount currently applied, mutated by clicks during this session
  var liveEditing = false;
  var liveError = '';
  var removedOverride = false;

  function render() {
    var key = readState();
    var s = SCENARIOS[key];
    var applied = removedOverride ? null : (liveApplied !== null ? liveApplied : s.applied);
    var editing = liveEditing || (!!s.editing && !removedOverride);

    document.getElementById('contactValue').textContent = s.loggedIn ? 'ava@example.com' : 'ava@example.com (guest checkout)';

    var joyBox = document.getElementById('joyBox');
    var discountArea = document.getElementById('discountArea');
    var totalsArea = document.getElementById('totalsArea');

    // Order-level discount code field above the Joy block — shows the conflicting code when relevant.
    if (s.conflict) {
      discountArea.innerHTML =
        '<div class="co-applied-code"><span class="co-applied-code__tag">🏷 ' + s.conflict + '</span>' +
        '<button class="co-x" title="Remove">✕</button></div>';
    } else {
      discountArea.innerHTML =
        '<div class="co-discount"><input type="text" placeholder="Discount code or gift card" id="discountInput">' +
        '<button type="button" id="discountApplyBtn">Apply</button></div>';
    }

    var html = '';
    if (s.before) {
      // PRD baseline: today's Quick Redeem shows only points redeem, no store credit option.
      html += '<div class="joy-heading">Quick Redeem</div>';
      html += '<div class="joy-label">Your points</div><div class="joy-balance">2,400 points</div>';
      html += '<div class="joy-input-row"><input type="number" min="0" id="pointsInput" value="2400" style="max-width:120px;" disabled>' +
        '<button class="joy-btn" disabled>Redeem for $24.00 off</button></div>';
      html += '<div class="joy-note">Store credit can\u2019t be used at checkout yet — only points redemption is available here.</div>';
    } else if (!s.loggedIn) {
      // PRD §A/§H: guest sees a sign-in prompt, same slot as the coupon prompt today.
      html += '<div class="joy-heading">Quick Redeem</div>';
      html += '<div class="joy-banner joy-banner--info">💬 Don\u2019t miss out — ' +
        '<a href="#">sign in</a> to earn and redeem rewards on this order.</div>';
    } else if (s.conflict) {
      html += '<div class="joy-heading">Quick Redeem</div>';
      html += '<div class="joy-label">Your balance</div><div class="joy-balance">' + fmt(available(s)) + '</div>';
      html += '<div class="joy-banner joy-banner--crit">⚠ Store credit can\u2019t be combined with <b>' + s.conflict +
        '</b>. Remove ' + s.conflict + ', or don\u2019t use store credit on this order.</div>';
    } else if (s.expired && !applied) {
      html += '<div class="joy-heading">Quick Redeem</div>';
      html += '<div class="joy-label">Your balance</div><div class="joy-balance">' + fmt(available(s)) + '</div>';
      html += '<div class="joy-banner joy-banner--warn">⏱ Your store credit code expired before checkout finished. <button class="joy-btn--plain" id="reapplyBtn">Apply store credit</button></div>';
    } else if (applied) {
      var perItem = applied / ITEM_COUNT;
      html += '<div class="joy-heading">Quick Redeem</div>';
      html += '<div class="co-applied-code"><span class="co-applied-code__tag">💳 JOYCR-' + Math.round(applied * 100) + '</span>' +
        '<button class="co-x" id="removeCreditBtn" title="Remove">✕</button></div>';
      html += '<div class="joy-note" style="margin-top:8px;color:#444;">' + fmt(applied) + ' store credit will be deducted when you place your order.</div>';
      html += '<div style="margin-top:10px;"><button class="joy-btn--plain" id="changeAmountBtn">Change amount</button></div>';
      if (editing) {
        html += '<div class="joy-input-row"><span class="prefix">' + CURRENCY + '</span>' +
          '<input type="number" min="0" step="0.01" id="amountInput" value="' + applied.toFixed(2) + '">' +
          '<button class="joy-btn" id="applyBtn">Apply</button></div>';
        html += '<div id="amountError" class="joy-error">' + (liveError || '') + '</div>';
        html += '<div class="joy-note">Max ' + fmt(maxUsable(s)) + ' for this order.</div>';
      }
      html += '<div class="joy-note">Because credit is applied as a discount, tax may be calculated on the amount after credit.</div>';
    } else {
      var maxAmt = maxUsable(s);
      var preErr = typeof s.typedOver === 'number' && !liveEditing && liveApplied === null && !removedOverride;
      var effectiveError = liveError || (preErr ? 'Maximum is ' + fmt(maxAmt) + '.' : '');
      var startVal = preErr ? s.typedOver : ((liveEditing && liveError) ? (typeof s.typedOver === 'number' ? s.typedOver : maxAmt) : maxAmt);
      html += '<div class="joy-heading">Quick Redeem</div>';
      html += '<div class="joy-row"><div><div class="joy-label">Your balance</div><div class="joy-balance">' + fmt(available(s)) + '</div></div></div>';
      if (s.held > 0) {
        html += '<div class="joy-note">' + fmt(s.held) + ' is held by store credit applied in another tab or order.</div>';
      }
      html += '<div class="joy-input-row"><span class="prefix">' + CURRENCY + '</span>' +
        '<input type="number" min="0" step="0.01" id="amountInput" class="' + (effectiveError ? 'invalid' : '') + '" value="' +
        (startVal != null ? startVal.toFixed(2) : '') + '"><button class="joy-btn" id="applyBtn">Apply</button></div>';
      html += '<div id="amountError" class="joy-error">' + (effectiveError || '') + '</div>';
      html += '<div class="joy-note">Max ' + fmt(maxAmt) + ' for this order. Leave as is to use the most you can.</div>';
      if (s.cap != null) {
        html += '<div class="joy-note">Merchant set a per-order cap of ' + fmt(s.cap) + '.</div>';
      }
    }
    joyBox.innerHTML = html;

    var discount = applied && !s.conflict ? applied : 0;
    var total = ORDER_SUBTOTAL - discount;
    var rows =
      '<div class="co-totals__row"><span>Subtotal · ' + ITEM_COUNT + ' items</span><span>' + fmt(ORDER_SUBTOTAL) + '</span></div>' +
      '<div class="co-totals__row"><span>Shipping</span><span>Free</span></div>';
    if (discount > 0) {
      rows += '<div class="co-totals__row co-totals__row--credit"><span>Store credit</span><span>-' + fmt(discount) + '</span></div>';
    }
    rows += '<div class="co-totals__row co-totals__row--total"><span>Total</span><span>' + fmt(total) + ' <span class="co-totals__currency">USD</span></span></div>';
    totalsArea.innerHTML = rows;

    wire(s, key);
    renderProtoPanel(key);
  }

  function wire(s, key) {
    var applyBtn = document.getElementById('applyBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        var input = document.getElementById('amountInput');
        var typed = parseFloat(input.value);
        var maxAmt = maxUsable(s);
        if (isNaN(typed) || typed < 0.01) {
          liveError = 'Enter an amount of at least $0.01.';
          render();
          return;
        }
        if (typed > maxAmt) {
          liveError = 'Maximum is ' + fmt(maxAmt) + '.';
          render();
          return;
        }
        liveError = '';
        liveApplied = Math.round(typed * 100) / 100;
        liveEditing = false;
        render();
      });
    }
    var changeBtn = document.getElementById('changeAmountBtn');
    if (changeBtn) {
      changeBtn.addEventListener('click', function () {
        liveEditing = true;
        liveError = '';
        render();
      });
    }
    var removeBtn = document.getElementById('removeCreditBtn');
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        liveApplied = null;
        removedOverride = true;
        liveEditing = false;
        render();
      });
    }
    var reapplyBtn = document.getElementById('reapplyBtn');
    if (reapplyBtn) {
      reapplyBtn.addEventListener('click', function () {
        liveApplied = maxUsable(s);
        render();
      });
    }
  }

  function renderProtoPanel(current) {
    var list = document.getElementById('stateList');
    list.innerHTML = ORDER.map(function (key) {
      var sc = SCENARIOS[key];
      var checked = key === current ? 'checked' : '';
      return '<label><input type="radio" name="proto-state" value="' + key + '" ' + checked + '> <b>' + sc.label + '</b>' +
        '<small>' + sc.help + '</small></label>';
    }).join('');
    Array.prototype.forEach.call(list.querySelectorAll('input[type=radio]'), function (r) {
      r.addEventListener('change', function () {
        liveApplied = null;
        liveEditing = false;
        liveError = '';
        removedOverride = false;
        location.hash = '/' + r.value;
      });
    });
  }

  document.getElementById('protoToggle').addEventListener('click', function () {
    document.getElementById('protoPanel').classList.toggle('open');
  });

  window.addEventListener('hashchange', function () {
    liveApplied = null;
    liveEditing = false;
    liveError = '';
    removedOverride = false;
    render();
  });

  render();
})();
