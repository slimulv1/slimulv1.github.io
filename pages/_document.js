import { ColorModeScript } from '@chakra-ui/react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import theme from '../lib/theme'

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          {/* Font tách theo ngôn ngữ: Nunito (bo tròn mềm, nhiều weight) cho Latin
              của tiếng Anh; Kosugi Maru (maru gothic bo tròn, monospaced dễ đọc,
              CHỈ có weight 400) cho kana/kanji của tiếng Nhật. Cả 2 nằm cùng stack
              fonts.body/heading — trình duyệt tự chọn glyph theo script. */}
          <link
            href="https://fonts.googleapis.com/css2?family=Kosugi+Maru&family=Nunito:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          {/* Màu thanh trình duyệt mobile theo đúng theme (light cream / dark navy) */}
          <meta
            name="theme-color"
            media="(prefers-color-scheme: light)"
            content="#f0e7db"
          />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: dark)"
            content="#1a1b26"
          />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
