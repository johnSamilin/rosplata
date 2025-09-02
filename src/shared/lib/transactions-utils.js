import { allowedUserStatuses } from "../config/user-statuses"

export function filterBannedUserTransactions(transactions = [], users = [], shouldIgnore) {
    const bannedUsers = new Set(
        users
            .filter(user => !allowedUserStatuses.includes(user.status))
            .map(user => user.userId)
    )
    return transactions.map(transaction => ({
        ...transaction,
        banned: shouldIgnore ? bannedUsers.has(transaction.ownerId) : false,
    }))
}