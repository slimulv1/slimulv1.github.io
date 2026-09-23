import { useState, useEffect } from 'react'
import { Text, useColorModeValue } from '@chakra-ui/react'
import { useInterfaceLang } from '../../lib/interface-lang'

// Tên tháng theo ngôn ngữ giao diện đang xoay vòng
const LOCALE = { en: 'en-US', ja: 'ja-JP' }

const VnClock = () => {
  const { lang } = useInterfaceLang()
  const [time, setTime] = useState(null)
  const clockColor = useColorModeValue('#3b4261', '#a9b1d6')

  useEffect(() => {
    const update = () => {
      const parts = new Intl.DateTimeFormat(LOCALE[lang], {
        timeZone: 'Asia/Ho_Chi_Minh',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(new Date())
      const get = type => parts.find(p => p.type === type)?.value
      // ja-JP tách "月"/"日" thành literal part riêng → ghép thủ công cho đủ
      const dateText =
        lang === 'ja'
          ? `${get('month')}月${get('day')}日`
          : `${get('day')}, ${get('month')}`
      setTime(`${get('hour')}:${get('minute')} ${dateText} (GMT+7)`)
    }
    update()
    // Chỉ hiển thị giờ/phút → cập nhật 15s là đủ mượt, giảm 15x số lần render
    const id = setInterval(update, 15000)
    return () => clearInterval(id)
  }, [lang])

  if (!time) return null

  return (
    <Text
      as="span"
      fontSize={{ base: 'xs', sm: 'sm' }}
      fontFamily="'Nunito', 'Kosugi Maru', sans-serif"
      fontWeight={lang === 'ja' ? 400 : 700}
      color={clockColor}
      opacity={0.8}
      whiteSpace="nowrap"
    >
      {time}
    </Text>
  )
}

export default VnClock
