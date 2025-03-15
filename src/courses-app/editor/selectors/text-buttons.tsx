import { Button } from "../components/button";
import { cn } from "../lib/utils";
import { BoldIcon, CodeIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon, HighlighterIcon, LinkIcon } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import type { SelectorItem } from "./node-selector";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => editor!.isActive("bold"),
      command: (editor) => editor!.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: (editor) => editor!.isActive("italic"),
      command: (editor) => editor!.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: (editor) => editor!.isActive("underline"),
      command: (editor) => editor!.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: (editor) => editor!.isActive("strike"),
      command: (editor) => editor!.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "highlight",
      isActive: (editor) => editor!.isActive("highlight"),
      command: (editor) => editor!.chain().focus().toggleHighlight().run(),
      icon: HighlighterIcon,
    },
    {
      name: "code",
      isActive: (editor) => editor!.isActive("code"),
      command: (editor) => editor!.chain().focus().toggleCodeBlock().run(),
      icon: CodeIcon,
    },
    {
      name: "link",
      isActive: (editor) => editor!.isActive("link"),
      command: (editor) => {
        const { view, state } = editor!
        const { from, to } = view.state.selection
        const href = state.doc.textBetween(from, to, '')
        editor!.chain().focus().toggleLink({ href }).run()
      },
      icon: LinkIcon,
    },
  ];
  return (
    <div className="flex">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button size="sm" className="rounded-none" variant="ghost" type="button">
            <item.icon
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};