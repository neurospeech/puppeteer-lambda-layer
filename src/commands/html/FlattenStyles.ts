let document: any;
let window: any;

export default function FlattenStyles() {

    function setStyle(theElement) {
        var els = theElement.children;
        for(var i = 0, maxi = els.length; i < maxi; i++)
        {
            setStyle(els[i]);
    
            var defaultElem = document.createElement(els[i].nodeName)
            var child = document.body.appendChild(defaultElem);
            var defaultsStyles = window.getComputedStyle(defaultElem,null);     
    
            var computed = window.getComputedStyle(els[i],null).cssText;
    
            for(var j = 0, maxj = defaultsStyles.length; j < maxj; j++)
            {
                var defaultStyle = defaultsStyles[j] + ": " + defaultsStyles.getPropertyValue(""+defaultsStyles[j]) + ";"
                if(computed.startsWith(defaultStyle)) {
                    computed = computed.substring(defaultStyle.length);
                } else {
                    computed = computed.replace(" " + defaultStyle, "");
                }
            }
    
            child.remove();
    
            els[i].setAttribute("style", computed);
        }
    }

    const array = document.body.querySelectorAll("*");
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        setStyle(element);
    }
    
}