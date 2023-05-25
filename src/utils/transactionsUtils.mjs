import { allowedUserStatuses } from "../constants/userStatuses.mjs"

export function filterBannedUserTransactions(transactions, users, shouldIgnore) {
    if (!shouldIgnore) {
        return transactions
    }
    const bannedUsers = new Set(
        users
        .filter(user => !allowedUserStatuses.includes(user.status))
        .map(user => user.userId)
        )
        debugger
    return transactions.map(transaction => {
        if (bannedUsers.has(transaction.ownerId)) {
            transaction.deleted = true
        }
        return transaction
    })
}
