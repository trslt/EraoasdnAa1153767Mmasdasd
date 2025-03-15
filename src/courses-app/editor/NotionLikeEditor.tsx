/**
 * Riferimenti
 * 
 * Codice esempio editor https://github.com/steven-tey/novel/blob/main/apps/web/components/tailwind/advanced-editor.tsx
 * Estensioni di TipTap https://tiptap.dev/docs/editor/extensions/overview
 */
import { JSONContent } from '@tiptap/react'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Blockquote from '@tiptap/extension-blockquote'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Document from '@tiptap/extension-document'
import OrderedList from '@tiptap/extension-ordered-list'
import Heading from '@tiptap/extension-heading'
import CodeBlock from '@tiptap/extension-code-block'
import Youtube from '@tiptap/extension-youtube'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Code from '@tiptap/extension-code'
import History from '@tiptap/extension-history'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
//import CharacterCount from '@tiptap/extension-character-count'
import {
  EditorContent, EditorRoot, EditorBubble, EditorBubbleItem,
  EditorInstance, handleCommandNavigation, handleImagePaste,
  handleImageDrop, ImageResizer,
  EditorCommand, EditorCommandEmpty, EditorCommandList, EditorCommandItem
} from "novel";
import '../editor/style.scss'
import { useDebouncedCallback } from 'use-debounce';
import { uploadFn } from "./image-upload";
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import AutoJoiner from 'tiptap-extension-auto-joiner' // optional
import { slashCommand, suggestionItems } from "./slash-command";
import { TextButtons } from "./selectors/text-buttons";

type NotionLikeEditorProps = {
  contentProp?: JSONContent,
  onContentChange?: (content: JSONContent) => void
  onUpdateFn: Function,
  editable?: boolean
};
export default function NotionLikeEditor({ 
  contentProp,
  onContentChange,
  onUpdateFn,
  editable = false
}:
  NotionLikeEditorProps) {

  const extensions = [
    TaskList,
    Document,
    Paragraph,
    Text,
    TaskItem.configure({
      nested: true,
    }),
    Blockquote,
    BulletList.configure({
      itemTypeName: 'listItem',
    }),
    ListItem,
    OrderedList.configure({
      itemTypeName: 'listItem',
    }),
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
    slashCommand,
    Heading,
    CodeBlock,
    Youtube,
    Bold,
    Italic,
    Strike,
    Underline,
    TableRow,
    TableHeader,
    TableCell,
    Table,
    Code,
    History,
    Image,
    Highlight,
    Link.configure({
      openOnClick: false,
      linkOnPaste: false,
      autolink: true,
      defaultProtocol: 'https',
      protocols: ['http', 'https'],
      HTMLAttributes: {
        class: 'my-custom-class',
        // Change rel to different value
        // Allow search engines to follow links(remove nofollow)
        rel: 'noopener noreferrer',
      },
      isAllowedUri: (url, ctx) => {
        try {
          // construct URL
          const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

          // use default validation
          if (!ctx.defaultValidate(parsedUrl.href)) {
            return false
          }

          // disallowed protocols
          const disallowedProtocols = ['ftp', 'file', 'mailto']
          const protocol = parsedUrl.protocol.replace(':', '')

          if (disallowedProtocols.includes(protocol)) {
            return false
          }

          // only allow protocols specified in ctx.protocols
          const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

          if (!allowedProtocols.includes(protocol)) {
            return false
          }

          // disallowed domains
          const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
          const domain = parsedUrl.hostname

          if (disallowedDomains.includes(domain)) {
            return false
          }

          // all checks have passed
          return true
        } catch {
          return false
        }
      },
      shouldAutoLink: url => {
        try {
          // construct URL
          const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

          // only auto-link if the domain is not in the disallowed list
          const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
          const domain = parsedUrl.hostname

          return !disallowedDomains.includes(domain)
        } catch {
          return false
        }
      },

    }),
  ]

  const editorProps = {
    attributes: {
      class: ""
    }
  };

  const defaultContent: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Inizia a scrivere qui...',
          },
        ],
      },
    ]
  };

  const initialContent = contentProp && typeof contentProp === 'object' && contentProp.type
    ? contentProp
    : defaultContent;

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {

    const json = editor.getJSON();

    onUpdateFn && onUpdateFn(json);

    console.log("Editor aggiornato:", json);

  }, 750); // Ridotto il tempo di debounce per una risposta più immediata

  return (
    <>
      <EditorRoot>
        <EditorContent
          extensions={extensions}
          initialContent={initialContent}
          onUpdate={({ editor }) => debouncedUpdates(editor)}
          className='relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg tiptap'
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          slotAfter={<ImageResizer />}
          editable={editable}
        >
          <EditorBubble
            tippyOptions={{
              //placement: openAI ? "bottom-start" : "top",
              placement: "top",
            }}
            className='flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl'>
            {/* <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                  <LinkSelector open={openLink} onOpenChange={setOpenLink} /> */}
            <TextButtons />
            {/* <ColorSelector open={openColor} onOpenChange={setOpenColor} /> */}
          </EditorBubble>
        </EditorContent>
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command?.(val)}
                className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
      </EditorRoot>
    </>
  )
}
