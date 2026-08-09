// Cette fonction composable fournit des fonctions et des données initiales pour la configuration d'un site web, y compris les paramètres d'en-tête, de pied de page et de site global.
export function useSiteInitialization() {
    const initializeHeader = () => ({
        enabled: false,
        logo: null,
        logoText: '',
        logoAlign: 'center',
        logoShape: 'square',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        height: '80px'
    })

    // Fonction pour initialiser la configuration du pied de page
    const initializeFooter = () => ({
        enabled: false,
        companyName: '',
        companyDescription: '',
        logo: null,
        logoShape: 'square',
        email: '',
        phone: '',
        address: '',
        socialLinks: [],
        copyrightText: '',
        backgroundColor: '#333333',
        textColor: '#ffffff'
    })

    // Fonction pour initialiser la configuration complète d'un site
    const initializeSite = () => ({
        id: null,
        name: '',
        slug: '',
        config: {
            // SEO & Métadonnées
            title: '',
            description: '',
            author: '',
            language: 'fr',
            ogImage: '',
            favicon: '',

            // Theme global
            theme: {
                colorPalette: 'default',
                primaryColor: '#1976d2',
                secondaryColor: '#424242',
                accentColor: '#82b1ff',
                successColor: '#4caf50',
                warningColor: '#ff9800',
                errorColor: '#f44336',
                titleFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                bodyFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                borderRadius: 'medium',
                spacing: 'medium'
            },

            // Apparence de fond
            backgroundColor: '#ffffff',
            textColor: '#000000',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            fontSize: '16px',

            // Fond desktop (format mobile-first 400px)
            desktopBackground: {
                type: 'color',
                color: '#f5f5f5',
                image: null,
                gradientStart: '#667eea',
                gradientEnd: '#764ba2',
                gradientDirection: 'to bottom'
            },

            // Options avancées
            smoothScroll: true,

            header: initializeHeader(),
            footer: initializeFooter(),
            sections: []
        },
        sections: []
    })

    // Liste des polices disponibles pour la sélection
    const fonts = [
        { label: 'System Sans', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
        { label: 'Roboto', value: "'Roboto', sans-serif" },
        { label: 'Serif (Georgia)', value: "Georgia, serif" },
        { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
        { label: 'Monospace', value: "'Courier New', monospace" }
    ]

    // Types de sections disponibles pour l'ajout
    const sectionTypeBtns = [
        { label: 'Texte', value: 'text', icon: 'article' },
        { label: 'Image', value: 'image', icon: 'image' },
        { label: 'Hero', value: 'hero', icon: 'photo_size_select_large' }
    ]

    // Retourne les fonctions et données d'initialisation
    return {
        initializeHeader,
        initializeFooter,
        initializeSite,
        fonts,
        sectionTypeBtns
    }
}
