// Composable pour la gestion du thème et des styles globaux
export function useTheme() {
    const getBorderRadiusValue = (radius) => {
        const values = {
            none: '0px',
            small: '4px',
            medium: '8px',
            large: '16px'
        }
        return values[radius] || values.medium
    }

    // Fonction pour obtenir la valeur d'espacement
    const getSpacingValue = (spacing) => {
        const values = {
            compact: '12px',
            medium: '20px',
            spacious: '32px'
        }
        return values[spacing] || values.medium
    }

    // Fonction pour obtenir la valeur de padding
    const getPaddingValue = (spacing) => {
        const values = {
            compact: '20px',
            medium: '40px',
            spacious: '60px'
        }
        return values[spacing] || values.medium
    }

    // Fonction pour appliquer le thème à un élément donné
    const applyThemeToElement = (element, theme) => {
        if (!element || !theme) return element

        // Appliquer les valeurs du thème
        if (element.style) {
            element.style.borderRadius = getBorderRadiusValue(theme.borderRadius)
            element.style.fontFamily = theme.bodyFont || element.style.fontFamily
            element.style.textColor = theme.secondaryColor || element.style.textColor
        }

        // Pour les sections hero
        if (element.type === 'hero') {
            element.heroOverlayColor = theme.primaryColor || element.heroOverlayColor
        }

        return element
    }

    // Retourne les fonctions utilitaires
    return {
        getBorderRadiusValue,
        getSpacingValue,
        getPaddingValue,
        applyThemeToElement
    }
}
