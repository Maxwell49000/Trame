// Cette fonction composable fournit une interface pour télécharger des fichiers avec des options de validation.
export function useFileUpload() {
    function openFilePicker(options = {}) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = options.accept || '*/*'

            // Gestion de la sélection de fichier
            input.onchange = async (ev) => {
                const file = ev.target.files?.[0]
                if (!file) {
                    reject(new Error('No file selected'))
                    return
                }

                // Validation de la taille du fichier
                const maxSize = options.maxSize || 5 * 1024 * 1024
                if (file.size > maxSize) {
                    reject(new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`))
                    return
                }

                // Validation du type de fichier
                if (options.acceptedTypes) {
                    const isValidType = options.acceptedTypes.some(type => file.type.startsWith(type))
                    if (!isValidType) {
                        reject(new Error(`Invalid file type. Accepted: ${options.acceptedTypes.join(', ')}`))
                        return
                    }
                }

                resolve(file)
            }

            // Gestion des erreurs de lecture de fichier
            input.onerror = () => reject(new Error('Error reading file'))
            input.click()
        })
    }

    // Retourne la fonction d'ouverture du sélecteur de fichiers
    return {
        openFilePicker
    }
}
