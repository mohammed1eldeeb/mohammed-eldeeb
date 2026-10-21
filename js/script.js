/* 
 * Project: Mohammed El-Deeb Portfolio
 * Description: Core JavaScript logic with Theme, Language Switching, and Firebase Integration
 */

// Firebase Configuration (will be loaded from firebase-config.js)
let db, storage;

// Initialize Firebase when available
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is available
    if (typeof firebase !== 'undefined') {
        db = firebase.firestore();
        storage = firebase.storage();
        
        // Load dynamic content from Firebase
        loadDynamicContent();
    }
});

// Load dynamic content from Firebase
async function loadDynamicContent() {
    try {
        // Load projects for portfolio pages
        if (window.location.pathname.includes('portfolio.html') || 
            window.location.pathname.includes('index.html')) {
            await loadProjectsFromFirebase();
        }
        
        // Load hero content
        await loadHeroContent();
        
        // Load contact info
        await loadContactInfo();
        
    } catch (error) {
        console.error('Error loading dynamic content:', error);
    }
}

// Load projects from Firebase
async function loadProjectsFromFirebase() {
    try {
        const snapshot = await db.collection('projects')
            .orderBy('createdAt', 'desc')
            .get();
        
        const projects = [];
        snapshot.forEach(doc => {
            projects.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Update projects grid
        updateProjectsGrid(projects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        // Keep static projects as fallback
    }
}

// Update projects grid with Firebase data
function updateProjectsGrid(projects) {
    const projectGrids = document.querySelectorAll('.projects-grid');
    const currentLang = document.documentElement.lang || 'en';
    
    projectGrids.forEach(grid => {
        if (projects.length === 0) return;
        
        const isMainPage = grid.closest('.latest-projects') !== null;
        const displayProjects = isMainPage ? projects.slice(0, 3) : projects;
        
        const projectCards = displayProjects.map(project => {
            const thumbnail = project.images && project.images.length > 0 
                ? project.images[0] 
                : 'images/project-placeholder.png';
            
            // Get content based on current language
            const title = getLocalizedContent(project, 'title', currentLang);
            const subtitle = getLocalizedContent(project, 'subtitle', currentLang);
            const category = getLocalizedContent(project, 'category', currentLang);
            const views = project.views || '';
            
            return `
                <div class="project-card" onclick="window.location.href='project.html?id=${project.id}'">
                    <div class="project-thumb">
                        <img src="${thumbnail}" alt="${title}" class="project-img" 
                             onerror="this.src='images/project-placeholder.png'">
                    </div>
                    <div class="project-info">
                        <div class="project-cat">${category}</div>
                        <h3>${title}${subtitle ? ' ' + subtitle : ''}</h3>
                    </div>
                </div>
            `;
        }).join('');
        
        grid.innerHTML = projectCards;
    });
}

// Helper function to get localized content
function getLocalizedContent(project, field, lang) {
    if (lang === 'ar') {
        return project[field] || project[field + 'En'] || 'محتوى غير متاح';
    } else {
        return project[field + 'En'] || project[field] || 'Content not available';
    }
}

// Enhanced project loading with language support
async function loadProjectsFromFirebase() {
    try {
        const currentLang = document.documentElement.lang || 'en';
        const snapshot = await db.collection('projects')
            .orderBy('order', 'desc')
            .get();
        
        const projects = [];
        snapshot.forEach(doc => {
            const projectData = {
                id: doc.id,
                ...doc.data()
            };
            
            // Only show published & active projects on the public site
            const state = projectData.state || 'active';
            const status = projectData.status || 'published';
            if (state !== 'active' || status !== 'published') return;
            
            // Ensure project has both language versions
            if (currentLang === 'ar' && !projectData.title && projectData.titleEn) {
                projectData.title = projectData.titleEn;
            } else if (currentLang === 'en' && !projectData.titleEn && projectData.title) {
                projectData.titleEn = projectData.title;
            }
            
            projects.push(projectData);
        });
        
        // Update projects grid only if we have Firebase projects
        if (projects.length > 0) {
            updateProjectsGrid(projects);
        }
        
    } catch (error) {
        console.error('Error loading projects:', error);
        // Keep static projects as fallback
    }
}

// Enhanced hero content loading with language support
async function loadHeroContent() {
    try {
        const currentLang = document.documentElement.lang || 'en';
        const doc = await db.collection('content').doc('hero').get();
        
        if (doc.exists) {
            const heroData = doc.data();
            
            // Update hero title based on language
            const heroTitle = document.querySelector('.hero h1[data-i18n="heroTitle"]');
            if (heroTitle) {
                if (currentLang === 'ar' && heroData.title) {
                    heroTitle.textContent = heroData.title;
                } else if (currentLang === 'en' && heroData.titleEn) {
                    heroTitle.textContent = heroData.titleEn;
                }
            }
            
            // Update hero description based on language
            const heroDesc = document.querySelector('.hero p[data-i18n="heroDesc"]');
            if (heroDesc) {
                if (currentLang === 'ar' && heroData.description) {
                    heroDesc.textContent = heroData.description;
                } else if (currentLang === 'en' && heroData.descriptionEn) {
                    heroDesc.textContent = heroData.descriptionEn;
                }
            }
        }
    } catch (error) {
        console.error('Error loading hero content:', error);
    }
}

// Load contact information from Firebase
async function loadContactInfo() {
    try {
        const doc = await db.collection('content').doc('contact').get();
        
        if (doc.exists) {
            const contactData = doc.data();
            
            // Update email
            const emailElements = document.querySelectorAll('a[href^="mailto:"]');
            emailElements.forEach(el => {
                if (contactData.email) {
                    el.href = `mailto:${contactData.email}`;
                    el.textContent = contactData.email;
                }
            });
            
            // Update phone
            const phoneElements = document.querySelectorAll('a[href^="tel:"]');
            phoneElements.forEach(el => {
                if (contactData.phone) {
                    el.href = `tel:${contactData.phone}`;
                }
            });
            
            // Update WhatsApp
            const whatsappElements = document.querySelectorAll('a[href*="wa.me"]');
            whatsappElements.forEach(el => {
                if (contactData.whatsapp) {
                    el.href = `https://wa.me/${contactData.whatsapp.replace(/[^\d]/g, '')}`;
                }
            });
            
            // Update social links
            if (contactData.linkedin) {
                const linkedinElements = document.querySelectorAll('a[href*="linkedin"]');
                linkedinElements.forEach(el => {
                    el.href = contactData.linkedin;
                });
            }
            
            if (contactData.tiktok) {
                const tiktokElements = document.querySelectorAll('a[href*="tiktok"]');
                tiktokElements.forEach(el => {
                    el.href = contactData.tiktok;
                });
            }
        }
    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

// Function to get project details by ID
async function getProjectById(projectId) {
    try {
        const doc = await db.collection('projects').doc(projectId).get();
        
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error getting project:', error);
        return null;
    }
}

const langData = {
    en: {
        home: "Home",
        portfolio: "Portfolio",
        resume: "Resume",
        contact: "Contact",
        downloadCV: "Download CV",
        heroTitle: "Crafting Engaging Content & <span class='text-gradient'>Building Communities.</span>",
        heroDesc: "Social Media Specialist & Content Strategist focused on creative copywriting, video scripting, and data-driven growth.",
        viewWork: "View My Case Studies",
        contactMe: "Start a Project",
        myExpertise: "My Expertise",
        latestProjects: "Selected Works",
        viewAllProjects: "View All Projects",
        connect: "Let's Connect",
        quickLinks: "Navigation",
        contentCreation: "Content Creation",
        contentCreationDesc: "Writing compelling copy that captures attention and reflects the brand's unique identity.",
        videoScripting: "Video Scripting",
        videoScriptingDesc: "Creating engaging scripts for Reels and TikTok designed to maximize retention.",
        accountOptimization: "Account Setup",
        accountOptimizationDesc: "Building and optimizing social media profiles from scratch for maximum visibility.",
        insightsAnalysis: "Insights Analysis",
        insightsAnalysisDesc: "Analyzing performance data and metrics to achieve brand goals and boost awareness.",
        copyright: "Mohammed El-Deeb. All Rights Reserved.",
        royalSweetTitle: "Royal Sweet (+900% Engagement)",
        royalSweetCat: "Digital Recovery & Restructuring",
        saudiFashionTitle: "Project Horizon - Saudi Fashion (1.3M Views)",
        saudiFashionCat: "Social Media & Community",
        myArsenalTitle: "Technical Arsenal & Skills",
        strategicSkills: "Strategic Skills",
        platformsTools: "Platforms & Tools",
        cm: "Community Management",
        trend: "Trend Hijacking",
        persona: "Audience Persona",
        growth: "Growth Hacking",
        competitor: "Competitor Analysis",
        personalBranding: "Personal Branding",
        aiAutomation: "AI & Automation",
        aiTools: "AI Content Generation",
        automation: "Workflow Automation",
        marketsDialects: "Markets & Copywriting",
        saudiDialect: "Saudi Market & Dialect",
        omaniMarket: "Omani Market",
        egyptianMarket: "Egyptian Market"
    },
    ar: {
        home: "الرئيسية",
        portfolio: "معرض الأعمال",
        resume: "السيرة الذاتية",
        contact: "اتصل بي",
        downloadCV: "تحميل السيرة الذاتية",
        heroTitle: "صناعة محتوى إبداعي وبناء <span class='text-gradient'>مجتمعات رقمية متفاعلة.</span>",
        heroDesc: "متخصص سوشيال ميديا وصانع استراتيجيات محتوى (Content Strategist). أركز على الكتابة الإبداعية، إعداد سكربتات الفيديو، والنمو المبني على الأرقام.",
        viewWork: "شاهد قصص النجاح",
        contactMe: "ابدأ مشروعك",
        myExpertise: "مجالات خبرتي",
        latestProjects: "أحدث المشاريع",
        viewAllProjects: "عرض كل الأعمال",
        connect: "تواصل معي",
        quickLinks: "روابط سريعة",
        contentCreation: "كتابة المحتوى",
        contentCreationDesc: "كتابة بوستات وتغريدات إبداعية تشد الانتباه وتعكس هوية البراند بشكل جذاب.",
        videoScripting: "سكربتات الفيديو",
        videoScriptingDesc: "إعداد سكربتات قوية لمنصات Reels و TikTok مصممة لزيادة التفاعل والاحتفاظ بالمشاهد.",
        accountOptimization: "تهيئة الحسابات",
        accountOptimizationDesc: "بناء وتجهيز حسابات السوشيال ميديا من الصفر وضبط الواجهة بشكل احترافي.",
        insightsAnalysis: "تحليل الـ Insights",
        insightsAnalysisDesc: "تحليل الأرقام وأداء المحتوى لضمان تحقيق أهداف البراند وزيادة الـ Awareness.",
        copyright: "محمد الديب. جميع الحقوق محفوظة.",
        royalSweetTitle: "رويال سويت (+900% Engagement)",
        royalSweetCat: "الـ Digital Recovery",
        saudiFashionTitle: "بروجكت هورايزون - أزياء سعودية (1.3M Views)",
        saudiFashionCat: "إدارة الـ Social Media",
        myArsenalTitle: "الترسانة التقنية والمهارات",
        strategicSkills: "المهارات الاستراتيجية",
        platformsTools: "الأدوات والمنصات",
        cm: "إدارة المجتمعات الرقمية",
        trend: "ركوب التريند (Trend Hijacking)",
        persona: "بناء الـ Audience Persona",
        growth: "اختراق النمو (Growth Hacking)",
        competitor: "تحليل المنافسين",
        personalBranding: "صناعة العلامة الشخصية (Personal Branding)",
        aiAutomation: "الذكاء الاصطناعي والأتمتة",
        aiTools: "توليد المحتوى بالـ AI",
        automation: "أتمتة المهام (Automation)",
        marketsDialects: "الأسواق وصناعة المحتوى",
        saudiDialect: "السوق واللهجة السعودية",
        omaniMarket: "السوق العُماني",
        egyptianMarket: "السوق المصري"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const themeBtn = document.getElementById('theme-toggle');
    const langBtn = document.getElementById('lang-toggle');

    // --- State ---
    let currentLang = localStorage.getItem('lang') || 'en';
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // --- Init ---
    applyTheme(currentTheme);
    applyLanguage(currentLang);

    // --- Event Listeners ---
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme);
            localStorage.setItem('theme', currentTheme);
        });
    }

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'ar' : 'en';
            applyLanguage(currentLang);
            localStorage.setItem('lang', currentLang);
        });
    }

    // --- Functions ---

    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            themeBtn.innerHTML = "<i class='bx bx-moon'></i>";
        } else {
            document.body.classList.remove('light-mode');
            themeBtn.innerHTML = "<i class='bx bx-sun'></i>";
        }
    }

    function applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        langBtn.textContent = lang === 'ar' ? 'EN' : 'عربي';

        // Translate specific elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (langData[lang][key]) {
                el.innerHTML = langData[lang][key];
            }
        });

        // Toggle Font Family (handled in CSS via [lang="ar"])
    }

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // --- Inject Floating CTAs ---
    function injectFloatingCTAs() {
        if (!document.querySelector('.floating-ctas')) {
            const fabContainer = document.createElement('div');
            fabContainer.className = 'floating-ctas';
            fabContainer.innerHTML = `
                <a href="https://wa.me/+201000187366" target="_blank" class="fab-btn whatsapp" title="WhatsApp">
                    <i class='bx bxl-whatsapp'></i>
                </a>
                <a href="https://www.linkedin.com/in/mohammed-eldeeb-8d9" target="_blank" class="fab-btn linkedin" title="LinkedIn">
                    <i class='bx bxl-linkedin'></i>
                </a>
            `;
            document.body.appendChild(fabContainer);
        }
    }
    injectFloatingCTAs();
});
