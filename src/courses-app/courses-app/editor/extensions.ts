import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import AutoJoiner from 'tiptap-extension-auto-joiner' // optional

export const defaultExtensions = [
    GlobalDragHandle.configure({
        dragHandleWidth: 20,    // default

        // The scrollTreshold specifies how close the user must drag an element to the edge of the lower/upper screen for automatic 
        // scrolling to take place. For example, scrollTreshold = 100 means that scrolling starts automatically when the user drags an 
        // element to a position that is max. 99px away from the edge of the screen
        // You can set this to 0 to prevent auto scrolling caused by this extension
        scrollTreshold: 100     // default
    }),
    AutoJoiner.configure({
        elementsToJoin: ["bulletList", "orderedList"] // default
    }),
    // other extensions
];