const siteTree = [
  {
    group: 'Originals',
    children: [
      { key: 'original-classic-site', title: 'Original classic', note: 'Split classic layout', path: 'sites/original-classic-site/index.html' },
      { key: 'original-alternate-site', title: 'Original alternate', note: 'Split alternate layout', path: 'sites/original-alternate-site/index.html' },
      { key: 'immersive-concept', title: 'Immersive concept', note: 'Three.js build', path: 'sites/immersive-concept/index.html' },
      { key: 'live-site', title: 'Live site', note: 'Refined one-page version', path: 'sites/live-site/index.html' },
    ],
  },
  {
    group: 'Concepts',
    children: [
      { key: 'authority-site', title: 'Authority', note: 'Personal authority direction', path: 'sites/authority-site/index.html' },
      { key: 'keynote-site', title: 'Keynote', note: 'Consulting + keynote direction', path: 'sites/keynote-site/index.html' },
      { key: 'narrative-site', title: 'Narrative', note: 'Story-led one-page flow', path: 'sites/narrative-site/index.html' },
    ],
  },
  {
    group: 'Concepts v2',
    children: [
      { key: 'authority-site-v2', title: 'Authority v2', note: 'Updated logo + palette', path: 'sites/authority-site-v2/index.html' },
      { key: 'keynote-site-v2', title: 'Keynote v2', note: 'Updated logo + palette', path: 'sites/keynote-site-v2/index.html' },
      { key: 'narrative-site-v2', title: 'Narrative v2', note: 'Updated logo + palette', path: 'sites/narrative-site-v2/index.html' },
    ],
  },
]

const treeRoot = document.querySelector('#tree-root')
const frame = document.querySelector('#site-frame')
const title = document.querySelector('#current-title')
const currentPath = document.querySelector('#current-path')
const openLink = document.querySelector('#open-link')
const editToggle = document.querySelector('#edit-toggle')
const saveButton = document.querySelector('#save-button')
const resetButton = document.querySelector('#reset-button')

let currentSite = null

renderTree()
selectSite(siteTree[0].children[0])

editToggle.addEventListener('change', () => {
  if (!frame.contentDocument) return
  if (editToggle.checked) enableEditing(frame.contentDocument)
  else disableEditing(frame.contentDocument)
})

saveButton.addEventListener('click', () => {
  if (!currentSite || !frame.contentDocument) return
  saveEdits(currentSite.key, frame.contentDocument)
})

resetButton.addEventListener('click', () => {
  if (!currentSite) return
  window.localStorage.removeItem(storageKey(currentSite.key))
  frame.src = currentSite.path
})

frame.addEventListener('load', () => {
  if (!frame.contentDocument || !currentSite) return
  applyStoredEdits(currentSite.key, frame.contentDocument)
  if (editToggle.checked) enableEditing(frame.contentDocument)
})

function renderTree() {
  treeRoot.innerHTML = siteTree.map((group) => {
    const items = group.children.map((site) => {
      return `
        <li class="tree-item">
          <button class="tree-button" data-site-key="${site.key}">
            ${site.title}
            <small>${site.note}</small>
          </button>
        </li>
      `
    }).join('')

    return `
      <section class="tree-group">
        <p class="tree-group-title">${group.group}</p>
        <ul class="tree-list">${items}</ul>
      </section>
    `
  }).join('')

  treeRoot.querySelectorAll('[data-site-key]').forEach((button) => {
    button.addEventListener('click', () => {
      const site = findSite(button.dataset.siteKey)
      if (site) selectSite(site)
    })
  })
}

function selectSite(site) {
  currentSite = site
  title.textContent = site.title
  currentPath.textContent = site.path
  openLink.href = site.path
  frame.src = site.path

  treeRoot.querySelectorAll('.tree-button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.siteKey === site.key)
  })
}

function findSite(key) {
  for (const group of siteTree) {
    for (const site of group.children) {
      if (site.key === key) return site
    }
  }
  return null
}

function enableEditing(doc) {
  const editableElements = getEditableElements(doc)
  editableElements.forEach((element) => {
    element.setAttribute('contenteditable', 'true')
    element.dataset.hubEditId = getNodePath(element)
    element.style.outline = '2px dashed rgba(34, 143, 171, 0.5)'
    element.style.outlineOffset = '4px'
    element.style.cursor = 'text'
  })
}

function disableEditing(doc) {
  getEditableElements(doc).forEach((element) => {
    element.removeAttribute('contenteditable')
    element.style.outline = ''
    element.style.outlineOffset = ''
    element.style.cursor = ''
  })
}

function saveEdits(siteKey, doc) {
  const payload = {}
  getEditableElements(doc).forEach((element) => {
    const id = element.dataset.hubEditId || getNodePath(element)
    payload[id] = { html: element.innerHTML }
  })
  window.localStorage.setItem(storageKey(siteKey), JSON.stringify(payload))
}

function applyStoredEdits(siteKey, doc) {
  const raw = window.localStorage.getItem(storageKey(siteKey))
  if (!raw) return

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return
  }

  getEditableElements(doc).forEach((element) => {
    const id = getNodePath(element)
    if (payload[id]) {
      element.innerHTML = payload[id].html
    }
  })
}

function getEditableElements(doc) {
  const selector = 'h1,h2,h3,p,li,blockquote,a,span,strong'
  return Array.from(doc.body.querySelectorAll(selector)).filter((element) => {
    if (element.closest('script,style,noscript,svg')) return false
    if (element.querySelector('img,video,canvas,iframe')) return false
    return element.textContent.trim().length > 0
  })
}

function getNodePath(element) {
  const parts = []
  let node = element

  while (node && node !== element.ownerDocument.body) {
    const tag = node.tagName.toLowerCase()
    const siblings = Array.from(node.parentElement.children).filter((child) => child.tagName === node.tagName)
    const index = siblings.indexOf(node)
    parts.unshift(`${tag}:${index}`)
    node = node.parentElement
  }

  return parts.join('/')
}

function storageKey(siteKey) {
  return `jessica-lea-hub:${siteKey}`
}
