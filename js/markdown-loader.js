async function loadMarkdownContent() {
    // Wait for marked to be available
    if (typeof marked === 'undefined') {
        console.warn('marked library not yet loaded, retrying...');
        setTimeout(loadMarkdownContent, 100);
        return;
    }
    
    // Get the current page name from the URL
    let pageName = window.location.pathname.split('/').pop().replace('.html', '');
    
    // If no page name (root URL), default to 'index'
    if (!pageName || pageName === '') {
        pageName = 'index';
    }
    
    try {
        // Fetch the markdown content
        const response = await fetch(`content/${pageName}.md`);
        
        // Check if the response is ok
        if (!response.ok) {
            throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
        }
        
        const markdownText = await response.text();
        
        // Ensure we have valid markdown text
        if (typeof markdownText !== 'string') {
            throw new Error('Invalid markdown content: not a string');
        }
        
        // Check if the markdown file is empty or doesn't exist
        if (!markdownText.trim()) {
            console.warn(`No content found in ${pageName}.md`);
            document.querySelector('.content').innerHTML = '<p>No content available.</p>';
            return;
        }
        
        // Convert markdown to HTML - try different marked API approaches
        let htmlContent;
        try {
            // Try the function approach first
            if (typeof marked === 'function') {
                htmlContent = marked(markdownText);
            } else if (marked && typeof marked.parse === 'function') {
                htmlContent = marked.parse(markdownText);
            } else {
                throw new Error('marked library API not recognized');
            }
        } catch (markdownError) {
            console.error('Markdown parsing error:', markdownError);
            throw new Error(`Markdown parsing failed: ${markdownError.message}`);
        }
        
        // Insert the content into the main content section
        document.querySelector('.content').innerHTML = htmlContent;
    } catch (error) {
        console.error('Error loading markdown content:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        document.querySelector('.content').innerHTML = `<p>Error loading content: ${error.message}</p>`;
    }
}

// Load content when the page is ready
document.addEventListener('DOMContentLoaded', loadMarkdownContent);