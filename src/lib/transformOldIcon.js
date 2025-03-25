export const transformOldIcon = (iconString) => {

    const iconMap = {
        '1/1': '',
        '1/2': '',
        '1/3': 'magnifier-outline',
        '1/4': 'files-outline',
        '1/5': 'heart-outline',
        '1/6': 'star-outline',
        '1/7': 'star-outline',
        '1/8': 'user-outline',
        '1/9': '',
        '1/10': 'category-outline',
        '1/11': 'abstract-29-outline',
        '1/12': 'element-5-outline',
        '1/13': 'check-outline',
        '1/14': 'cross-outline',
        '1/15': '',
        '1/16': '',
        '1/17': '',
        '1/18': 'wifi-outline',
        '1/19': 'setting-2-outline',
        '1/20': 'trash-outline',

        '2/1': 'home-outline',
        '2/2': 'document-outline',
        '2/3': 'time-outline',
        '2/4': '',
        '2/5': '',
        '2/6': 'down-square-outline',
        '2/7': 'up-square-outline',
        '2/8': '',
        '2/9': '',
        '2/10': '',
        '2/11': 'arrows-circle-outline',
        '2/12': 'notepad-outline',
        '2/13': 'lock-outline',
        '2/14': 'flag-outline',
        '2/15': 'speaker-outline',
        '2/16': '',
        '2/17': '',
        '2/18': '',
        '2/19': '',
        '2/20': 'barcode-outline',

        '3/1': 'price-tag-outline',
        '3/2': 'two-credit-cart-outline',
        '3/3': '',
        '3/4': '',
        '3/5': 'printer-outline',
        '3/6': '',
        '3/7': 'text-outline',
        '3/8': 'text-bold-outline',
        '3/9': 'text-italic-outline',
        '3/10': '',
        '3/11': '',
        '3/12': 'textalign-left-outline',
        '3/13': 'textalign-center-outline',
        '3/14': 'textalign-right-outline',
        '3/15': 'textalign-justifycenter-outline',
        '3/16': 'text-circle-outline',
        '3/17': '',
        '3/18': '',
        '3/19': 'youtube-outline',
        '3/20': 'picture-outline',

        '4/1': 'pencil-outline',
        '4/2': 'geolocation-outline',
        '4/3': 'disguise-outline',
        '4/4': 'dribbble-outline',
        '4/5': 'notepad-edit-outline',
        '4/6': 'exit-right-corner-outline',
        '4/7': 'tablet-ok-outline',
        '4/8': 'arrow-two-diagonals-outline',
        '4/9': '',
        '4/10': '',
        '4/11': 'double-down-outline',
        '4/12': 'to-right-outline',
        '4/13': '',
        '4/14': '',
        '4/15': '',
        '4/16': 'double-left-outline',
        '4/17': '',
        '4/18': '',
        '4/19': 'left-outline',
        '4/20': 'right-outline',

        '5/1': 'plus-circle-outline',
        '5/2': 'minus-circle-outline',
        '5/3': 'cross-circle-outline',
        '5/4': 'check-circle-outline',
        '5/5': 'question-2-outline',
        '5/6': 'information-2-outline',
        '5/7': '',
        '5/8': 'cross-circle-outline',
        '5/9': 'check-circle-outline',
        '5/10': '',
        '5/11': 'arrow-left-outline',
        '5/12': 'arrow-right-outline',
        '5/13': 'arrow-up-outline',
        '5/14': 'arrow-down-outline',
        '5/15': '',
        '5/16': '',
        '5/17': '',
        '5/18': 'plus-outline',
        '5/19': 'minus-outline',
        '5/20': '',

        '6/1': 'information-1-outline',
        '6/2': 'gift-outline',
        '6/3': 'spring-framework-outline',
        '6/4': '',
        '6/5': 'eye-outline',
        '6/6': 'eye-slash-outline',
        '6/7': '',
        '6/8': 'airplane-outline',
        '6/9': 'calendar-outline',
        '6/10': 'arrow-mix-outline',
        '6/11': 'message-text-2-outline',
        '6/12': '',
        '6/13': 'up-outline',
        '6/14': 'down-outline',
        '6/15': 'arrows-loop-outline',
        '6/16': 'handcart-outline',
        '6/17': 'folder-outline',
        '6/18': 'folder-added-outline',
        '6/19': 'up-down-outline',
        '6/20': 'right-left-outline',

        '7/1': '',
        '7/2': '',
        '7/3': 'notification-outline',
        '7/4': 'sun-outline',
        '7/5': 'like-outline',
        '7/6': 'dislike-outline',
        '7/7': '',
        '7/8': '',
        '7/9': '',
        '7/10': '',
        '7/11': 'right-square-outline',
        '7/12': 'left-square-outline',
        '7/13': 'up-square-outline',
        '7/14': 'down-square-outline',
        '7/15': '',
        '7/16': 'wrench-outline',
        '7/17': '',
        '7/18': 'filter-outline',
        '7/19': 'office-bag-outline',
        '7/20': 'scan-barcode-outline',
    }

    iconString = iconString.replace(/figura-(black|white)\s*/i, '')

    const colMatch = iconString.match(/c(\d+)/i)
    const rowMatch = iconString.match(/l(\d+)/i)

    if (!colMatch || !rowMatch) {
        return { icon: 'html', type: 'outline' }
    }

    const col = colMatch[1]
    const row = rowMatch[1]
    const key = `${row}/${col}`

    const mappedIcon = iconMap[key] || ''

    if (!mappedIcon) return { icon: 'html', type: 'outline' }

    var iconName, type
    if (mappedIcon.substr(-7) === 'outline') {
        iconName = mappedIcon.slice(0, -8)
        type = 'outline'
    } else if (mappedIcon.substr(-7) === 'duotone') {
        iconName = mappedIcon.slice(0, -8)
        type = 'duotone'
    } else {
        iconName = mappedIcon.slice(0, -6)
        type = 'solid'
    }

    return { icon: iconName, type: type || 'outline' }

}
