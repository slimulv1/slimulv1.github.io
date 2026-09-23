import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadGLTFModel } from './model'
import { DogSpinner, DogContainer, DogFallback } from './voxel-dog-loader'

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

/**
 * VoxelDog — chú chó voxel 3D (model Draco 143KB) ở đầu trang.
 *
 * CAMERA: orthographic, khung nhìn scale = scH*0.005 + 4.8. scale PHẢI được
 * tính lại mỗi khi container đổi kích thước — trước đây resize chỉ gọi
 * renderer.setSize() nên frustum giữ nguyên giá trị của lần mount đầu: đo
 * được model cao 174px khi resize desktop→mobile nhưng 186px khi load trực
 * tiếp ở mobile (lệch 5%, khung méo). Nay dùng ResizeObserver + recompute.
 *
 * SCROLL: OrbitControls mặc định `enableZoom = true` + `preventDefault` khiến
 * lăn chuột lên chó vừa cuộn trang vừa zoom camera (đo được: trang vẫn cuộn
 * 410px nhưng camera cũng zoom). Tắt zoom + tắt pan: chó là trang trí trang
 * web, không phải trình xem mô hình — người dùng chỉ xoay nhẹ bằng chuột.
 *
 * A11y: canvas thuần trang trí (giống dải SVG fuji-dusk) → aria-hidden, không
 * đưa vào tab order. Không có affordance "kéo" trước đây (cursor: auto).
 */
