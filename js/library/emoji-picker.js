
let emojiData = {};

function loadEmojiData() {
    return fetch('js/library/emoji-list.json')
        .then(response => response.json())
        .then(data => {
            const categories = {};
            
            Object.keys(data).forEach(categoryName => {
                if (!categories[categoryName]) {
                    categories[categoryName] = [];
                }
                
                data[categoryName].forEach(item => {
                    if (item.emoji) {
                        categories[categoryName].push({
                            emoji: item.emoji,
                            description: item.description || '',
                            keywords: item.keywords || []
                        });
                    }
                });
            });
            
            Object.keys(categories).forEach(key => {
                if (categories[key].length === 0) {
                    delete categories[key];
                }
            });
            
            return categories;
        })
        .catch(error => {
            console.error('Error loading emoji data:', error);
            return {
                "Smileys & People": ["😀", "😃", "😄", "😁", "😊", "😇", "🙂", "😉", "😍", "😘", "😗", "😙", "😋", "😔"],
                "Animals & Nature": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"],
                "Activities": ["🏀", "⚽", "🏆", "🎯", "🎲", "🎳", "🏸", "🎣"],
                "Objects": ["📱", "💻", "📷", "🔍", "⏰", "📚", "📝", "✏️", "📌", "📎", "💼"],
                "Symbols": ["❤️", "👍", "👎", "✅", "❌", "⭐", "🔥", "💯", "🙏", "💪"]
            };
        });
}

window.addEventListener('load', function() {
    initializeCustomEmojiPicker();
});

function initializeCustomEmojiPicker() {
    console.log('Initializing custom emoji picker...');
    
    loadEmojiData().then(data => {
        emojiData = data;
        console.log('Emoji data loaded successfully');
        
        if (!document.getElementById('custom-emoji-picker')) {
            createEmojiPickerElement();
        }
    }).catch(error => {
        console.error('Failed to load emoji data:', error);
    });
    
    const emojiButton = document.getElementById('add-emoji');
    if (emojiButton) {
        console.log('Adding click event to emoji button');
        
        const newEmojiButton = emojiButton.cloneNode(true);
        emojiButton.parentNode.replaceChild(newEmojiButton, emojiButton);
        
        newEmojiButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Emoji button clicked');
            const picker = document.getElementById('custom-emoji-picker');
            if (picker) {
                picker.style.display = 'none';
                setTimeout(() => toggleEmojiPicker(newEmojiButton), 0);
            } else {
                toggleEmojiPicker(newEmojiButton);
            }
        });
    } else {
        console.error('Could not find emoji button with ID "add-emoji"');
    }

    document.addEventListener('click', function(e) {
        const picker = document.getElementById('custom-emoji-picker');
        const emojiButton = document.getElementById('add-emoji');
        
        if (picker && picker.style.display !== 'none') {
            if (!picker.contains(e.target) && e.target !== emojiButton && !emojiButton.contains(e.target)) {
                picker.style.display = 'none';
            }
        }
    });
}

function createEmojiPickerElement() {
    const picker = document.createElement('div');
    picker.id = 'custom-emoji-picker';
    
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'emoji-tabs-container';
    
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'emoji-scroll-container';
    
    const contentContainer = document.createElement('div');
    contentContainer.id = 'emoji-content';
    contentContainer.className = 'emoji-content';
    
    let isFirstTab = true;
    Object.keys(emojiData).filter(category => emojiData[category].length > 0).forEach((category, index) => {
        const tab = document.createElement('div');
        tab.textContent = category.split(' ')[0];
        tab.dataset.category = category;
        tab.title = category;
        tab.className = 'emoji-category-tab';
        
        if (isFirstTab) {
            tab.classList.add('active-tab');
            populateEmojiContent(contentContainer, category);
            isFirstTab = false;
        }
        
        tab.addEventListener('click', function() {
            const tabs = tabsContainer.querySelectorAll('div');
            tabs.forEach(t => {
                t.classList.remove('active-tab');
            });
            this.classList.add('active-tab');
            
            populateEmojiContent(contentContainer, this.dataset.category);
            
            scrollContainer.scrollTop = 0;
        });
        
        tabsContainer.appendChild(tab);
    });
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'emoji-search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search emojis...';
    searchInput.className = 'emoji-search-input';
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        let visibleCount = 0;
        
        const categories = Object.keys(emojiData).filter(category => emojiData[category].length > 0);
        
        if (searchTerm === '') {
            const activeTab = document.querySelector('.emoji-category-tab.active-tab');
            if (activeTab) {
                populateEmojiContent(contentContainer, activeTab.dataset.category);
            }
            return;
        }
        
        contentContainer.innerHTML = '';
        
        const searchTitle = document.createElement('div');
        searchTitle.textContent = 'Search Results';
        searchTitle.className = 'emoji-category-title';
        contentContainer.appendChild(searchTitle);
        
        categories.forEach(category => {
            emojiData[category].forEach(emoji => {
                if (emoji.emoji.toLowerCase().includes(searchTerm) || 
                    emoji.description.toLowerCase().includes(searchTerm) || 
                    emoji.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) {
                    const emojiElement = document.createElement('div');
                    emojiElement.className = 'emoji-item';
                    emojiElement.textContent = emoji.emoji;
                    emojiElement.title = emoji.description;
                    
                    emojiElement.addEventListener('click', function() {
                        insertEmoji(this.textContent);
                        this.classList.add('emoji-selected');
                        setTimeout(() => {
                            this.classList.remove('emoji-selected');
                        }, 300);
                    });
                    
                    contentContainer.appendChild(emojiElement);
                    visibleCount++;
                }
            });
        });
        
        
        if (visibleCount === 0) {
            const noResults = document.createElement('div');
            noResults.textContent = 'No emojis found for "' + searchTerm + '"';
            noResults.style.gridColumn = '1 / -1';
            noResults.className = 'emoji-no-results';
            contentContainer.appendChild(noResults);
        }
    });
    
    searchContainer.appendChild(searchInput);
    
    const bottomPadding = document.createElement('div');
    bottomPadding.className = 'emoji-bottom-padding';
    
    scrollContainer.appendChild(contentContainer);
    
    picker.appendChild(tabsContainer);
    picker.appendChild(searchContainer);
    picker.appendChild(scrollContainer);
    picker.appendChild(bottomPadding);
    
    document.body.appendChild(picker);
}

