export function answerTranslate(answer) {
    let translation;
    switch (answer) {
        case 1:
            translation = 'Jah';
            break;
        case 0:
            translation = 'Ei tea'
            break;
        case -1:
            translation = 'Ei'
            break;
    }
    return translation;
}
