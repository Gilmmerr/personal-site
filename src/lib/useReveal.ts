import { useEffect } from 'react'

/**
 * 滚动渐入：观察页面内带 [data-reveal] 的元素，进入视口后加 is-visible。
 * 必须在页面组件内部调用——懒加载路由挂载时机晚于 App 的副作用，
 * 放在 App 里会出现「内容已渲染但没被观察到」的空白页。
 *
 * 内容可以在后台随时增删（项目卡片、文章条目），新插入的节点不会触发
 * 首次的 querySelectorAll，所以这里额外挂一个 MutationObserver 补扫，
 * 否则后台新增的卡片会一直停在 opacity: 0。
 */
export function useReveal(): void {
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const revealAll = () => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)')
        .forEach((el) => el.classList.add('is-visible'))
    }

    if (!('IntersectionObserver' in window) || reduce) {
      revealAll()
      const mutation = new MutationObserver(revealAll)
      mutation.observe(document.body, { childList: true, subtree: true })
      return () => mutation.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      // threshold 0：长区块（整篇文章正文）永远达不到比例阈值，会让内容一直不可见
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )

    const seen = new WeakSet<Element>()
    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        observer.observe(el)
      })
    }

    scan()
    const mutation = new MutationObserver(scan)
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
  }, [])
}
