let document: any;
let window: any;

export default 
function FlattenStyles() {

    const defaultStyles = new Map();

    function getDefaultStyles(e) {
        let d = defaultStyles.get(e.tagName);
        if (!d) {
            d = {};
            const de = document.createElement(e.tagName);
            document.body.appendChild(de);
            const computedStyle = window.getComputedStyle(de);
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let index = 0; index < computedStyle.length; index++) {
                const key = computedStyle[index];
                const value = computedStyle[key];
                d[key] = value;
            }
            defaultStyles.set(e.tagName, d);
            de.remove();
        }
        return d;
    }

    function setStyle(e) {

        const ds = getDefaultStyles(e);

        const cs = window.getComputedStyle(e);

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let index = 0; index < cs.length; index++) {
            const key = cs[index];
            const value = cs[key];
            if (ds[key] === value) {
                continue;
            }
            e.style[key] = value;
        }

        const children = e.children;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let index = 0; index < children.length; index++) {
            const element = children[index];
            setStyle(element as any);
        }
    }

    const array = document.body.children;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        setStyle(element as any);
    }

}