import { useEffect } from 'react'

/**
 * 滚动渐入：观察当前页面内带 [data-reveal] 的元素，进入视口后加 is-visible。
 * 必须在页面组件内部调用——懒加载路由挂载时机晚于 App 的副作用，
 * 放在 App 里会出现「内容已渲染但没被观察到」的空白页。
 */
export function useReveal(): void {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (elements.length === 0) return

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!('IntersectionObserver' in window) || reduce) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return
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

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
