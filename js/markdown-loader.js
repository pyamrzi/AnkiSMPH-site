async function loadMarkdownContent() {
    // Get the current page name from the URL
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    
    try {
        // Fetch the markdown content
        const response = await fetch(`content/${pageName}.md`);
        const markdownText = await response.text();
        
        // Convert markdown to HTML using marked
        const htmlContent = marked.parse(markdownText);
        
        // Insert the content into the main content section
        document.querySelector('.content').innerHTML = htmlContent;
    } catch (error) {
        console.error('Error loading markdown content:', error);
    }
}

// Load content when the page is ready
document.addEventListener('DOMContentLoaded', loadMarkdownContent);