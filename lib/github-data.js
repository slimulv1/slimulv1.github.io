// Lấy dữ liệu GitHub TẠI THỜI ĐIỂM BUILD (chỉ chạy ở build, không bundle vào client).
// Trang là static export nên dữ liệu được đổ thẳng vào HTML — mỗi lần build lại là
// tự cập nhật lại tên project + phần about từ GitHub.
//
// 3 tầng fallback để build KHÔNG BAO GIỜ vỡ:
//   1) projects: GraphQL pinnedItems  — khi có GITHUB_TOKEN/GH_TOKEN (GH Actions tự cấp)
//   2) projects: REST anonymous       — không cần token, lấy repo non-fork mới nhất
//   3) projects: snapshot pinned-repos.json — khi GitHub lỗi / rate-limit
//   profile (name + bio) luôn lấy từ REST `users/{login}` (anonymous), fallback hardcode.
import snapshotRepos from './pinned-repos.json'

const USER = 'slimulv1'
const MAX_PROJECTS = 6 // GitHub giới hạn tối đa 6 repo pin
const TIMEOUT_MS = 8000

const FALLBACK_PROFILE = {
  name: 'Slimu Neet',
  bio: 'Just a plain human with hobbies and a passion for linux & open source.'
}

// Màu linguist dùng cho nhánh REST (nhánh GraphQL vốn đã trả màu sẵn).
// Nếu thiếu ngôn ngữ nào thì dùng màu xám mặc định của GitHub.
const LANGUAGE_COLORS = {
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  Rust: '#dea584',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  HTML: '#e34c26',
  CSS: '#663399',
  Lua: '#000080',
  Zig: '#ec915c',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Nix: '#7e7eff',
  R: '#198CE7',
  'Vim Script': '#199f4b',
  Makefile: '#427819',
  Dockerfile: '#384d54',
  PowerShell: '#012456'
}
const DEFAULT_COLOR = '#8b949e'

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'slimu-neet-homepage',
      ...options.headers
    },
    ...options
  })
  if (!res.ok) throw new Error(`GitHub ${res.status} ${url}`)
  return res.json()
}

const mapGraphQLRepo = node => {
  const lang = node.primaryLanguage
  return {
    name: node.name,
    description: node.description || '',
    language: {
      name: lang && lang.name ? lang.name : 'Unknown',
      color: lang && lang.color ? lang.color : DEFAULT_COLOR
    },
    stars: node.stargazerCount,
    pushedAt: node.pushedAt,
    url: node.url
  }
}

const mapRESTRepo = repo => {
  const lang = repo.language || 'Unknown'
  return {
    name: repo.name,
    description: repo.description || '',
    language: {
      name: lang,
      color: LANGUAGE_COLORS[lang] || DEFAULT_COLOR
    },
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at,
    url: repo.html_url
  }
}

// Tầng 1: GraphQL — đúng các repo đang pin trên profile
const fetchPinnedGraphQL = async token => {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'slimu-neet-homepage'
    },
    body: JSON.stringify({
      query: `query($login: String!) {
        user(login: $login) {
          pinnedItems(first: ${MAX_PROJECTS}, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                description
                url
                stargazerCount
                pushedAt
                primaryLanguage { name color }
              }
            }
          }
        }
      }`,
      variables: { login: USER }
    })
  })
  const json = await res.json()
  const nodes = json && json.data && json.data.user && json.data.user.pinnedItems
    ? json.data.user.pinnedItems.nodes
    : null
  if (!Array.isArray(nodes)) {
    throw new Error('GraphQL pinnedItems: no data')
  }
  return nodes.map(mapGraphQLRepo)
}

// Tầng 2: REST anonymous — repo public non-fork mới cập nhật nhất.
// REST_EXCLUDE: repo chính của site (slimulv1.github.io) không tự hiện card dẫn về chính nó.
const REST_EXCLUDE = ['slimulv1.github.io']
const fetchProjectsREST = async () => {
  const repos = await fetchJSON(
    `https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`
  )
  return repos
    .filter(r => !r.fork && !r.archived && !REST_EXCLUDE.includes(r.name))
    .slice(0, MAX_PROJECTS)
    .map(mapRESTRepo)
}

export async function fetchGitHubData() {
  // Chuỗi token:
  //  - GITHUB_DATA_TOKEN: secret tùy chọn trên GH Actions (fine-grained PAT đọc public repos + user)
  //  - GH_TOKEN: token của gh CLI khi build local (bun run build với GH_TOKEN=$(gh auth token))
  // KHÔNG dùng GITHUB_TOKEN mặc định của Actions: đó là fine-grained machine token, không có
  // user-scope nên KHÔNG thể đọc pinnedItems qua GraphQL (chỉ đọc được repo contents).
  const token = process.env.GITHUB_DATA_TOKEN || process.env.GH_TOKEN || ''

  // Profile (name + bio) — REST anonymous, không cần token
  let profile = null
  try {
    const user = await fetchJSON(`https://api.github.com/users/${USER}`)
    profile = {
      name: user.name ? user.name.trim() : FALLBACK_PROFILE.name,
      bio: user.bio ? user.bio.trim() : FALLBACK_PROFILE.bio
    }
  } catch (err) {
    console.warn('[github-data] profile fetch failed:', err.message)
  }

  // Projects — ưu tiên GraphQL pinned khi có token
  let projects = null
  let source = ''
  if (token) {
    try {
      projects = await fetchPinnedGraphQL(token)
      source = 'github-graphql-pinned'
    } catch (err) {
      console.warn('[github-data] graphql pinned failed -> rest:', err.message)
    }
  }
  if (!projects) {
    try {
      projects = await fetchProjectsREST()
      source = 'github-rest'
    } catch (err) {
      console.warn('[github-data] rest projects failed -> snapshot:', err.message)
    }
  }
  if (!projects) {
    // Tầng 3: snapshot — copy để không vô tình mutate module import
    projects = snapshotRepos.map(r => ({ ...r, language: { ...r.language } }))
    source = 'snapshot-json'
  }
  if (!profile) profile = { ...FALLBACK_PROFILE }

  console.log(
    `[github-data] source=${source} projects=${projects.length} name=${profile.name}`
  )
  return { profile, projects, source }
}