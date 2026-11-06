// Icelandic alphabetical order. Intl.Collator('is') isn't available in every
// browser (some fall back to English, which puts Á next to A and Æ/Ö in the
// wrong place), so the order is defined here.
const STAFROF = 'aábcdðeéfghiíjklmnoópqrstuúvwxyýzþæö'
const rank = new Map([...STAFROF].map((letter, i) => [letter, i]))

function charKey(ch: string) {
    const r = rank.get(ch)
    // Spaces, digits and punctuation sort before letters, in code point order.
    return r === undefined ? ch.codePointAt(0)! - 0x10000 : r
}

export function islenskSamanburdur(a: string, b: string) {
    const x = a.toLocaleLowerCase('is')
    const y = b.toLocaleLowerCase('is')
    const length = Math.min(x.length, y.length)
    for (let i = 0; i < length; i++) {
        const diff = charKey(x[i]) - charKey(y[i])
        if (diff != 0) return diff
    }
    if (x.length != y.length) return x.length - y.length
    // Same letters: put the capitalised spelling first.
    return a < b ? -1 : a > b ? 1 : 0
}
