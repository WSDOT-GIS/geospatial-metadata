(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.gisMetadata = factory();
    }
}(this, function () {
    function toObject(node) {
        var output;
        var currentNode;

        if (node.childNodes && node.childNodes.length > 0) {
            output = {};
            for (var i = 0; i < node.childNodes.length; i++) {
                currentNode = node.childNodes[i];
                if (currentNode instanceof Text) {

                    output = currentNode.textContent;
                } else {
                    output[currentNode.nodeName] = toObject(currentNode);
                }

            }
        } else {
            output = node.textContent;
        }

        return output;
    }

    function toHtmlFragment(node) {
        var output;
        var currentNode;

        var heading, section;

        if (node.childNodes && node.childNodes.length > 0) {
            output = document.createDocumentFragment();
            for (var i = 0; i < node.childNodes.length; i++) {
                currentNode = node.childNodes[i];
                if (currentNode instanceof Text) {
                    output.appendChild(document.createTextNode(currentNode.textContent));
                } else {
                    heading = document.createElement("h1");
                    heading.textContent = currentNode.nodeName;

                    section = document.createElement("section");
                    section.appendChild(heading);
                    section.appendChild(toHtmlFragment(currentNode));
                    output.appendChild(section);
                }

            }
        } else {
            output = document.createTextNode(currentNode.textContent);
        }

        return output;
    }

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return {
        toObject: toObject,
        toHtmlFragment: toHtmlFragment
    };
}));