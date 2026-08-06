import { useEffect, useState } from 'react'

export const DISCORD_USER_ID = '374186828174983169'

const WS_URL = 'wss://api.lanyard.rest/socket'
const REST_URL = id => `https://api.lanyard.rest/v1/users/${id}`
const HEARTBEAT_MAX = 40000

// Singletons — mọi component dùng chung ĐÚNG 1 websocket
let socket = null
let heartbeatTimer = null
let reconnectTimer = null
let restTimer = null
let listeners = new Set()
let cache = new Map()

const emit = () => listeners.forEach(listener => listener(cache))

const startRestPolling = id => {
  clearInterval(restTimer)
  restTimer = setInterval(async () => {
    if (socket && socket.readyState === WebSocket.OPEN) return
    try {
      const res = await fetch(REST_URL(id))
      const json = await res.json()
      if (json.success) {
        cache.set(id, json.data)
        emit()
      }
    } catch (_) {
      /* lỗi mạng — thử lại lần sau */
    }
  }, 20000)
}

const stopRestPolling = () => clearInterval(restTimer)
const startRestTimer = startRestPolling

const onSocketMessage = event => {
  try {
    const msg = JSON.parse(event.data)
    if (msg.op === 1) {
      // Hello — bắt đầu heartbeat
      const interval = Math.min(msg.d?.heartbeat_interval || 30000, HEARTBEAT_MAX)
      clearInterval(heartbeatTimer)
      heartbeatTimer = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ op: 3 }))
        }
      }, interval)
    } else if (msg.op === 0 && msg.t) {
      if (msg.t === 'INIT_STATE') {
        const d = msg.d
        if (d && d.discord_user) cache.set(d.discord_user.id, d)
        else if (d && typeof d === 'object') {
          Object.entries(d).forEach(([id, presence]) => cache.set(id, presence))
        }
        emit()
      } else if (msg.t === 'PRESENCE_UPDATE' && msg.d?.discord_user) {
        cache.set(msg.d.discord_user.id, msg.d)
        emit()
      }
    }
  } catch (_) {
    // tin nhắn không phải JSON — bỏ qua
  }
}

const scheduleReconnect = id => {
  clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => connect(id), 4000)
}

const connect = id => {
  if (!id) return
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }
  try {
    socket = new WebSocket(WS_URL)
    socket.onopen = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: id } }))
      }
      stopRestPolling()
    }
    socket.onmessage = onSocketMessage
    socket.onclose = () => {
      clearInterval(heartbeatTimer)
      startRestTimer(id)
      scheduleReconnect(id)
    }
    socket.onerror = () => {
      // onclose sẽ xử lý reconnect
    }
  } catch (_) {
    scheduleReconnect(id)
    startRestTimer(id)
  }
}

export function useDiscordPresence(userId = DISCORD_USER_ID) {
  const [presence, setPresence] = useState(() => cache.get(userId) || null)

  useEffect(() => {
    if (!userId) return undefined
    const listener = map => setPresence(map.get(userId) || null)
    listeners.add(listener)

    connect(userId)
    startRestTimer(userId)

    // Lần đầu tải: nếu sau 4s vẫn chưa có data thì tự fetch REST
    const timeout = setTimeout(async () => {
      if (cache.has(userId)) return
      try {
        const res = await fetch(REST_URL(userId))
        const json = await res.json()
        if (json.success) {
          cache.set(userId, json.data)
          emit()
        }
      } catch (_) {
        // không sao — WS vẫn đang thử
      }
    }, 4000)

    return () => {
      listeners.delete(listener)
      clearTimeout(timeout)
    }
  }, [userId])

  return presence
}