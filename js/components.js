// Function to load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        console.log(`Loading component: ${componentPath} into ${elementId}`);
        const container = document.getElementById(elementId);
        if (!container) {
            throw new Error(`Container element ${elementId} not found`);
        }

        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Error loading component: ${response.status} - ${response.statusText}`);
        }
        const content = await response.text();
        console.log(`Successfully loaded content from ${componentPath}`);
        
        container.innerHTML = content;
        console.log(`Content inserted into ${elementId}`);

        // If this is the header, update active link
        if (elementId === 'header-component') {
            updateActiveLink();
        }
    } catch (error) {
        console.error('Error loading component:', error);
        // Make the error visible on the page
        const container = document.getElementById(elementId);
        if (container) {
            container.innerHTML = `<div style="color: red; padding: 1em; border: 1px solid red;">
                Error loading component: ${error.message}
            </div>`;
        }
    }
}

// Function to update active link in navigation
function updateActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('#header-component nav a');
    
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Load components when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Loading components...');
    
    // Check if containers exist
    const headerContainer = document.getElementById('header-component');
    const footerContainer = document.getElementById('footer-component');
    
    console.log('Header container found:', !!headerContainer);
    console.log('Footer container found:', !!footerContainer);
    
    if (headerContainer) {
        loadComponent('header-component', 'components/header.html');
    } else {
        console.error('Header container not found!');
    }
    
    if (footerContainer) {
        loadComponent('footer-component', 'components/footer.html');
    } else {
        console.error('Footer container not found!');
    }
});
