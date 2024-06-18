/**
 * Copyright (C) 2015 Wasabeef
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 "use strict";

const RE = {};

RE.editor = document.getElementById('editor');

// Not universally supported, but seems to work in iOS 7 and 8
document.addEventListener("selectionchange", function() {
    RE.backuprange();
});

//looks specifically for a Range selection and not a Caret selection
RE.rangeSelectionExists = function() {
    //!! coerces a null to bool
    var sel = document.getSelection();
    if (sel && sel.type == "Range") {
        return true;
    }
    return false;
};

RE.rangeOrCaretSelectionExists = function() {
    //!! coerces a null to bool
    var sel = document.getSelection();
    if (sel && (sel.type == "Range" || sel.type == "Caret")) {
        return true;
    }
    return false;
};

RE.editor.addEventListener("input", function() {
    RE.updatePlaceholder();
    RE.backuprange();
    RE.callback("input");
});

RE.editor.addEventListener("focus", function() {
    RE.backuprange();
    RE.callback("focus");
});

RE.editor.addEventListener("blur", function() {
    RE.callback("blur");
});

RE.customAction = function(action) {
    RE.callback("action/" + action);
};

RE.updateHeight = function() {
    RE.callback("updateHeight");
}

RE.callbackQueue = [];
RE.runCallbackQueue = function() {
    if (RE.callbackQueue.length === 0) {
        return;
    }

    setTimeout(function() {
        window.location.href = "re-callback://";
        //window.webkit.messageHandlers.iOS_Native_FlushMessageQueue.postMessage("re-callback://")
    }, 0);
};

RE.getCommandQueue = function() {
    var commands = JSON.stringify(RE.callbackQueue);
    RE.callbackQueue = [];
    return commands;
};

RE.callback = function(method) {
    RE.callbackQueue.push(method);
    RE.runCallbackQueue();
};

RE.setHtml = function(contents) {
    var tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = contents;
    var images = tempWrapper.querySelectorAll("img");

    for (var i = 0; i < images.length; i++) {
        images[i].onload = RE.updateHeight;
    }

    RE.editor.innerHTML = tempWrapper.innerHTML;
    RE.updatePlaceholder();
};

RE.getHtml = function() {
    return RE.editor.innerHTML;
};

RE.getText = function() {
    return RE.editor.innerText;
};

RE.setBaseTextColor = function(color) {
    RE.editor.style.color  = color;
};

RE.setPlaceholderText = function(text) {
    RE.editor.setAttribute("placeholder", text);
};

RE.updatePlaceholder = function() {
    if (RE.editor.innerHTML.indexOf('img') !== -1 || RE.editor.innerHTML.length > 0) {
        RE.editor.classList.remove("placeholder");
    } else {
        RE.editor.classList.add("placeholder");
    }
};

RE.removeFormat = function() {
    document.execCommand('removeFormat', false, null);
};

RE.setFontSize = function(size) {
    RE.editor.style.fontSize = size;
};

RE.setBackgroundColor = function(color) {
    RE.editor.style.backgroundColor = color;
};

RE.setHeight = function(size) {
    RE.editor.style.height = size;
};

RE.undo = function() {
    document.execCommand('undo', false, null);
};

RE.redo = function() {
    document.execCommand('redo', false, null);
};

RE.setBold = function() {
    document.execCommand('bold', false, null);
};

RE.setItalic = function() {
    document.execCommand('italic', false, null);
};

RE.setSubscript = function() {
    document.execCommand('subscript', false, null);
};

RE.setSuperscript = function() {
    document.execCommand('superscript', false, null);
};

RE.setStrikeThrough = function() {
    document.execCommand('strikeThrough', false, null);
};

RE.setUnderline = function() {
    document.execCommand('underline', false, null);
};

RE.setTextColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('foreColor', false, color);
    document.execCommand("styleWithCSS", null, false);
};

RE.setTextBackgroundColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('hiliteColor', false, color);
    document.execCommand("styleWithCSS", null, false);
};

RE.setHeading = function(heading) {
    document.execCommand('formatBlock', false, '<h' + heading + '>');
};

RE.setIndent = function() {
    document.execCommand('indent', false, null);
};

RE.setOutdent = function() {
    document.execCommand('outdent', false, null);
};

RE.setOrderedList = function() {
    document.execCommand('insertOrderedList', false, null);
};

RE.setUnorderedList = function() {
    document.execCommand('insertUnorderedList', false, null);
};

RE.setJustifyLeft = function() {
    document.execCommand('justifyLeft', false, null);
};

RE.setJustifyCenter = function() {
    document.execCommand('justifyCenter', false, null);
};

RE.setJustifyRight = function() {
    document.execCommand('justifyRight', false, null);
};

RE.getLineHeight = function() {
    return RE.editor.style.lineHeight;
};

RE.setLineHeight = function(height) {
    RE.editor.style.lineHeight = height;
};

RE.insertImage = function(url, alt) {
    var img = document.createElement('img');
    img.setAttribute("src", url);
    img.setAttribute("alt", alt);
    img.onload = RE.updateHeight;

    RE.insertHTML(img.outerHTML);
    RE.callback("input");
};

RE.isItalic = function() {
    return document.queryCommandState("Italic");
};

RE.isBold = function() {
    return document.queryCommandState("Bold");
};

RE.isBlockquote = function() {
    
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0)
        var node = range.startContainer;
        
        return parentBlockquoteNode(node) != null;
    }
    
    return false
};

RE.isUndoAvailable = function() {
    return document.queryCommandEnabled('undo');
};

RE.isRedoAvailable = function() {
    return document.queryCommandEnabled('redo');
};

RE.setBlockquote = function() {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        var node = selection.getRangeAt(0).startContainer;
        
        if (parentBlockquoteNode(node) != null) {
            document.execCommand('outdent', false, null);
        } else {
            document.execCommand('formatBlock', false, '<blockquote>');
        }
    } else {
        document.execCommand('formatBlock', false, '<blockquote>');
    }
};

function parentBlockquoteNode(x) {
    do {
        if (x.nodeName === "BLOCKQUOTE") return x
            } while (x = x.parentElement);
    
    return null;
}

RE.insertHTML = function(html) {
    RE.restorerange();
    document.execCommand('insertHTML', false, html);
};

RE.insertLink = function(url, title) {
    RE.restorerange();
    var sel = document.getSelection();
    if (sel.toString().length !== 0 && sel.rangeCount) {
        var el = document.createElement("a");
        el.setAttribute("href", url);
        el.setAttribute("title", title);
        
        var range = sel.getRangeAt(0).cloneRange();
        
        if ($(range.startContainer).parents('a[href]').length > 0) {
            // We are already in a url, just change the link to match if there is a link otherwise clear it
            if (url.length > 0) {
                $(range.startContainer).parents('a[href]').attr("href", url)
            } else {
                $(range.startContainer).parents('a[href]').contents().unwrap()
            }
        } else {
            if (url.length > 0) {
                if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
                    // If the range is within a single text node, surround it
                    range.surroundContents(el);
                } else {
                    // Otherwise, extract the contents, wrap them, and insert back
                    var docFragment = range.extractContents();
                    el.appendChild(docFragment);
                    range.insertNode(el);
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else {
        if (url.length > 0) {
            var html = '<a href="' + url + '">' + title + '</a>';
            RE.insertHTML(html);
        }
    }
    RE.callback("input");
};

RE.getSelectedText = function(){
    return document.getSelection().toString();
};

RE.prepareInsert = function() {
    RE.backuprange();
};

RE.backuprange = function() {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        RE.currentSelection = {
            "startContainer": range.startContainer,
            "startOffset": range.startOffset,
            "endContainer": range.endContainer,
            "endOffset": range.endOffset
        };
    }
};

RE.addRangeToSelection = function(selection, range) {
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

// Programatically select a DOM element
RE.selectElementContents = function(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    // this.createSelectionFromRange sel, range
    RE.addRangeToSelection(sel, range);
};

RE.restorerange = function() {
    var selection = window.getSelection();
    selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(RE.currentSelection.startContainer, RE.currentSelection.startOffset);
    range.setEnd(RE.currentSelection.endContainer, RE.currentSelection.endOffset);
    selection.addRange(range);
};

RE.focus = function() {
    var range = document.createRange();
    range.selectNodeContents(RE.editor);
    range.collapse(false);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    RE.editor.blur();
    RE.editor.focus();
};

RE.focusAtPoint = function(x, y) {
    var range = document.caretRangeFromPoint(x, y) || document.createRange();
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    RE.editor.focus();
};

RE.blurFocus = function() {
    RE.editor.blur();
};

/**
Recursively search element ancestors to find a element nodeName e.g. A
**/
var _findNodeByNameInContainer = function(element, nodeName, rootElementId) {
    if (element.nodeName == nodeName) {
        return element;
    } else {
        if (element.id === rootElementId) {
            return null;
        }
        _findNodeByNameInContainer(element.parentElement, nodeName, rootElementId);
    }
};

