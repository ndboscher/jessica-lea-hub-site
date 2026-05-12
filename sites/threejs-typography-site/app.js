import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js'
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/geometries/TextGeometry.js'
import { SVGLoader } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/SVGLoader.js'

const canvas = document.querySelector('#typography-canvas')
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x0c1020, 0.11)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
camera.position.set(0, 0, 13)

const ambient = new THREE.AmbientLight(0xffffff, 1.6)
const key = new THREE.DirectionalLight(0xb67cff, 2.2)
key.position.set(4, 5, 7)
const fill = new THREE.DirectionalLight(0x5bd5ff, 1.6)
fill.position.set(-5, -2, 4)
scene.add(ambient, key, fill)

const typographyGroup = new THREE.Group()
scene.add(typographyGroup)

const scaffoldGroup = new THREE.Group()
scene.add(scaffoldGroup)

const portraitGroup = new THREE.Group()
scene.add(portraitGroup)

const logoGroup = new THREE.Group()
scene.add(logoGroup)

const artworkGroup = new THREE.Group()
scene.add(artworkGroup)

const pointer = { x: 0, y: 0 }

function createScaffold() {
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9b7cff,
    roughness: 0.18,
    metalness: 0.35,
    transparent: true,
    opacity: 0.22,
    emissive: 0x2d1d57,
    emissiveIntensity: 0.55,
  })

  const ringA = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.06, 16, 140), ringMaterial)
  ringA.rotation.x = 1.1
  ringA.rotation.y = 0.28

  const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.05, 16, 120), ringMaterial.clone())
  ringB.material.color.set(0x5bd5ff)
  ringB.material.emissive.set(0x11384b)
  ringB.position.set(0.1, -0.3, -0.8)
  ringB.rotation.x = 0.52
  ringB.rotation.y = -0.65

  const stars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({
      color: 0xffb366,
      size: 0.045,
      transparent: true,
      opacity: 0.9,
    })
  )

  const positions = []
  for (let i = 0; i < 260; i += 1) {
    positions.push((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
  }
  stars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  scaffoldGroup.add(ringA, ringB, stars)
}

function addWord(font, text, options) {
  const geometry = new TextGeometry(text, {
    font,
    size: options.size,
    depth: options.depth,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  })

  geometry.center()

  const material = new THREE.MeshPhysicalMaterial({
    color: options.color,
    roughness: 0.18,
    metalness: 0.2,
    clearcoat: 0.75,
    clearcoatRoughness: 0.18,
    emissive: options.emissive,
    emissiveIntensity: 0.3,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...options.position)
  mesh.rotation.set(...options.rotation)
  typographyGroup.add(mesh)
}

function addPortraitCard() {
  const texture = new THREE.TextureLoader().load('assets/jessica-linkedin-keynote-1.jpg')
  texture.colorSpace = THREE.SRGBColorSpace

  const card = new THREE.Mesh(
    new THREE.PlaneGeometry(2.35, 2.95, 1, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    })
  )

  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(2.55, 3.15, 1, 1),
    new THREE.MeshPhysicalMaterial({
      color: 0xeef2ff,
      roughness: 0.22,
      metalness: 0.08,
      transparent: true,
      opacity: 0.14,
    })
  )

  portraitGroup.position.set(3.65, -0.05, -1.25)
  portraitGroup.rotation.set(-0.12, -0.45, 0.06)
  frame.position.z = -0.03
  portraitGroup.add(frame, card)
}

function addLogoSculpture() {
  const loader = new SVGLoader()

  loader.load(
    'assets/jessica-lea-logo.svg',
    (data) => {
      const buildLogoLayer = (opacity, zOffset, scale) => {
        const layer = new THREE.Group()

        data.paths.forEach((path) => {
          const fill = path.userData?.style?.fill
          if (!fill || fill === 'none') return

          const shapes = SVGLoader.createShapes(path)
          const color = new THREE.Color(fill)

          shapes.forEach((shape) => {
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: 4,
              bevelEnabled: false,
            })

            const material = new THREE.MeshPhysicalMaterial({
              color,
              roughness: 0.24,
              metalness: 0.14,
              transparent: true,
              opacity,
              emissive: color.clone().multiplyScalar(0.18),
              emissiveIntensity: 0.42,
            })

            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.z = zOffset
            layer.add(mesh)
          })
        })

        layer.scale.set(scale, -scale, scale)
        const box = new THREE.Box3().setFromObject(layer)
        const center = box.getCenter(new THREE.Vector3())
        layer.position.sub(center)
        return layer
      }

      const heroLogo = buildLogoLayer(0.95, 0, 0.032)
      const echoLogo = buildLogoLayer(0.28, -0.45, 0.032)
      const farEchoLogo = buildLogoLayer(0.1, -0.95, 0.032)

      logoGroup.add(farEchoLogo, echoLogo, heroLogo)
      logoGroup.position.set(-0.1, 0.45, -1.75)
      logoGroup.rotation.set(-0.16, 0.34, -0.03)
    },
    undefined,
    (error) => {
      console.error('Failed to load SVG logo for Three.js scene', error)
    }
  )
}

