//@ts-check

function defaultKeyAcessor(item) {
    return item.id
}

export function getListDataDiff(oldData, newData, keyAccessor = defaultKeyAcessor) {
    const oldDataKeys = new Map(oldData.entries())
    const { enter, update } = newData.reduce((acc, item) => {
        const key = keyAccessor(item)
        if (oldDataKeys.has(key)) {
            acc.update.set(key, item)
            oldDataKeys.delete(key)
        } else {
            acc.enter.set(key, item)
        }
        return acc
    }, {
        enter: new Map(),
        update: new Map(),
    })

    return {
        enter,
        exit: oldDataKeys,
        update,
    }
}

export function debounce(fn, time = 300) {
    let timerId

    return (...args) => {
        clearTimeout(timerId)
        timerId = setTimeout(() => fn(...args), time)
    }
}

export function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export function getFromLs(itemName) {
    return isOverridden(itemName) ? localStorage.getItem(itemName) === 'true' : true
}

export function isOverridden(itemName) {
    return (typeof localStorage.getItem(itemName)) === 'string'
}

export function mapArrayToObjectId(array) {
    return array.reduce((acc, el) => {
        acc[el.id] = el
        return acc
    }, {})
}
