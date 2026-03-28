import { marked } from 'marked';

/**
 * Neural Archive Logic
 * Using Vite's glob import to automatically discover all articles.
 */
const articleModules = import.meta.glob('../content/articles/**/*.md', { query: '?raw', import: 'default' });

const articleListEl = document.getElementById('article-list');
const articleContentEl = document.getElementById('article-content');

// Store discovered articles
const articles = {};

/**
 * Initialize the Wiki: Detect files and build sidebar
 */
async function init() {
  console.log('Archive Connection Established...');
  
  // Transform glob keys to searchable article names
  for (const path in articleModules) {
    // path example: '../content/articles/technology/neural-networks.md'
    const parts = path.split('/');
    const fileName = parts.pop().replace('.md', '');
    
    // Calculate category from path
    // path is relative to src/main.js: '../content/articles/cat/file.md'
    // parts: ['..', 'content', 'articles', 'cat', 'file.md']
    // category is at index 3 if it exists
    let category = 'General';
    if (parts.length > 3 && parts[3] !== fileName + '.md') {
      category = parts.slice(3).join('/') || 'General';
    }
    
    // Derive title from filename (kebab-case to Space Case)
    const title = fileName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    articles[fileName] = {
      path,
      title,
      category,
      loader: articleModules[path]
    };
  }

  setupAutoLinks();
  renderSidebar();
  handleRouting();

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouting);
}

/**
 * Configure Marked for Wikipedia-style automatic linking
 */
function setupAutoLinks() {
  const allTitles = Object.values(articles)
    .map(a => a.title)
    .sort((a, b) => b.length - a.length); // Match longest titles first

  if (allTitles.length === 0) return;

  const titleToName = {};
  Object.keys(articles).forEach(name => {
    titleToName[articles[name].title] = name;
  });

  marked.use({
    hooks: {
      preprocess(markdown) {
        let processed = markdown;
        
        // Escape regex special characters in titles
        const escapedTitles = allTitles.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        
        // Regex to find titles: 
        // 1. Not inside an existing markdown link [text](link)
        // 2. Not starting with # (header)
        // 3. Exact word boundary
        const regex = new RegExp(`(?<!\\[)\\b(${escapedTitles.join('|')})\\b(?!\\]\\()`, 'g');

        return processed.replace(regex, (match) => {
          const name = titleToName[match];
          // Check if we are currently viewing this article to avoid self-links
          const currentHash = window.location.hash.replace('#/', '') || 'introduction';
          if (name === currentHash) return match;
          
          return `[${match}](#/${name})`;
        });
      }
    }
  });

  marked.setOptions({
    gfm: true,
    breaks: true,
  });
}

/**
 * Render Sidebar Navigation with Categories
 */
function renderSidebar() {
  if (!articleListEl) return;
  
  articleListEl.innerHTML = `
    <li><a href="#/" class="article-link">Home / Introduction</a></li>
  `;
  
  // Group articles by category
  const categories = {};
  Object.keys(articles).forEach(name => {
    if (name === 'introduction') return;
    const cat = articles[name].category;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(name);
  });

  Object.keys(categories).sort().forEach(cat => {
    const catHeader = document.createElement('li');
    catHeader.className = 'sidebar-category';
    catHeader.style.listStyle = 'none';
    catHeader.style.marginTop = '1.5rem';
    catHeader.style.marginBottom = '0.5rem';
    catHeader.style.fontSize = '0.7rem';
    catHeader.style.letterSpacing = '0.1em';
    catHeader.style.color = 'var(--text-muted, #888)';
    catHeader.innerHTML = `<span>${cat.toUpperCase()}</span>`;
    articleListEl.appendChild(catHeader);

    categories[cat].sort().forEach(name => {
      const li = document.createElement('li');
      li.className = 'article-item';
      li.innerHTML = `<a href="#/${name}" class="article-link">${articles[name].title}</a>`;
      articleListEl.appendChild(li);
    });
  });
}

/**
 * Basic routing: Load article based on hash
 */
async function handleRouting() {
  const hash = window.location.hash.replace('#/', '') || 'introduction';
  
  // Highlighting active link in sidebar
  document.querySelectorAll('.article-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === `#/${hash === 'introduction' ? '' : hash}`);
  });

  loadArticle(hash);
}

/**
 * Fetch and Render Article
 */
async function loadArticle(name) {
  if (!articleContentEl) return;

  // Show loading state
  articleContentEl.innerHTML = '<div class="loading-spinner">Accessing Archive Data...</div>';
  articleContentEl.classList.remove('loaded');

  try {
    const article = articles[name];
    if (!article) {
      throw new Error(`Archived Data for "${name}" not found.`);
    }

    const markdown = await article.loader();
    const html = marked.parse(markdown);
    
    articleContentEl.innerHTML = html;
    articleContentEl.classList.add('loaded');
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    articleContentEl.innerHTML = `
      <h1>Archive Protocol Error</h1>
      <p>Error Code: 404_DATA_CORRUPTED</p>
      <p>${error.message}</p>
      <a href="#/" class="nav-link">Return to Initial Protocol</a>
    `;
  }
}

// Start Archive
init();
