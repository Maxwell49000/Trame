export function siteAccessWhere(user, id) {
    if (!user?.id || !['USER', 'ADMIN'].includes(user.role)) throw new Error('Utilisateur invalide')
    return {
        ...(id && { id }),
        ...(user.role !== 'ADMIN' && { owner_id: user.id })
    }
}
