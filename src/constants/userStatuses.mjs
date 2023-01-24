export const PARTICIPANT_STATUSES = {
    UNKNOWN: -1,
    INVITED: 0,
    ACTIVE: 1,
    BANNED: 2,
    REFUSED: 3,
    OWNER: 4,
  };

export const allowedUserStatuses = [
    PARTICIPANT_STATUSES.OWNER,
    PARTICIPANT_STATUSES.ACTIVE,
]