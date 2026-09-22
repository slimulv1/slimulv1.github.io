import Layout from '../components/layouts/main'
import { AnimatePresence } from 'framer-motion'
import Chakra from '../components/providers/chakra'
// Giao diện tự xoay vòng ngôn ngữ Việt → Anh → Nhật mỗi 15 giây (xem lib/interface-lang.js)
import { InterfaceLangProvider } from '../lib/interface-lang'

if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual'
}

function Website({ Component, pageProps, router }) {
  return (
    <InterfaceLangProvider>
      <Chakra>
        <Layout>
          <AnimatePresence
            mode="wait"
            initial={true}
            onExitComplete={() => {
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0 })
              }
            }}
          >
            <Component {...pageProps} key={router.route} />
          </AnimatePresence>
        </Layout>
      </Chakra>
    </InterfaceLangProvider>
  )
}

export default Website
