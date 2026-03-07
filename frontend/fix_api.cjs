const fs = require('fs');
const path = 'src/utils/api.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/fetch\(/g, 'customFetch(');

const wrapper = `const customFetch = (url, options = {}) => {
    return fetch(url, { ...options, credentials: 'include' });
};

`;

if (!content.includes('const customFetch')) {
    content = content.replace('const getAuthHeaders = () => {', wrapper + 'const getAuthHeaders = () => {');
}

// Ensure the profile endpoint is /api/v1/auth/me
content = content.replace(/\/auth\/profile/g, '/auth/me');

// Add logout if it's not present
if (!content.includes('logout: () =>')) {
    const logoutCode = `    logout: () => customFetch(\`\${API_URL}/auth/logout\`, {
        method: "POST"
    }).then(r => r.json()),
`;
    content = content.replace('getProfile: () => customFetch(`${API_URL}/auth/me`, {', logoutCode + '\n    getProfile: () => customFetch(`${API_URL}/auth/me`, {');
}

fs.writeFileSync(path, content);
console.log('Done');
