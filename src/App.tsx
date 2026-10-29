import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Starfield } from './components/Starfield'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'

// 首屏只加载首页，其余路由按需拉取（博客详情里带着代码高亮，体积不小）
const ProjectDetail = lazy(() =>
  import('./pages/ProjectDetail').then((m) => ({ default: m.ProjectDetail })),
)
const BlogList = lazy(() => import('./pages/BlogList').then((m) => ({ default: m.BlogList })))
const BlogPost = lazy(() => import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })))
// 后台管理台只在访问 #/admin 时才下载，不影响访客的首屏体积
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-accent2" />
    </div>
  )
}

/** 站点外壳：星空背景 + 导航 + 页脚，后台不走这一层 */
function SiteShell() {
  return (
    <>
      <Starfield />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/project/:slug" element={<ProjectDetail />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/admin"
          element={
            <Suspense fallback={<RouteFallback />}>
              <AdminPage />
            </Suspense>
          }
        />
        <Route path="*" element={<SiteShell />} />
      </Routes>
    </HashRouter>
  )
}
