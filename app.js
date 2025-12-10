
const userNameInput = document.getElementById('username-input');
const searchButton = document.getElementById('search-btn');
const sectionTitle = document.getElementById('section-title');
const userProfile = document.getElementById('user-profile');
const footer = document.getElementById('footer');
const loading = document.getElementById('loading');
const reposGrid = document.getElementById('repos-grid');
const loadingRepos = document.getElementById('loadingRepos');
const errorMessage = document.getElementById('error-message');
const clearBtn = document.getElementById("clearBtn");
clearBtn.style.display = "none";

userNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkUser();
});

userNameInput.addEventListener('input', () => {
    clearBtn.style.display = userNameInput.value ? "block" : "none";
});

clearBtn.addEventListener('click', () => {
    userNameInput.value = "";
    clearBtn.style.display = "none";
    userNameInput.focus();
});

function checkUser() {
    userProfile.style.display = 'none';
    errorMessage.style.display = 'none';
    sectionTitle.style.display = 'none';
    reposGrid.style.display = 'none';
    footer.className = 'fixed';
    loading.style.display = 'block';
    if (!userNameInput.value.trim()) {
        loading.style.display = 'none';
        errorMessage.style.display = 'block';
        return;
    }
    const URL = `https://api.github.com/users/${userNameInput.value.trim()}`;
    let data = getUserData(URL);
    data.then((res) => {
        if (!res) {
            loading.style.display = 'none';
            errorMessage.style.display = 'block';
            return;
        }
        renderUserProfile(res);
        footer.className = 'footer';
        loadingRepos.style.display = 'block';
        const repos = getUserRepos(res.repos_url);
        repos.then((res) => {
            res.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            displayRepos(res);
        }).catch((error) => {
            console.log(error);
        });
    }).catch((error) => {
        console.log(error);
    });
}

async function getUserData(URL) {
    try {
        const response = await fetch(URL);
        if (response.status == 404) {
            return false;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error: ', error);
    }
}

async function getUserRepos(URL) {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error: ', error);
    }
}

function renderUserProfile(user) {
    let userProfile = document.querySelector('#user-profile');
    loading.style.display = 'none';
    userProfile.style.display = 'block';
    userProfile.innerHTML = `
    <div class="profile-header">
        <img src="${user.avatar_url}" alt="User Avatar" class="avatar" id="avatar" onclick="window.open('${user.html_url}', '_blank')" />
        <div class="profile-info">
            <h2 id="name">${user.name? user.name : user.twitter_username}</h2>
            <span class="username" id="username">@${user.login}</span>
            <p class="bio" id="bio">${user.bio || "No bio available."}</p>
            <div class="profile-stats">
                <div class="stat">
                    <i class="fas fa-users"></i>
                    <span id="followers">${user.followers}</span> followers
                </div>
                <div class="stat">
                    <i class="fas fa-user-friends"></i>
                    <span id="following">${user.following}</span> following
                </div>
                <div class="stat">
                    <i class="fas fa-book"></i>
                    <span id="repos-count">${user.public_repos}</span> repos
                </div>
            </div>
        </div>
    </div>

    <div class="profile-details">
        <div class="detail-card">
            <h3><i class="fas fa-map-marker-alt"></i> Location</h3>
            <p id="location">${user.location || "Not specified"}</p>
        </div>
        <div class="detail-card">
            <h3><i class="fas fa-link"></i> Website</h3>
            <p id="blog">${user.blog || "Not specified"}</p>
        </div>
        <div class="detail-card">
            <h3><i class="fas fa-building"></i> Company</h3>
            <p id="company">${user.company || "Not specified"}</p>
        </div>
        <div class="detail-card">
            <h3><i class="fas fa-calendar-alt"></i> Joined</h3>
            <p id="joined">${new Date(user.created_at).toDateString()}</p>
        </div>
    </div>
    `;
}

const languageColors = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Java: "#b07219",
    C: "#555555",
    "C++": "#f34b7d",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#DEA584",
    "Jupyter Notebook": "#DA5B0B",
}

function displayRepos(repos) {
    reposGrid.style.display = 'grid';
    reposGrid.innerHTML = '';
    if (repos.length === 0) {
        loadingRepos.style.display = 'none';
        reposGrid.innerHTML = '<p>No repositories found.</p>';
        return;
    }
    loadingRepos.style.display = 'none';
    sectionTitle.style.display = 'flex';
    repos.forEach(repo => {
        reposGrid.innerHTML += `
        <div class="repo-card" onclick="window.open('${repo.html_url}', '_blank')">
            <h3 class="repo-name"><i class="fas fa-book"></i> ${repo.name}</h3>
            <p class="repo-desc">${repo.description || 'No description available.'}</p>
            <div class="repo-stats">
                <span class="repo-stat"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                <span class="repo-stat"><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                ${repo.language ? `<span class="repo-stat"><i class="fas fa-circle" style="color: ${languageColors[repo.language] || '#999'}"></i> ${repo.language}</span>` : ''}
            </div>
        </div>
        `;
    });
}
