import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

/**
 * Draco decoder SELF-HOST tại /draco/ thay vì kéo từ gstatic.com.
 * Lý do (đo được trước khi đổi): bản gstatic tốn **452ms** + là request ra
 * ngoài (phụ thuộc bên thứ ba, chặn được bằng blocker, ảnh hưởng
 * quyền riêng tư). File nằm cùng origin nên đi qua HTTP/2+ của chính site.
 * `type: 'wasm'` giải nén nhanh hơn `js`; loader tự fallback về js nếu
 * trình duyệt không có WebAssembly.
 */
const draco = new DRACOLoader()
draco.setDecoderConfig({ type: 'wasm' })
draco.setDecoderPath('/draco/')

/**
 * Bật anisotropic filtering lên mức tối đa thiết bị hỗ trợ.
 * Mặc định của three.js là 1× → texture của model voxel bị MỜ khi nhìn ở
 * góc nghiêng (đặc biệt mặt nghiêng của khối). maxAnisotropy đo được là 16
 * trên máy test. Đây là cải thiện thuần túy: chỉ làm nét thêm, không đổi màu,
 * không đổi hình dáng, không tốn thêm draw call.
 */
function enableAnisotropy(root, maxAnisotropy) {
  if (!maxAnisotropy || maxAnisotropy <= 1) return
  root.traverse(child => {
    if (!child.isMesh) return
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach(mat => {
      if (!mat) return
      Object.keys(mat).forEach(key => {
        const tex = mat[key]
        if (tex && tex.isTexture && tex.anisotropy !== maxAnisotropy) {
          tex.anisotropy = maxAnisotropy
          tex.needsUpdate = true
        }
      })
    })
  })
}

export function loadGLTFModel(scene, glbPath, options = {}) {
  const {
    receiveShadow = true,
    castShadow = true,
    maxAnisotropy = 1
  } = options

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)

    loader.load(
      glbPath,
      gltf => {
        const obj = gltf.scene
        obj.name = 'dog'
        obj.position.y = 0
        obj.position.x = 0
        obj.receiveShadow = receiveShadow
        obj.castShadow = castShadow
        scene.add(obj)

        obj.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = castShadow
            child.receiveShadow = receiveShadow
          }
        })

        enableAnisotropy(obj, maxAnisotropy)

        resolve(obj)
      },
      undefined,
      function (error) {
        reject(error)
      }
    )
  })
}
