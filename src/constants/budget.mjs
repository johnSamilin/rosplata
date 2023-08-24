import { CURRENCIES } from "./currencies.mjs";
import { PARTICIPANT_STATUSES } from "./userStatuses.mjs";

export const DEFAULT_BUDGET = {
    id: 'unknown',
    name: 'Local budget',
    userId: '',
    transactions: [],
    participants: [],
    currency: CURRENCIES[1],
    type: 'open',
    currentUserStatus: PARTICIPANT_STATUSES.UNKNOWN,
}