const VoxelDog = () => {
  const refContainer = useRef()
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const refRenderer = useRef()
  // Ref để useEffect khởi tạo three.js chỉ chạy 1 lần, nhưng các handler
  // (resize, context lost) vẫn cập nhật được trạng thái mới nhất.
  const refControls = useRef()
  const refScene = useRef()
  const refCamera = useRef()
  const urlDogGLB = '/dog.glb'

  // Đọc prefers-reduced-motion 1 lần, giữ trong ref để vòng lặp render
  // không phải đóng lại matchMedia mỗi frame.
  const refReduced = useRef(false)

  // Khung nhìn ortho phải bám theo chiều cao container.
  const applyFrustum = useCallback(() => {
    const { current: camera } = refCamera
    const { current: container } = refContainer
    if (!camera || !container) return
    // 640 -> 240
    // 8   -> 6
    const scale = container.clientHeight * 0.005 + 4.8
    camera.left = -scale
    camera.right = scale
    camera.top = scale
    camera.bottom = -scale
    camera.updateProjectionMatrix()
  }, [])

  const handleResize = useCallback(() => {
    const { current: renderer } = refRenderer
    const { current: container } = refContainer
    if (!container || !renderer) return
    renderer.setSize(container.clientWidth, container.clientHeight)
    // Quan trọng: camera ortho không tự lấy lại aspect/frustum khi canvas
    // đổi kích thước — phải tính lại, nếu không framing lệch giữa các
    // breakpoint và giữa tải trang vs resize.
    applyFrustum()
  }, [applyFrustum])

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const { current: container } = refContainer
    if (!container) return undefined

    // prefers-reduced-motion: tắt tự xoay lặp vô hạn (autoRotate) và bỏ
    // phase giới thiệu "bay vòng quanh chú chó".
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    refReduced.current = motionQuery.matches

    const scW = container.clientWidth
    const scH = container.clientHeight

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      // Ưu tiên GPU rời khi có: renderer mặc định để trình duyệt tự chọn và
      // có thể rơi vào software rasterizer, khiến dog giật/rất nặng.
      powerPreference: 'high-performance'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(scW, scH)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)
    // Canvas thuần trang trí → ẩn khỏi cây a11y, không focus được.
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.setAttribute('tabindex', '-1')
    // Affordance: chó xoay được bằng chuột.
    renderer.domElement.style.cursor = 'grab'
    refRenderer.current = renderer

    const scene = new THREE.Scene()
    refScene.current = scene

    const target = new THREE.Vector3(-0.5, 1.2, 0)
    const initialCameraPosition = new THREE.Vector3(
      20 * Math.sin(0.2 * Math.PI),
      10,
      20 * Math.cos(0.2 * Math.PI)
    )

    const camera = new THREE.OrthographicCamera(
      -8,
      8,
      8,
      -8,
      0.01,
      50000
    )
    camera.position.copy(initialCameraPosition)
    camera.lookAt(target)
    refCamera.current = camera
    applyFrustum()

    const ambientLight = new THREE.AmbientLight(0xcccccc, Math.PI)
    scene.add(ambientLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    refControls.current = controls
    controls.autoRotate = !refReduced.current
    controls.target = target
    // Damping: xoay mượt thay vì giật từng bước.
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    // Chó là trang trí trang web, không phải trình xem mô hình:
    //  - tắt zoom: lăn chuột lên chó không zoom lung tung (và trước đây nó
    //    còn zoom CÙNG LÚC với việc cuộn trang).
    //  - tắt pan: trước đây kéo chuột phải là model bị lệch khung, mất ~43%
    //    pixel.
    controls.enableZoom = false
    controls.enablePan = false
    // Chặn xoay quá thấp/lệch tâm để chó không bị lật úp.
    controls.minPolarAngle = Math.PI * 0.12
    controls.maxPolarAngle = Math.PI * 0.46

    let req = null
    let frame = 0
    let running = false
    let disposed = false

    const animate = () => {
      if (!running || disposed) return
      req = requestAnimationFrame(animate)

      frame = frame <= 100 ? frame + 1 : frame

      // Phase giới thiệu "bay vòng quanh chú chó" — bỏ khi reduced-motion
      // (dừng ngay ở góc camera ban đầu, không tự xoay).
      if (frame <= 100 && !refReduced.current) {
        const p = initialCameraPosition
        const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20

        camera.position.y = 10
        camera.position.x =
          p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
        camera.position.z =
          p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
        camera.lookAt(target)
      } else {
        controls.update()
      }

      renderer.render(scene, camera)
    }

    const pauseRender = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(req)
    }

    const resumeRender = () => {
      if (running || disposed) return
      running = true
      animate()
    }

    // Mất WebGL context (mobile đổi tab, driver reset) khiến model biến mất
    // trắng vĩnh viễn nếu không xử lý. preventDefault() là bắt buộc để
    // trình duyệt cho phép khôi phục; onRestored resetState() để three.js
    // dựng lại tài nguyên GPU.
    const canvas = renderer.domElement
    const handleContextLost = event => {
      event.preventDefault()
      pauseRender()
    }
    const handleContextRestored = () => {
      renderer.resetState()
      handleResize()
      resumeRender()
    }
    canvas.addEventListener('webglcontextlost', handleContextLost, false)
    canvas.addEventListener(
      'webglcontextrestored',
      handleContextRestored,
      false
    )

    const handleVisibilityChange = () => {
      if (document.hidden) pauseRender()
      else resumeRender()
    }
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
      false
    )

    // ResizeObserver thay window.resize: container đổi kích thước khi đổi
    // breakpoint mà không cần sự kiện resize của window vẫn được bắt.
    const observer = new ResizeObserver(() => handleResize())
    observer.observe(container)

    const intersection = new IntersectionObserver(
      entries => {
        const isVisible = entries[0].isIntersecting
        if (!isVisible) pauseRender()
        else if (!document.hidden) resumeRender()
      },
      { threshold: 0.05 }
    )
    intersection.observe(container)

    // User đổi cài đặt reduced-motion giữa phiên → áp dụng ngay.
    const handleMotionChange = event => {
      refReduced.current = event.matches
      controls.autoRotate = !event.matches
    }
    motionQuery.addEventListener('change', handleMotionChange)

    loadGLTFModel(scene, urlDogGLB, {
      receiveShadow: false,
      castShadow: false,
      maxAnisotropy: renderer.capabilities.getMaxAnisotropy()
    })
      .then(() => {
        if (disposed) return
        resumeRender()
        setLoading(false)
      })
      .catch(error => {
        // Trước đây .then() không có .catch() → khi /dog.glb lỗi, spinner
        // quay vĩnh viễn và canvas trắng 640×640 nằm im. Nay báo lỗi và
        // dọn canvas, giữ nguyên khung container (không dịch layout).
        console.error('[voxel-dog] không tải được model:', error)
        setFailed(true)
        setLoading(false)
        if (!disposed) {
          canvas.remove()
          pauseRender()
        }
      })

    return () => {
      disposed = true
      running = false
      cancelAnimationFrame(req)
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
        false
      )
      motionQuery.removeEventListener('change', handleMotionChange)
      canvas.removeEventListener('webglcontextlost', handleContextLost, false)
      canvas.removeEventListener(
        'webglcontextrestored',
        handleContextRestored,
        false
      )
      observer.disconnect()
      intersection.disconnect()
      // controls.dispose() bắt buộc: OrbitControls gắn listener vào
      // chính canvas; renderer.dispose() KHÔNG gỡ chúng.
      controls.dispose()
      refControls.current = null
      refScene.current = null
      refCamera.current = null
      canvas.remove()
      renderer.dispose()
    }
  }, [applyFrustum])
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <DogContainer ref={refContainer}>
      {loading && !failed && <DogSpinner />}
      {failed && <DogFallback />}
    </DogContainer>
  )
}

export default VoxelDog
