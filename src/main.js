import { marked } from 'marked';

// Configure Marked (can add extensions, highlights here later)
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Neural Archive Logic
 * Using Vite's glob import to automatically discover all articles.
 */
const articleModules = import.meta.glob('../content/articles/*.md', { query: '?raw', import: 'default' });

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
    // path: '../content/articles/neuro-networks.md'
    const name = path.split('/').pop().replace('.md', '');
    const title = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    articles[name] = {
      path,
      title,
      loader: articleModules[path]
    };
  }

  renderSidebar();
  handleRouting();

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouting);
}

/**
 * Render Sidebar Navigation
 */
function renderSidebar() {
  if (!articleListEl) return;
  
  articleListEl.innerHTML = `
    <li><a href="#/" class="article-link">Home / Introduction</a></li>
  `;
  
  Object.keys(articles).sort().forEach(name => {
    if (name === 'introduction') return; // Handled as Home
    
    const li = document.createElement('li');
    li.className = 'article-item';
    li.innerHTML = `<a href="#/${name}" class="article-link">${articles[name].title}</a>`;
    articleListEl.appendChild(li);
  });
}

/**
 * Basic routing: Load article based on hash
 */
async function handleRouting() {
  const hash = window.location.hash.replace('#/', '') || 'introduction';
  
  // Highlighting active link in sidebar
  document.querySelectorAll('.article-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#/${hash === 'introduction' ? '' : hash}`);
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