var isAnchorNode = function(node) {
    return ("A" == node.nodeName);
};

RE.getAnchorTagsInNode = function(node) {
    var links = [];

    while (node.nextSibling !== null && node.nextSibling !== undefined) {
        node = node.nextSibling;
        if (isAnchorNode(node)) {
            links.push(node.getAttribute('href'));
        }
    }
    return links;
};

RE.countAnchorTagsInNode = function(node) {
    return RE.getAnchorTagsInNode(node).length;
};

/**
 * If the current selection's parent is an anchor tag, get the href.
 * @returns {string}
 */
RE.getSelectedHref = function() {
    var href, sel;
    href = '';
    sel = window.getSelection();
    if (!RE.rangeOrCaretSelectionExists()) {
        return null;
    }

    var tags = RE.getAnchorTagsInNode(sel.anchorNode);
    //if more than one link is there, return null
    if (tags.length > 1) {
        return null;
    } else if (tags.length == 1) {
        href = tags[0];
    } else {
        var node = _findNodeByNameInContainer(sel.anchorNode.parentElement, 'A', 'editor');
        if (node != undefined) {
            href = node.href;
        } else {
            return null;
        }
    }

    return href ? href : null;
};

// Returns the cursor position relative to its current position onscreen.
// Can be negative if it is above what is visible
RE.getRelativeCaretYPosition = function() {
    var y = 0;
    var sel = window.getSelection();
    if (sel.rangeCount) {
        var range = sel.getRangeAt(0);
        var needsWorkAround = (range.startOffset == 0)
        /* Removing fixes bug when node name other than 'div' */
        // && range.startContainer.nodeName.toLowerCase() == 'div');
        if (needsWorkAround) {
            y = range.startContainer.offsetTop - window.pageYOffset;
        } else {
            if (range.getClientRects) {
                var rects = range.getClientRects();
                if (rects.length > 0) {
                    y = rects[0].top;
                }
            }
        }
    }

    return y;
};

