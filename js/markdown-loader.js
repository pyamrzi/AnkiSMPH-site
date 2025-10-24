async function loadMarkdownContent() {
    // Get the current page name from the URL
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    
    try {
        // Fetch the markdown content
        const response = await fetch(`content/${pageName}.md`);
        const markdownText = await response.text();
        
        // Configure marked options for Discord-like rendering
        marked.setOptions({
            gfm: true,
            breaks: true,
            highlight: function(code, language) {
                return `<div class="discord-codeblock ${language}">${code}</div>`;
            }
        });

        // Custom renderer for Discord-like features
        const renderer = new marked.Renderer();
        
        // Style code blocks with language
        renderer.code = function(code, language) {
            if (language) {
                return `<pre class="language-${language}"><code>${code}</code></pre>`;
            }
            return `<pre><code>${code}</code></pre>`;
        };

        // Style blockquotes
        renderer.blockquote = function(quote) {
            return `<blockquote class="discord-quote">${quote}</blockquote>`;
        };

        // Style links
        renderer.link = function(href, title, text) {
            return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        };

        // Process spoilers and mentions
        renderer.text = function(text) {
            return text
                .replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>')
                .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
        };

        marked.use({ renderer });
        
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownText);
        
        // Insert the content into the main content section
        document.querySelector('.content').innerHTML = htmlContent;

        // Add click handler for spoilers
        document.querySelectorAll('.spoiler').forEach(spoiler => {
            spoiler.addEventListener('click', function() {
                this.style.color = '#dcddde';
            });
        });
    } catch (error) {
        console.error('Error loading markdown content:', error);
    }
}

// Load content when the page is ready
document.addEventListener('DOMContentLoaded', loadMarkdownContent);