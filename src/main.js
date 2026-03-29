import { marked } from 'marked';

/**
 * Neural Archive Logic
 * Automatically discovers all markdown articles and builds the Wiki structure.
 */
const articleModules = import.meta.glob('../content/articles/**/*.md', { query: '?raw', import: 'default' });

const articleListEl = document.getElementById('article-list');
const articleContentEl = document.getElementById('article-content');

// Store discovered articles
const articles = {};
const fileNameToSlug = {}; // Map fileName to slug for robust fallback routing

/**
 * Initialize the Wiki: Load content, detect H1 titles, and build sidebar
 */
async function init() {
  console.log('Archive Connection Established...');
  
  // Create an array of promises to load all articles in parallel
  const loadPromises = Object.keys(articleModules).map(async (path) => {
    // Calculate full slug from path (e.g. tech/transformer or introduction)
    const slug = path.replace('../content/articles/', '').replace('.md', '');
    const parts = slug.split('/');
    const fileName = parts[parts.length - 1];
    
    // Calculate category from path
    let category = parts.length > 1 ? parts.slice(0, -1).join('/') : 'General';

    // Load content to extract the H1 title
    const loader = articleModules[path];
    const rawContent = await loader();
    
    // Extract title from first H1 (# Title)
    const h1Match = rawContent.match(/^#\s+(.+)$/m);
    const title = h1Match ? h1Match[1].trim() : fileName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Extract aliases from <!-- alias: ... -->
    const aliasMatch = rawContent.match(/<!--\s*alias:\s*(.+?)\s*-->/i);
    const aliases = aliasMatch ? aliasMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [];

    articles[slug] = {
      path,
      title,
      aliases,
      category,
      loader,
      content: rawContent
    };

    // Store fileName mapping for robust fallback (e.g. #/transformer -> #/tech/transformer)
    if (!fileNameToSlug[fileName]) {
      fileNameToSlug[fileName] = slug;
    }
  });

  await Promise.all(loadPromises);

  setupAutoLinks();
  renderSidebar();
  handleRouting();

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouting);

  // Setup Mobile Toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open');
    });
  }

  // Clicking site title returns to home
  const siteTitle = document.getElementById('site-title');
  if (siteTitle) {
    siteTitle.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }
}

/**
 * Configure Marked for Wikipedia-style automatic linking based on article titles
 */
function setupAutoLinks() {
  const linkTargets = [];
  const titleToName = {};

  Object.keys(articles).forEach(name => {
    const article = articles[name];
    const rawTitle = article.title;
    
    // Process base title: split by parentheses if it exists
    const match = rawTitle.match(/^([^\(（]+)\s*[(\uff08](.+)[)\uff09]$/);
    const candidates = new Set();
    
    candidates.add(rawTitle); // Full title
    
    if (match) {
      candidates.add(match[1].trim()); // Before parens
      candidates.add(match[2].trim()); // Inside parens
    }
    
    if (article.aliases && article.aliases.length > 0) {
      article.aliases.forEach(alias => candidates.add(alias));
    }
    
    // Add to linkTargets and map
    candidates.forEach(t => {
      if (!titleToName[t]) {
        linkTargets.push(t);
        titleToName[t] = name;
      }
    });
  });

  const allTitles = linkTargets.sort((a, b) => b.length - a.length); // Match longest titles first

  if (allTitles.length === 0) return;

  marked.use({
    hooks: {
      preprocess(markdown) {
        let processed = markdown;

        // Temporarily replace blocks that shouldn't be auto-linked with placeholders
        // Includes: Markdown links, headers, code blocks, inline code, and math blocks
        const protectedBlocks = [];
        processed = processed.replace(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|```[\s\S]*?```|`[^`]*`|\[[^\]]*\]\([^\)]*\)|<a [^>]+>.*?<\/a>|\#\s+.+)/g, (match) => {
          protectedBlocks.push(match);
          return `__PROTECTED_BLOCK_${protectedBlocks.length - 1}__`;
        });
        
        // Feature: Solve Marked's CJK parsing bug by converting **bold** to <strong> directly
        // (Since code blocks and math are already protected above, this is safe)
        processed = processed.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
        
        // Escape regex special characters in titles
        const escapedTitles = allTitles.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        
        // Create regex to match titles.
        // Rule: Only require boundaries if the surrounding character is an English alphanumeric.
        const regex = new RegExp(`(?<![A-Za-z0-9_])(${escapedTitles.join('|')})(?![A-Za-z0-9_])`, 'g');

        processed = processed.replace(regex, (match) => {
          const name = titleToName[match];
          // Check if we are currently viewing this article to avoid self-links
          const currentHash = window.location.hash.replace('#/', '') || 'introduction';
          if (name === currentHash) return match;
          
          return `<a href="#/${name}" class="auto-link">${match}</a>`;
        });

        // Restore protected blocks
        return processed.replace(/__PROTECTED_BLOCK_(\d+)__/g, (match, index) => {
          return protectedBlocks[parseInt(index)];
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
 * Render Sidebar Navigation with Categories and Japanese Titles
 */
function renderSidebar() {
  if (!articleListEl) return;
  
  articleListEl.innerHTML = `
    <li><a href="#/" class="article-link">🏠 Home / Introduction</a></li>
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

    // Sort articles within category by Japanese title alphabetically
    categories[cat].sort((a, b) => articles[a].title.localeCompare(articles[b].title, 'ja')).forEach(name => {
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
  
  // Close mobile sidebar on navigation
  document.body.classList.remove('sidebar-open');

  // Handle special "articles" index route
  if (hash === 'articles' || hash === 'articles/') {
    renderArticleIndex();
    return;
  }

  // Highlighting active link in sidebar
  document.querySelectorAll('.article-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === `#/${hash === 'introduction' ? '' : hash}`);
  });

  // Robust Resolution: If slug not found, try finding by fileName
  if (!articles[hash] && fileNameToSlug[hash]) {
    const slug = fileNameToSlug[hash];
    console.warn(`Redirecting legacy link: ${hash} -> ${slug}`);
    window.location.hash = `#/${slug}`;
    return;
  }

  loadArticle(hash);
}

/**
 * Render a visual index of all articles (used for #/articles/ route)
 */
function renderArticleIndex() {
  if (!articleContentEl) return;

  // Highlight "Articles" in nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#/articles/');
  });

  let indexHtml = `
    <div class="article-index">
      <h1>Archive Index</h1>
      <p>Project Neural Archiveに収蔵されている全データの一覧です。カテゴリを選択してアクセスしてください。</p>
      
      <div class="index-grid">
  `;

  // Sort articles by title
  const sortedNames = Object.keys(articles).sort((a, b) => 
    articles[a].title.localeCompare(articles[b].title, 'ja')
  );

  sortedNames.forEach(name => {
    const article = articles[name];
    indexHtml += `
      <a href="#/${name}" class="index-card">
        <span class="card-category">${article.category}</span>
        <span class="card-title">${article.title}</span>
      </a>
    `;
  });

  indexHtml += `
      </div>
    </div>
  `;

  articleContentEl.innerHTML = indexHtml;
  articleContentEl.classList.add('loaded');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Fetch and Render Article content
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

    // For better performance, use cached content if available during initialization
    const markdown = article.content || await article.loader();
    const html = marked.parse(markdown);
    
    articleContentEl.innerHTML = html;
    articleContentEl.classList.add('loaded');

    // Trigger MathJax rendering
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([articleContentEl]).catch((err) => console.log('MathJax error:', err));
    }
    
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
