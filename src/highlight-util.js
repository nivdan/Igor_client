// TODO: lint
/* Helper function for eventsProxyMouse */
function clone(e) {
  let opts = Object.assign({}, e, {bubbles: false})
  try {
    return new MouseEvent(e.type, opts)
  } catch(err) { // compat: webkit
    let copy = document.createEvent('MouseEvents')
    copy.initMouseEvent(e.type, false, opts.cancelable, opts.view,
                        opts.detail, opts.screenX, opts.screenY,
                        opts.clientX, opts.clientY, opts.ctrlKey,
                        opts.altKey, opts.shiftKey, opts.metaKey,
                        opts.button, opts.relatedTarget)
    return copy
  }
}

/* Helper function for eventsProxyMouse */
function contains(item, x, y) {
  function rectContains(r, x, y) {
    let bottom = r.top + r.height
    let right = r.left + r.width
    return (r.top <= y && r.left <= x && bottom > y && right > x)
  }

  function getClientRects(item) {
    let rects = []
    let el = item.firstChild
    while (el) {
      rects.push(el.getBoundingClientRect())
      el = el.nextSibling
    }
    return rects
  }

  // Check overall bounding box first
  let rect = item.getBoundingClientRect()
  if (!rectContains(rect, x, y)) {
    return false
  }

  // Then continue to check each child rect
  let rects = getClientRects(item)
  for (let rect of rects) {
    if (rectContains(rect, x, y)) return true
  }
  return false
}

/* Helper function for Highlights.constructor */
function eventsProxyMouse(src, target) {
  function dispatch(e) {
    for (let child of target.childNodes) {
      if (
        child.classList
        && child.classList.contains('nb-highlight')
        && contains(child, e.clientX, e.clientY)
      ) {
        // We only dispatch the cloned event to the first matching highlight
        child.dispatchEvent(clone(e))
        break
      }
    }
  }
  //TODO: add hover event
  for (let eventType of ['mouseup', 'mousedown', 'click']) {
    src.addEventListener(eventType, (e) => dispatch(e), false)
  }
}

export {
  eventsProxyMouse
}