// Function to load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        console.log(`Loading component: ${componentPath} into ${elementId}`);
        const container = document.getElementById(elementId);
        if (!container) {
            throw new Error(`Container element ${elementId} not found`);
        }

        // Add fixed positioning to header and footer
        if (elementId === 'header-component') {
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.width = '100%';
            container.style.zIndex = '1000';
            // Add padding to body to prevent content from hiding behind header
            document.body.style.paddingTop = '60px'; // Adjust value based on your header height
        }
        if (elementId === 'footer-component') {
            container.style.position = 'fixed';
            container.style.bottom = '0';
            container.style.width = '100%';
            container.style.zIndex = '1000';
            // Add padding to body to prevent content from hiding behind footer
            document.body.style.paddingBottom = '60px'; // Adjust value based on your footer height
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
