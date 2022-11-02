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