function populateEmojiContent(container, category) {
    container.innerHTML = '';
    
    if (!emojiData[category] || emojiData[category].length === 0) {
        const noEmojisMessage = document.createElement('div');
        noEmojisMessage.textContent = 'No emojis found in this category';
        noEmojisMessage.style.gridColumn = '1 / -1'; // This is a grid property that needs to be set inline
        noEmojisMessage.className = 'emoji-category-title';
        container.appendChild(noEmojisMessage);
        return;
    }
    
    const categoryTitle = document.createElement('div');
    categoryTitle.textContent = category;
    categoryTitle.className = 'emoji-category-title';
    container.appendChild(categoryTitle);
    
    emojiData[category].forEach(emoji => {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji-item';
        emojiElement.textContent = emoji.emoji;
        emojiElement.title = emoji.description;
        
        emojiElement.addEventListener('click', function() {
            insertEmoji(this.textContent);
            this.classList.add('emoji-selected');
            setTimeout(() => {
                this.classList.remove('emoji-selected');
            }, 350);
        });
        
        container.appendChild(emojiElement);
    });
    
    if (emojiData[category].length > 50) {
        const categoryFooter = document.createElement('div');
        categoryFooter.className = 'emoji-category-footer';
        categoryFooter.style.gridColumn = '1 / -1';
        
        const backToTopButton = document.createElement('button');
        backToTopButton.textContent = '↑';
        backToTopButton.className = 'emoji-back-to-top';
        backToTopButton.title = 'Back to Top';
        
        backToTopButton.addEventListener('click', function() {
            const scrollContainer = document.getElementById('emoji-content').parentElement;
            scrollContainer.scrollTop = 0;
        });
        
        categoryFooter.appendChild(backToTopButton);
        container.appendChild(categoryFooter);
    }
}

function toggleEmojiPicker(emojiButton) {
    const picker = document.getElementById('custom-emoji-picker');
    
    console.log('Current picker display state:', picker.style.display);
    
    if (picker.style.display === 'none' || picker.style.display === '' || getComputedStyle(picker).display === 'none') {
        console.log('Showing emoji picker');
        
        const buttonRect = emojiButton.getBoundingClientRect();
                
        const availableSpaceBelow = window.innerHeight - buttonRect.bottom - 20;
                
        if (availableSpaceBelow < 450) {
            picker.style.top = (buttonRect.top - 450 - 5) + 'px';
        } else {
            picker.style.top = (buttonRect.bottom + 5) + 'px';
        }
        
        const rightEdge = buttonRect.left + 400;
        if (rightEdge > window.innerWidth) {
            picker.style.left = (window.innerWidth - 410) + 'px';
        } else {
            picker.style.left = buttonRect.left + 'px';
        }
        
        picker.style.display = 'flex';
        picker.style.flexDirection = 'column';
        
        setTimeout(() => {
            picker.classList.add('visible');
        }, 10);
    } else {
        picker.classList.remove('visible');
        setTimeout(() => {
            picker.style.display = 'none';
        }, 350);
    }
}

function insertEmoji(emoji) {
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        const startPos = messageTextarea.selectionStart;
        const endPos = messageTextarea.selectionEnd;
        
        const textBefore = messageTextarea.value.substring(0, startPos);
        const textAfter = messageTextarea.value.substring(endPos, messageTextarea.value.length);
        messageTextarea.value = textBefore + emoji + textAfter;
        
        messageTextarea.selectionStart = startPos + emoji.length;
        messageTextarea.selectionEnd = startPos + emoji.length;
        
        messageTextarea.focus();
        
        const picker = document.getElementById('custom-emoji-picker');
        picker.classList.remove('visible');
        setTimeout(() => {
            picker.style.display = 'none';
        }, 350);
    }
}
