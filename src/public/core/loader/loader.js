export function copyAllChildren(fromElement, toElement) {
    while (fromElement.firstChild) {
        toElement.appendChild(fromElement.firstChild);
    }
}