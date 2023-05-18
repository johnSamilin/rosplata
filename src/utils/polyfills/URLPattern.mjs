window.URLPattern = function (options) {
    const { pathname, baseUrl } = options

    let enumsCount = 0

    const urlParts = pathname.split('/').map(part => {
        let type = 'part', mandatory = false, name, values
        const isVariable = part.startsWith(':')
        const isEnum = part.startsWith('(')
        if (isVariable || isEnum) {
            mandatory = !part.endsWith('?')
            if (isVariable) {
                type = 'variable'
                name = part.substring(1, mandatory ? part.length : part.length - 1)
            } else {
                type = 'enum'
                name = enumsCount
                enumsCount++
                values = part.replace(/[\(\)?]*/g, '').split('|')
            }
        } else {
            name = part.substring(0, part.length)
        }
        return {
            type,
            mandatory,
            name,
            values,
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
            if (uPart.type === 'enum') {
                if (uPart.mandatory) {
                    isMatching = uPart.values.includes(part)
                    continue
                }
                
                isMatching = part.length > 0
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
            if (urlParts[index]?.type === 'variable' || urlParts[index]?.type === 'enum') {
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