function addArtworkFragments() {
  const texture = new THREE.TextureLoader().load('assets/jessica-lea-logo.svg')
  texture.colorSpace = THREE.SRGBColorSpace

  const fragmentSpecs = [
    { position: [-4.3, 2.75, -2.8], scale: 1.5, opacity: 0.18 },
    { position: [4.0, 2.75, -2.5], scale: 1.1, opacity: 0.14 },
    { position: [-3.9, -2.95, -2.7], scale: 1.18, opacity: 0.16 },
    { position: [4.35, -2.45, -2.4], scale: 1.24, opacity: 0.12 },
    { position: [0.25, 4.55, -3.2], scale: 0.94, opacity: 0.1 },
  ]

  fragmentSpecs.forEach((spec, index) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: spec.opacity,
        color: index % 2 === 0 ? 0xd8c4ff : 0x9fe8ff,
        depthWrite: false,
      })
    )

    sprite.position.set(...spec.position)
    sprite.scale.set(1.61 * spec.scale, 2.32 * spec.scale, 1)
    artworkGroup.add(sprite)
  })

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(4.15, 0.11, 18, 180),
    new THREE.MeshPhysicalMaterial({
      color: 0xb67cff,
      roughness: 0.18,
      metalness: 0.24,
      transparent: true,
      opacity: 0.16,
      emissive: 0x28194b,
      emissiveIntensity: 0.7,
    })
  )

  halo.rotation.set(1.05, 0.22, 0.38)
  halo.position.set(0, 0.35, -0.25)
  artworkGroup.add(halo)
}

function loadTypography() {
  const loader = new FontLoader()
  loader.load(
    'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/fonts/helvetiker_bold.typeface.json',
    (font) => {
      addWord(font, 'CLARITY', {
        size: 0.95,
        depth: 0.18,
        color: 0xeef2ff,
        emissive: 0x2f2f54,
        position: [-2.6, 2.15, 0.2],
        rotation: [-0.18, 0.18, -0.04],
      })

      addWord(font, 'ALIGNMENT', {
        size: 0.64,
        depth: 0.14,
        color: 0x5bd5ff,
        emissive: 0x123d52,
        position: [3.05, 1.15, -0.95],
        rotation: [0.16, -0.34, 0.04],
      })

      addWord(font, 'MOMENTUM', {
        size: 0.54,
        depth: 0.12,
        color: 0xffb366,
        emissive: 0x55240f,
        position: [2.55, -2.8, 0.35],
        rotation: [-0.12, -0.18, 0.16],
      })

      addWord(font, 'INSIGHT', {
        size: 0.4,
        depth: 0.1,
        color: 0xcfb4ff,
        emissive: 0x2f1b52,
        position: [-3.45, -2.05, -1.2],
        rotation: [0.12, 0.56, -0.12],
      })

      addWord(font, 'DECISION', {
        size: 0.34,
        depth: 0.08,
        color: 0xeef2ff,
        emissive: 0x252544,
        position: [0.45, 4.0, -1.1],
        rotation: [-0.16, -0.08, 0.02],
      })

      addWord(font, 'TRANSFORMATION', {
        size: 0.28,
        depth: 0.07,
        color: 0xffcf9a,
        emissive: 0x4a2208,
        position: [0.2, -4.2, -1.3],
        rotation: [0.08, 0.02, -0.02],
      })
    },
    undefined,
    (error) => {
      console.error('Failed to load Three.js font', error)
    }
  )
}

function resizeRenderer() {
  const hero = document.querySelector('.hero')
  const width = hero.clientWidth
  const height = hero.clientHeight
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function animate(time) {
  const t = time * 0.001

  scaffoldGroup.rotation.y = t * 0.16 + pointer.x * 0.22
  scaffoldGroup.rotation.x = Math.sin(t * 0.25) * 0.08 + pointer.y * 0.08

  typographyGroup.rotation.y = t * 0.22 + pointer.x * 0.35
  typographyGroup.rotation.x = Math.sin(t * 0.45) * 0.08 + pointer.y * 0.18
  typographyGroup.position.y = Math.sin(t * 0.8) * 0.18

  portraitGroup.rotation.y = -0.45 + pointer.x * 0.18
  portraitGroup.rotation.x = -0.12 + pointer.y * 0.1
  portraitGroup.position.y = Math.sin(t * 0.7) * 0.12
  portraitGroup.position.x = 4.9 + Math.cos(t * 0.45) * 0.08

  logoGroup.rotation.y = 0.34 + pointer.x * 0.08 + Math.sin(t * 0.22) * 0.05
  logoGroup.rotation.x = -0.16 + pointer.y * 0.05
  logoGroup.position.y = 0.45 + Math.cos(t * 0.5) * 0.12

  artworkGroup.rotation.y = -0.08 + t * 0.08 + pointer.x * 0.05
  artworkGroup.rotation.x = Math.sin(t * 0.28) * 0.03 + pointer.y * 0.03
  artworkGroup.position.y = Math.sin(t * 0.55) * 0.06

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.9
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.9
})

window.addEventListener('resize', resizeRenderer)

createScaffold()
addPortraitCard()
addLogoSculpture()
addArtworkFragments()
loadTypography()
resizeRenderer()
requestAnimationFrame(animate)
