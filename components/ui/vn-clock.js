import { useState, useEffect } from 'react'
import { Text, useColorModeValue } from '@chakra-ui/react'

const VnClock = () => {
  const [time, setTime] = useState(null)
  const clockColor = useColorModeValue('#3b4261', '#a9b1d6')

  useEffect(() => {
    const update = () => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(new Date())
      const get = type => parts.find(p => p.type === type)?.value
      setTime(`${get('hour')}:${get('minute')} ${get('day')}, ${get('month')} (GMT+7)`)
    }
    update()
    // Chỉ hiển thị giờ/phút → cập nhật 15s là đủ mượt, giảm 15x số lần render
    const id = setInterval(update, 15000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  return (
    <Text
      as="span"
      fontSize="sm"
      fontFamily="'M PLUS Rounded 1c'"
      fontWeight={700}
      color={clockColor}
      opacity={0.8}
      whiteSpace="nowrap"
    >
      {time}
    </Text>
  )
}

export default VnClock
