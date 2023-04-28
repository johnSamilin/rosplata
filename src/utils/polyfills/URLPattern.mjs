window.URLPattern = function (options) {
    const { pathname, baseUrl } = options

    const urlParts = pathname.split('/').map(part => {
        let type = 'part', mandatory = false, name
        if (part.startsWith(':')) {
            type = 'variable'
            mandatory = part.endsWith('?')
            name = part.substring(1, mandatory ? part.length - 1 : part.length)
        } else {
            name = part.substring(0, part.length)
        }
        return {
            type,
            mandatory,
            name,
        }
    })

    function test(url) {
        const relativePath = url.split(baseUrl)[1].split('/')
        let isMatching = false
        for (let index = 0; index < relativePath.length; index++) {
            const part = relativePath[index]
            const uPart = urlParts[index]
            if (!uPart) {
                isMatching = false
                break
            }
            if (uPart.type === 'variable') {
                if (uPart.mandatory) {
                    isMatching = part.length > 0
                    continue
                }

                isMatching = true
                continue
            }

            isMatching = relativePath[index] === uPart.name
        }

        return isMatching
    }

    function exec(url) {
        const groups = {}
        const relativePath = url.split(baseUrl)[1].split('/')
        relativePath.forEach((part, index) => {
            if (urlParts[index]?.type === 'variable') {
                groups[urlParts[index].name] = part
            }
        })

        return {
            pathname: {
                groups,
            }
        }
    }

    return {
        urlParts,
        test,
        exec,
    }
}