RE.editor.onkeydown = function(e) {
    if (e.keyCode == 13) { /* enter key */
        
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
            var range = selection.getRangeAt(0)
            var node = range.startContainer;
            
            var blockquote = parentBlockquoteNode(node);
            
            if (blockquote != null) {
                
                if (node.innerHTML === "<br>") {
                    /* this is an empty line within a blockquote - break out of blockquote on return */
                    
                    document.execCommand('insertHTML', false, "<br>");
                    document.execCommand('outdent', false, null);
                } else {
                    
                    var hasPContainer = false;
                    
                    var n = node;
                    do {
                        if (n.nodeName === "BLOCKQUOTE") {
                            break;
                        } else if (n.nodeName === "P") {
                            hasPContainer = true;
                        }
                    } while (n = n.parentElement);
                    
                    if (!hasPContainer) {
                        /* put the blockquote content within a p */
                        var htmlC = blockquote.innerHTML;
                        blockquote.innerHTML = "<p>" + htmlC + "</p>";
                    }
                    
                    /* create a new paragraph with a br in it */
                    var p = document.createElement("p")
                    
                    blockquote.appendChild(p);
                    
                    var br = document.createElement("br")
                    p.appendChild(br);
                    
                    range.collapse();
                    range.setStartAfter(br)
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                
                return false
            }
        }
    }
};

window.onload = function() {
    RE.callback("ready");
};

function getSelectedNodes() {
    // from https://developer.mozilla.org/en-US/docs/Web/API/Selection
    var selection = window.getSelection();
    if (selection.isCollapsed) {
        return [];
    };
    var node1 = selection.anchorNode;
    var node2 = selection.focusNode;
    var selectionAncestor = get_common_ancestor(node1, node2);
    if (selectionAncestor == null) {
        return [];
    }
    return getNodesBetween(selectionAncestor, node1, node2);
}

function get_common_ancestor(a, b)
{
    // from http://stackoverflow.com/questions/3960843/how-to-find-the-nearest-common-ancestors-of-two-or-more-nodes
    var parentsa = $(a).parents();
    var parentsb = $(b).parents();
    
    var found = null;
    
    parentsa.each(function() {
                   var thisa = this;
                   
                   parentsb.each(function() {
                                  if (thisa == this)
                                  {
                                  found = this;
                                  return false;
                                  }
                                  });
                   
                   if (found) return false;
                   });
    
    return found;
}

function isDescendant(parent, child) {
    // from http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
    var node = child;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

function getNodesBetween(rootNode, node1, node2) {
    var resultNodes = [];
    var isBetweenNodes = false;
    for (var i = 0; i < rootNode.childNodes.length; i+= 1) {
        if (isDescendant(rootNode.childNodes[i], node1) || isDescendant(rootNode.childNodes[i], node2)) {
            if (resultNodes.length == 0) {
                isBetweenNodes = true;
            } else {
                isBetweenNodes = false;
            }
            resultNodes.push(rootNode.childNodes[i]);
        } else if (resultNodes.length == 0) {
        } else if (isBetweenNodes) {
            resultNodes.push(rootNode.childNodes[i]);
        } else {
            return resultNodes;
        }
    };
    if (resultNodes.length == 0) {
        return [rootNode];
    } else if (isDescendant(resultNodes[resultNodes.length - 1], node1) || isDescendant(resultNodes[resultNodes.length - 1], node2)) {
        return resultNodes;
    } else {
        // same child node for both should never happen
        return [resultNodes[0]];
    }
}
